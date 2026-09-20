import httpx
from datetime import datetime
import models
from core.wapi import WAPI_BASE, get_wapi_headers, get_wapi_instance, set_system_config
import pytz

BR_TZ = pytz.timezone('America/Sao_Paulo')

def verificar_status_whatsapp(db):
    """Verifica se o WhatsApp está conectado na W-API e salva o status."""
    try:
        instance_id = get_wapi_instance(db)
        headers = get_wapi_headers(db)
        
        if not instance_id or not headers.get("Authorization"):
            print("W-API: Configurações ausentes para verificação de status.")
            return

        url = f"{WAPI_BASE}/instance/status-instance?instanceId={instance_id}"
        
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers)
            
            status_ws = "desconectado"
            if response.status_code == 200:
                data = response.json()
                print(f"W-API Status Check Result: {data}")
                
                # Trata todas as variações conhecidas de resposta da W-API
                is_connected = (
                    data.get("connected") is True or
                    str(data.get("status", "")).upper() in ["CONNECTED", "ONLINE"] or
                    str(data.get("state", "")).upper() in ["CONNECTED", "ONLINE"] or
                    str(data.get("sessionStatus", "")).upper() in ["CONNECTED", "ONLINE"] or
                    (isinstance(data.get("instance"), dict) and (
                        str(data["instance"].get("status", "")).upper() in ["CONNECTED", "ONLINE"] or
                        data["instance"].get("connected") is True
                    ))
                )
                if is_connected:
                    status_ws = "conectado"
            
            # Obtém plano existente no banco (padrão PRO se não definido)
            existing_plan_cfg = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
            user_configured_plan = existing_plan_cfg.valor if (existing_plan_cfg and existing_plan_cfg.valor) else "PRO"

            plan_type = user_configured_plan

            # Se a configuração não for forçada para PRO, tenta auto-detectar na W-API
            if user_configured_plan != "PRO":
                try:
                    if response.status_code == 200:
                        resp_data = response.json()
                        inst_obj = resp_data.get("instance") if isinstance(resp_data.get("instance"), dict) else resp_data
                        p_val = str(inst_obj.get("planType") or inst_obj.get("plan") or inst_obj.get("plan_type") or "").upper()
                        if "PRO" in p_val or inst_obj.get("isPro") is True:
                            plan_type = "PRO"

                    url_instances = f"{WAPI_BASE}/instance/list-instances"
                    resp = client.get(url_instances, headers=headers)
                    if resp.status_code == 200:
                        data_inst = resp.json()
                        instances_list = data_inst if isinstance(data_inst, list) else (data_inst.get("instances") or data_inst.get("data") or [])
                        if isinstance(instances_list, list):
                            for inst in instances_list:
                                inst_id_val = str(inst.get("instanceId") or inst.get("id") or inst.get("instance_id") or "").strip().lower()
                                target_id_val = str(instance_id).strip().lower()
                                if inst_id_val and inst_id_val == target_id_val:
                                    p_val = str(inst.get("planType") or inst.get("plan") or inst.get("plan_type") or inst.get("tier") or "").upper()
                                    if "PRO" in p_val or inst.get("isPro") is True:
                                        plan_type = "PRO"
                                    break
                except Exception as e:
                    print(f"Erro ao verificar plano da W-API: {e}")

            set_system_config(db, "WHATSAPP_STATUS", status_ws)
            set_system_config(db, "WHATSAPP_PLAN_TYPE", plan_type)
            set_system_config(db, "WHATSAPP_LAST_CHECK", datetime.now(BR_TZ).isoformat())
            
            db.commit()
            print(f"W-API: Status do WhatsApp verificado: {status_ws}")

    except Exception as e:
        print(f"Erro ao verificar status do WhatsApp: {str(e)}")


def extrair_flag_fechado(obj: dict):
    """
    Inspeciona dicionários da W-API para determinar se o grupo está fechado (apenas admins conversam).
    No protocolo do WhatsApp Web / W-API:
    - announce = True -> Fechado (só admins)
    - announce = False -> Aberto (todos conversam)
    - onlyAdminsCanSendMessages = True -> Fechado
    - edit_group_settings / message_admins_only
    """
    if not isinstance(obj, dict):
        return None

    # Verifica chaves diretas
    for chave in ["announce", "isAnnounce", "onlyAdminsCanSendMessages", "message_admins_only"]:
        val = obj.get(chave)
        if val is not None:
            return bool(val)

    # Verifica se há nested 'group', 'groupMetadata' ou 'metadata'
    for nested_key in ["group", "groupMetadata", "metadata", "data"]:
        nested = obj.get(nested_key)
        if isinstance(nested, dict):
            res = extrair_flag_fechado(nested)
            if res is not None:
                return res

    return None


def fetch_participants(client, wapi_base, instance_id, group_id, headers):
    """
    Busca os participantes e determina se o grupo está Fechado (apenas admins) ou Aberto (todos).
    Retorna uma tupla (participants: list | None, is_closed: bool | None).
    """
    participants = None
    is_closed = None

    # Estratégias para obter participantes e metadados
    strategies = [
        {"method": "GET", "url": f"{wapi_base}/group/group-metadata", "params": {"instanceId": instance_id, "groupId": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/group-metadata", "params": {"instanceId": instance_id, "groupJid": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/get-group-info", "params": {"instanceId": instance_id, "groupId": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/get-group-info", "params": {"instanceId": instance_id, "groupJid": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/get-participants", "params": {"instanceId": instance_id, "groupId": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/get-participants", "params": {"instanceId": instance_id, "groupJid": group_id}},
        {"method": "POST", "url": f"{wapi_base}/group/get-participants", "json": {"instanceId": instance_id, "groupId": group_id}}
    ]

    for strategy in strategies:
        try:
            if strategy["method"] == "GET":
                resp = client.get(strategy["url"], params=strategy.get("params"), headers=headers)
            else:
                resp = client.post(strategy["url"], json=strategy.get("json"), headers=headers)

            if resp.status_code == 200:
                data = resp.json()
                print(f"W-API Sync DEBUG: Sucesso {strategy['url']} -> chaves: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                
                # Tenta extrair flag is_closed
                flag_found = extrair_flag_fechado(data)
                if flag_found is not None and is_closed is None:
                    is_closed = flag_found
                    print(f"W-API Sync DEBUG: Flag is_closed identificada como: {is_closed}")

                group_obj = data.get("group") or data.get("groupMetadata") or data if isinstance(data, dict) else {}
                parts = group_obj.get("participants") if isinstance(group_obj, dict) else None
                if parts is None and isinstance(data, dict):
                    parts = data.get("participants")
                if parts is None and isinstance(data, list):
                    parts = data

                if isinstance(parts, list) and participants is None:
                    participants = parts

                if participants is not None and is_closed is not None:
                    break
        except Exception as e:
            print(f"W-API Sync DEBUG: Falha {strategy['method']} {strategy['url']}: {e}")

    return participants, is_closed


def disparar_webhook_contato(webhook_url: str, contato: dict, grupo: dict) -> bool:
    """
    Envia dados de um contato para o webhook configurado no grupo.
    Retorna True se o envio foi bem-sucedido (status 2xx), ou False se falhou.
    """
    try:
        payload = {
            "nome": contato.get("nome") or contato.get("numero"),
            "numero": contato.get("numero"),
            "grupo": grupo.get("nome"),
            "grupo_jid": grupo.get("jid"),
            "extraido_em": datetime.now(BR_TZ).isoformat()
        }
        with httpx.Client(timeout=10.0) as wh_client:
            resp = wh_client.post(webhook_url, json=payload, headers={"Content-Type": "application/json"})
            if resp.status_code < 200 or resp.status_code >= 300:
                print(f"W-API Webhook: URL '{webhook_url}' retornou status {resp.status_code} para contato {contato.get('numero')}.")
                return False
            else:
                print(f"W-API Webhook: Contato {contato.get('numero')} enviado com sucesso para {webhook_url}.")
                return True
    except Exception as e:
        print(f"W-API Webhook: Erro ao disparar para '{webhook_url}': {e}")
        return False


def processar_participantes_grupo(
    db, client, instance_id, headers, grupo, participants, agora,
    group_is_closed=None, forcar_reenvio_webhook=False, retornar_detalhes=False
):
    """
    Processa participantes, atualiza o status de fechado/aberto do grupo,
    identifica admins não autorizados (somente se a boleana seguranca_adms_ativa for True E o grupo estiver fechado)
    e despacha webhooks.
    Se forcar_reenvio_webhook=True, reenvia para todos os contatos não-administradores mesmo se já enviados.
    """
    # Atualiza o status do grupo (fechado vs aberto) no banco se foi capturado da W-API
    if group_is_closed is not None:
        grupo.status_grupo_fechado = group_is_closed

    webhook_url = getattr(grupo, 'webhook_extracao_url', None)
    grupo_info = {"nome": grupo.nome, "jid": grupo.id_do_grupo}
    enviados_webhook_count = 0
    novos_contatos_count = 0

    # Parse da lista de admins permitidos
    adms_permitidos_raw = getattr(grupo, 'adms_permitidos', '') or ''
    adms_permitidos = [a.strip().replace('@s.whatsapp.net', '') for a in adms_permitidos_raw.split(',') if a.strip()]

    # A verificação da Lista de Segurança só roda se:
    # 1. A boleana 'seguranca_adms_ativa' estiver TRUE
    # 2. O grupo estiver FECHADO (status_grupo_fechado is True)
    # 3. Houver a lista de admins permitidos configurada
    seguranca_ativa = getattr(grupo, 'seguranca_adms_ativa', False) is True
    grupo_fechado = (getattr(grupo, 'status_grupo_fechado', None) is True) or (group_is_closed is True)

    deve_validar_seguranca = seguranca_ativa and grupo_fechado and len(adms_permitidos) > 0

    if seguranca_ativa and not grupo_fechado:
        print(f"W-API SEGURANÇA: Grupo '{grupo.nome}' está ABERTO. Validação da Lista de Segurança omitida conforme regra de negócio.")

    for p in participants:
        try:
            p_numero = str(p.get("phone") or p.get("phoneNumber") or p.get("id") or p.get("user") or p.get("number") or "").strip()
            if not p_numero: continue
            if "@" in p_numero:
                p_numero = p_numero.split("@")[0]

            p_nome = p.get("name") or p.get("short") or p.get("pushname") or p.get("verifiedName") or p.get("notify") or p_numero
            p_admin = (
                p.get("admin") in ["admin", "superadmin"] or 
                p.get("isAdmin") is True or 
                p.get("isSuperAdmin") is True
            )

            # Validação da Lista de Segurança de Admins
            if deve_validar_seguranca and p_admin:
                if p_numero not in adms_permitidos:
                    # Registra Alerta no Histórico de Disparos/Logs (Apenas alerta, sem rebaixar ou remover)
                    log_alerta = models.LogDisparo(
                        cliente_id=grupo.cliente_id,
                        grupo_nome=grupo.nome,
                        mensagem_corpo=f"🚨 ALERTA DE SEGURANÇA: Administrador não cadastrado na lista de segurança detectado em grupo fechado ({p_nome} - {p_numero})",
                        status="ALERTA",
                        detalhes_erro=f"O grupo está FECHADO e o número {p_numero} foi identificado como administrador sem constar na lista de segurança pré-aprovada.",
                        tipo="seguranca_adm",
                        criado_em=agora
                    )
                    db.add(log_alerta)

            contato_db = db.query(models.ContatoGrupo).filter_by(numero=p_numero, jid_grupo=grupo.id_do_grupo).first()
            if not contato_db:
                contato_db = models.ContatoGrupo(
                    cliente_id=grupo.cliente_id,
                    nome=p_nome, numero=p_numero, jid_grupo=grupo.id_do_grupo,
                    nome_grupo=grupo.nome, no_grupo=True,
                    is_admin=p_admin,
                    extraido_em=agora,
                    webhook_enviado=False
                )
                db.add(contato_db)
                db.flush()
                novos_contatos_count += 1
            else:
                if p_nome: contato_db.nome = p_nome
                contato_db.no_grupo = True
                contato_db.is_admin = p_admin
                if grupo.cliente_id: contato_db.cliente_id = grupo.cliente_id

            # Dispara webhook se configurado, o contato NÃO for Admin e (ainda NÃO tiver sido enviado com sucesso OU forçado reenvio)
            deve_enviar_webhook = webhook_url and not p_admin and (forcar_reenvio_webhook or not getattr(contato_db, 'webhook_enviado', False))
            if deve_enviar_webhook:
                ok = disparar_webhook_contato(webhook_url, {"nome": p_nome, "numero": p_numero}, grupo_info)
                if ok:
                    contato_db.webhook_enviado = True
                    contato_db.webhook_enviado_em = agora
                    enviados_webhook_count += 1
        except Exception as ep:
            print(f"Erro participante {p.get('id')}: {ep}")

    if retornar_detalhes:
        return {"novos": novos_contatos_count, "webhooks": enviados_webhook_count}
    return novos_contatos_count


def atualizar_contagem_contatos(db):
    """Busca grupos ativos e sincroniza contatos via W-API."""
    try:
        instance_id = get_wapi_instance(db)
        headers = get_wapi_headers(db)
        if not instance_id or not headers.get("Authorization"):
            print("W-API Sync: Configurações ausentes.")
            return

        grupos_ativos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.ativo == True).all()
        print(f"W-API Sync: Iniciando atualização sequencial para {len(grupos_ativos)} grupos ativos.")

        agora = datetime.now(BR_TZ).replace(tzinfo=None)

        for grupo in grupos_ativos:
            try:
                # Verifica se a extração está desabilitada para o grupo
                if getattr(grupo, 'extrair_contatos', True) is False:
                    print(f"W-API Sync: Extração de contatos DESABILITADA para o grupo '{grupo.nome}'. Pulando.")
                    continue

                # Verifica o intervalo de extração em minutos
                intervalo = getattr(grupo, 'intervalo_extracao_minutos', 30) or 30
                ultima = getattr(grupo, 'ultima_extracao_em', None)
                if ultima:
                    minutos_decorridos = (agora - ultima).total_seconds() / 60.0
                    if minutos_decorridos < intervalo:
                        print(f"W-API Sync: Grupo '{grupo.nome}' extraído há {int(minutos_decorridos)}min (intervalo: {intervalo}min). Pulando.")
                        continue

                print(f"W-API Sync: Processando grupo '{grupo.nome}' ({grupo.id_do_grupo})...")
                
                with httpx.Client(timeout=30.0) as client:
                    participants, is_closed = fetch_participants(client, WAPI_BASE, instance_id, grupo.id_do_grupo, headers)
                    
                    if participants is None:
                        print(f"W-API Sync: Não foi possível obter participantes para {grupo.nome}.")
                        continue
                    
                    grupo.quantidade_contatos = len(participants)
                    grupo.ultima_extracao_em = agora

                    # Link de convite
                    if not grupo.link_convite:
                        try:
                            params_inv = {"instanceId": instance_id, "groupId": grupo.id_do_grupo}
                            resp_invite = client.get(f"{WAPI_BASE}/group/invite-code", params=params_inv, headers=headers)
                            if resp_invite.status_code != 200:
                                resp_invite = client.get(f"{WAPI_BASE}/group/get-invite-code", params=params_inv, headers=headers)

                            if resp_invite.status_code == 200:
                                data_invite = resp_invite.json()
                                invite_url = data_invite.get("inviteUrl") or data_invite.get("inviteCode") or data_invite.get("code")
                                if invite_url:
                                    if not invite_url.startswith("http"):
                                        invite_url = f"https://chat.whatsapp.com/{invite_url}"
                                    grupo.link_convite = invite_url
                        except Exception as e_invite:
                            print(f"W-API Sync: Erro convite {grupo.nome}: {e_invite}")

                    # Sincroniza contatos
                    db.query(models.ContatoGrupo).filter_by(jid_grupo=grupo.id_do_grupo).update({"no_grupo": False})
                    db.commit()

                    novos_contatos_count = processar_participantes_grupo(db, client, instance_id, headers, grupo, participants, agora, is_closed)
                    db.commit()

                    # Salva log de sucesso no Histórico
                    log_sucesso = models.LogDisparo(
                        cliente_id=grupo.cliente_id,
                        grupo_nome=grupo.nome,
                        mensagem_corpo=f"Extração de contatos realizada ({len(participants)} contatos encontrados, {novos_contatos_count} novos)",
                        status="SUCESSO",
                        tipo="extracao_contatos",
                        criado_em=agora
                    )
                    db.add(log_sucesso)
                    db.commit()
                    import time
                    time.sleep(2)

            except Exception as e:
                print(f"W-API Sync: Falha grupo {grupo.nome}: {e}")
                db.rollback()
                try:
                    log_err = models.LogDisparo(
                        cliente_id=grupo.cliente_id,
                        grupo_nome=grupo.nome,
                        mensagem_corpo="Falha na extração de contatos do grupo",
                        status="ERRO",
                        detalhes_erro=str(e),
                        tipo="extracao_contatos",
                        criado_em=agora
                    )
                    db.add(log_err)
                    db.commit()
                except Exception:
                    db.rollback()

    except Exception as e:
        print(f"W-API Sync: Erro geral: {str(e)}")

def extrair_e_salvar_contatos(db, grupo):
    """Extrai e salva contatos para um grupo específico (chamado pelo consumidor da fila)."""
    try:
        instance_id = get_wapi_instance(db)
        headers = get_wapi_headers(db)
        if not instance_id or not headers.get("Authorization"):
            return False

        if getattr(grupo, 'extrair_contatos', True) is False:
            return False

        agora = datetime.now(BR_TZ).replace(tzinfo=None)

        with httpx.Client(timeout=30.0) as client:
            participants, is_closed = fetch_participants(client, WAPI_BASE, instance_id, grupo.id_do_grupo, headers)
            if participants is None:
                return False

            grupo.quantidade_contatos = len(participants)
            grupo.ultima_extracao_em = agora

            if not grupo.link_convite:
                try:
                    params_inv = {"instanceId": instance_id, "groupId": grupo.id_do_grupo}
                    resp_invite = client.get(f"{WAPI_BASE}/group/invite-code", params=params_inv, headers=headers)
                    if resp_invite.status_code != 200:
                        resp_invite = client.get(f"{WAPI_BASE}/group/get-invite-code", params=params_inv, headers=headers)
                    if resp_invite.status_code == 200:
                        data_invite = resp_invite.json()
                        invite_url = data_invite.get("inviteUrl") or data_invite.get("inviteCode") or data_invite.get("code")
                        if invite_url:
                            if not invite_url.startswith("http"):
                                invite_url = f"https://chat.whatsapp.com/{invite_url}"
                            grupo.link_convite = invite_url
                except Exception:
                    pass

            db.query(models.ContatoGrupo).filter_by(jid_grupo=grupo.id_do_grupo).update({"no_grupo": False})
            db.commit()

            novos_count = processar_participantes_grupo(db, client, instance_id, headers, grupo, participants, agora, is_closed)
            db.commit()

            log_sucesso = models.LogDisparo(
                cliente_id=grupo.cliente_id,
                grupo_nome=grupo.nome,
                mensagem_corpo=f"Extração de contatos realizada ({len(participants)} contatos encontrados, {novos_count} novos)",
                status="SUCESSO",
                tipo="extracao_contatos",
                criado_em=agora
            )
            db.add(log_sucesso)
            db.commit()
            return True
    except Exception as e:
        print(f"W-API Sync: Erro ao extrair {grupo.nome}: {e}")
        db.rollback()
        return False
