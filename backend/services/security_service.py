import httpx
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
import models
from core.wapi import WAPI_BASE, get_wapi_headers, get_wapi_instance
import pytz
from core.logger import logger

BR_TZ = pytz.timezone('America/Sao_Paulo')

DEFAULT_MENSAGEM_REMOCAO = "🚫 [ALERTA DE SEGURANÇA] O participante @{numero} enviou uma mensagem em grupo fechado sem autorização e foi removido do grupo. Motivo: Violação das regras de comunicação."

def processar_mensagem_seguranca_grupo(
    db: Session,
    group_jid: str,
    sender_number: str,
    sender_name: str,
    message_id: str = None,
    cid: uuid.UUID = None
) -> dict:
    """
    Avalia em tempo real se uma mensagem enviada em um grupo viola a política de Grupo Fechado:
    1. Localiza o grupo pelo JID.
    2. Checa se o grupo está ativo, fechado (status_grupo_fechado is True) e com seguranca_adms_ativa is True.
    3. Verifica se o sender_number consta na lista de administradores permitidos (adms_permitidos).
    4. Se for invasor/não autorizado:
       - Deleta a mensagem para todos (se plano PRO).
       - Remove o participante do grupo via W-API.
       - Envia uma mensagem pré-pronta no grupo explicando a remoção.
       - Registra um LogDisparo com tipo='seguranca_impostor_msg'.
    """
    if not group_jid or not sender_number:
        return {"action_taken": False, "reason": "missing_params"}

    # Ignora mensagens do próprio bot
    if sender_number in ["Você", "Bot", "Sistema"]:
        return {"action_taken": False, "reason": "is_bot"}

    # Limpa número do remetente
    sender_num_clean = str(sender_number).replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0].strip()
    sender_num_clean_digits = ''.join(filter(str.isdigit, sender_num_clean))

    query = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id_do_grupo == group_jid)
    if cid:
        query = query.filter(models.GrupoWhatsApp.cliente_id == cid)
    grupo = query.first()

    if not grupo:
        return {"action_taken": False, "reason": "group_not_found"}

    # Se a lista de segurança não estiver ativa para este grupo, ignora
    if not getattr(grupo, 'seguranca_adms_ativa', False):
        return {"action_taken": False, "reason": "security_disabled"}

    # Se o grupo não estiver fechado, membros podem falar normalmente
    if getattr(grupo, 'status_grupo_fechado', None) is not True:
        return {"action_taken": False, "reason": "group_is_open"}

    # Processa administradores permitidos
    adms_raw = getattr(grupo, 'adms_permitidos', '') or ''
    adms_permitidos = [
        ''.join(filter(str.isdigit, a.replace('@s.whatsapp.net', '').strip()))
        for a in adms_raw.split(',')
        if a.strip()
    ]

    # Se não houver administradores configurados na lista, não toma ações destrutivas sem referência
    if not adms_permitidos:
        return {"action_taken": False, "reason": "no_allowed_admins_configured"}

    # Se o remetente ESTIVER na lista de administradores permitidos -> Liberado!
    if sender_num_clean_digits in adms_permitidos or sender_num_clean in adms_permitidos:
        return {"action_taken": False, "reason": "sender_is_authorized_admin"}

    # =========================================================================
    # INVASOR DETECTADO: Grupo Fechado + Remetente NÃO Autorizado
    # =========================================================================
    logger.warning(
        f"[SEGURANÇA] Invasor detectado em grupo fechado '{grupo.nome}' ({group_jid}): "
        f"Número {sender_num_clean_digits} ({sender_name}) enviou mensagem sem permissão."
    )

    agora = datetime.now(BR_TZ).replace(tzinfo=None)
    instance_id = None
    headers = None

    # Obtém credenciais da W-API
    if grupo.cliente_id:
        cliente = db.query(models.Cliente).filter(models.Cliente.id == grupo.cliente_id).first()
        if cliente:
            instance_id = cliente.wapi_instance_id
            if cliente.wapi_token:
                headers = {"Authorization": f"Bearer {cliente.wapi_token}", "Content-Type": "application/json"}

    if not instance_id:
        instance_id = get_wapi_instance(db)
    if not headers:
        headers = get_wapi_headers(db)

    if not instance_id or not headers:
        logger.error("[SEGURANÇA] Falha ao executar ação de segurança: W-API não configurada.")
        return {"action_taken": False, "reason": "wapi_not_configured"}

    # Checagem de plano PRO da W-API
    plan_config = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
    is_pro = (plan_config.valor if plan_config else "LITE") == "PRO"

    acoes_executadas = []

    with httpx.Client(timeout=15.0) as client:
        # 1. DELEÇÃO DA MENSAGEM DO IMPOSTOR (Se PRO e message_id disponível)
        if message_id and is_pro:
            try:
                full_msg_id = message_id if "_" in message_id else f"false_{group_jid}_{message_id}"
                del_payload = {"messageId": full_msg_id, "forEveryone": True}
                del_url = f"{WAPI_BASE}/message/delete?instanceId={instance_id}"
                resp_del = client.post(del_url, json=del_payload, headers=headers)
                if resp_del.status_code in (200, 201):
                    acoes_executadas.append("mensagem_deletada")
                    logger.info(f"[SEGURANÇA] Mensagem {message_id} revogada para todos no grupo '{grupo.nome}'.")
            except Exception as e_del:
                logger.error(f"[SEGURANÇA] Erro ao deletar mensagem do invasor: {e_del}")

        # 2. REMOÇÃO DO PARTICIPANTE DO GRUPO (Se habilitado no grupo)
        deve_remover = getattr(grupo, 'remover_impostor_msg', True) is not False
        if deve_remover:
            try:
                rem_payload = {
                    "groupId": group_jid,
                    "phone": f"{sender_num_clean_digits}@s.whatsapp.net",
                    "participants": [f"{sender_num_clean_digits}@s.whatsapp.net"]
                }
                # Tenta endpoints de remoção da W-API
                rem_urls = [
                    f"{WAPI_BASE}/group/remove-participant?instanceId={instance_id}",
                    f"{WAPI_BASE}/group/remove-participants?instanceId={instance_id}"
                ]
                removido = False
                for r_url in rem_urls:
                    try:
                        resp_rem = client.request("DELETE", r_url, json=rem_payload, headers=headers)
                        if resp_rem.status_code in (200, 201, 204):
                            removido = True
                            break
                        else:
                            # Tenta via POST caso a rota espere POST
                            resp_rem_post = client.post(r_url, json=rem_payload, headers=headers)
                            if resp_rem_post.status_code in (200, 201, 204):
                                removido = True
                                break
                    except Exception:
                        pass

                if removido:
                    acoes_executadas.append("participante_removido")
                    logger.info(f"[SEGURANÇA] Participante {sender_num_clean_digits} REMOVIDO com sucesso do grupo '{grupo.nome}'.")
                    # Marca como fora do grupo na base local
                    db.query(models.ContatoGrupo).filter_by(
                        numero=sender_num_clean_digits,
                        jid_grupo=group_jid
                    ).update({"no_grupo": False})
                    db.commit()
                else:
                    logger.warning(f"[SEGURANÇA] Não foi possível remover o participante {sender_num_clean_digits} via W-API.")
            except Exception as e_rem:
                logger.error(f"[SEGURANÇA] Erro ao tentar remover participante {sender_num_clean_digits}: {e_rem}")

        # 3. ENVIO DA MENSAGEM DE ALERTA NO GRUPO
        template_msg = getattr(grupo, 'msg_remocao_impostor', None) or DEFAULT_MENSAGEM_REMOCAO
        texto_alerta = template_msg.replace('{numero}', sender_num_clean_digits).replace('{nome}', sender_name or 'Participante')

        try:
            send_payload = {
                "phone": group_jid,
                "message": texto_alerta,
                "delayMessage": 1
            }
            send_url = f"{WAPI_BASE}/message/send-text?instanceId={instance_id}"
            resp_send = client.post(send_url, json=send_payload, headers=headers)
            if resp_send.status_code in (200, 201):
                acoes_executadas.append("mensagem_alerta_enviada")
                logger.info(f"[SEGURANÇA] Mensagem de alerta enviada no grupo '{grupo.nome}'.")
        except Exception as e_send:
            logger.error(f"[SEGURANÇA] Erro ao enviar mensagem de aviso no grupo: {e_send}")

    # 4. REGISTRO DE AUDITORIA NO LOG
    log_seguranca = models.LogDisparo(
        cliente_id=grupo.cliente_id,
        grupo_nome=grupo.nome,
        mensagem_corpo=f"🚨 ALERTA DE SEGURANÇA: Mensagem não autorizada detectada ({sender_name} - {sender_num_clean_digits}). Ações: {', '.join(acoes_executadas)}",
        status="ALERTA",
        detalhes_erro=f"O grupo está FECHADO e o participante {sender_num_clean_digits} enviou mensagem sem constar na lista de segurança. Ações tomadas: {acoes_executadas}.",
        tipo="seguranca_impostor_msg",
        criado_em=agora
    )
    db.add(log_seguranca)
    db.commit()

    return {
        "action_taken": True,
        "impostor": sender_num_clean_digits,
        "acoes": acoes_executadas
    }
