import httpx
import time
from datetime import datetime
import models
from core.wapi import WAPI_BASE, ENDPOINT_MAP, get_wapi_headers, get_wapi_instance
import pytz
from core.logger import logger

BR_TZ = pytz.timezone('America/Sao_Paulo')


def simular_digitando(grupo_jid: str, instance_id: str, headers: dict, segundos: int):
    """Envia presence 'composing' (digitando) por N segundos antes do disparo."""
    if not segundos or segundos <= 0:
        return
    try:
        presence_url = f"{WAPI_BASE}/chat/update-presence?instanceId={instance_id}"
        payload_composing = {"phone": grupo_jid, "presence": "composing"}
        httpx.post(presence_url, json=payload_composing, headers=headers, timeout=10)
        logger.info(f"[DIGITANDO] '{grupo_jid}' simulando digitando por {segundos}s")
        time.sleep(segundos)
        payload_paused = {"phone": grupo_jid, "presence": "paused"}
        httpx.post(presence_url, json=payload_paused, headers=headers, timeout=10)
    except Exception as e:
        logger.warning(f"[DIGITANDO] Falha ao simular presence para {grupo_jid}: {e}")


def registrar_log(db, grupo_nome, mensagem_corpo, status, detalhes_erro=None, msg_id=None, tipo=None, cliente_id=None):
    log = models.LogDisparo(
        cliente_id=cliente_id,
        grupo_nome=grupo_nome,
        mensagem_corpo=mensagem_corpo,
        status=status,
        detalhes_erro=detalhes_erro,
        mensagem_id=msg_id,
        tipo=tipo,
        criado_em=datetime.now(BR_TZ).replace(tzinfo=None)
    )
    db.add(log)
    db.commit()

def montar_payload(grupo, msg):
    """Monta o payload correto para cada tipo de mensagem."""
    base = {
        "phone": grupo.id_do_grupo,
        "delayMessage": 5,
    }

    tipo = msg.tipo_de_mensagem or "texto"

    if tipo == "texto":
        base["message"] = msg.mensagem
    elif tipo == "imagem":
        base["image"] = msg.link_midia
        if msg.mensagem:
            base["caption"] = msg.mensagem
    elif tipo == "video":
        base["video"] = msg.link_midia
        if msg.mensagem:
            base["caption"] = msg.mensagem
    elif tipo == "audio":
        base["audio"] = msg.link_midia
        base["ptt"] = True 
    elif tipo == "arquivo" or tipo == "documento":
        base["document"] = msg.link_midia
        raw_fname = msg.link_midia.split("/")[-1].split("?")[0] if msg.link_midia else "arquivo.pdf"
        if "." not in raw_fname:
            raw_fname += ".pdf"
        base["fileName"] = raw_fname
        base["filename"] = raw_fname
        base["extension"] = raw_fname.rsplit(".", 1)[-1].lower()
        if raw_fname.lower().endswith(".pdf"):
            base["mimetype"] = "application/pdf"
        if msg.mensagem:
            base["caption"] = msg.mensagem
    elif tipo == "enquete":
        base["message"] = msg.mensagem 
        base["delayMessage"] = 5
        if msg.opcoes_enquete:
            base["poll"] = [opt.strip() for opt in msg.opcoes_enquete.split('\n') if opt.strip()]
        else:
            base["poll"] = ["Sim", "Não"]
        
        if hasattr(msg, 'enquete_multipla') and msg.enquete_multipla:
            base["pollMaxOptions"] = 0
        else:
            base["pollMaxOptions"] = 1
    elif tipo == "nome_grupo":
        payload_custom = {
            "groupId": grupo.id_do_grupo,
            "groupName": msg.mensagem
        }
        return payload_custom, tipo
    elif tipo in ["status_grupo", "abrir_fechar_grupo"]:
        val_midia = (getattr(msg, 'link_midia', '') or '').lower().strip()
        val_msg = (getattr(msg, 'mensagem', '') or '').lower().strip()
        
        if val_midia in ["fechar", "abrir"]:
            is_fechar = (val_midia == "fechar")
        else:
            is_fechar = ("fechar" in val_msg or "close" in val_msg or "fechado" in val_msg or "announcement" in val_msg)

        optional_text = ""
        if val_msg and val_msg not in ["fechar", "abrir", "close", "open"]:
            optional_text = getattr(msg, 'mensagem', '') or ''

        payload_custom = {
            "groupId": grupo.id_do_grupo,
            "adminOnlyMessage": is_fechar,
            "_optional_text": optional_text
        }
        return payload_custom, "status_grupo"

    else:
        base["message"] = msg.mensagem

    return base, tipo


def enviar_wapi(grupo, msg, db, sender_name="Disparo Automático", sender_number="Sistema"):
    """Envia a mensagem diretamente para o grupo via W-API."""
    cid = getattr(grupo, 'cliente_id', None) or getattr(msg, 'cliente_id', None)
    
    # Se o grupo tiver cliente_id, podemos buscar as credenciais daquele cliente
    instance_id = None
    wapi_headers = None
    if cid:
        cliente = db.query(models.Cliente).filter(models.Cliente.id == cid).first()
        if cliente:
            instance_id = cliente.wapi_instance_id
            if cliente.wapi_token:
                wapi_headers = {"Authorization": f"Bearer {cliente.wapi_token}", "Content-Type": "application/json"}
    
    if not instance_id:
        instance_id = get_wapi_instance(db)
    if not wapi_headers:
        wapi_headers = get_wapi_headers(db)

    if not instance_id:
        detalhes = "WAPI_INSTANCE_ID não configurado"
        registrar_log(db, grupo.nome, msg.mensagem or msg.tipo_de_mensagem, "Erro", detalhes, tipo=msg.tipo_de_mensagem, cliente_id=cid)
        return False, detalhes

    payload, tipo = montar_payload(grupo, msg)
    optional_text = ""
    if tipo == "status_grupo" and isinstance(payload, dict):
        optional_text = payload.pop("_optional_text", "")

    endpoint = ENDPOINT_MAP.get(tipo, "/message/send-text")

    # Simular "digitando..." antes de enviar (apenas para mensagens, não para ações de grupo)
    TIPOS_SEM_DIGITANDO = {"status_grupo", "nome_grupo", "abrir_fechar_grupo"}
    segundos_digitando = getattr(grupo, 'tempo_digitando_segundos', 0) or 0
    if segundos_digitando > 0 and tipo not in TIPOS_SEM_DIGITANDO:
        simular_digitando(grupo.id_do_grupo, instance_id, wapi_headers, segundos_digitando)

    if "{id}" in endpoint:
        path = endpoint.replace("{id}", instance_id)
        url = f"{WAPI_BASE}{path}"
    else:
        url = f"{WAPI_BASE}{endpoint}?instanceId={instance_id}"

    try:
        response = httpx.post(url, json=payload, headers=wapi_headers, timeout=30)
        if response.status_code in (200, 201):
            data = response.json()
            registrar_log(db, grupo.nome, msg.mensagem or msg.tipo_de_mensagem, "Sucesso", msg_id=msg.id if hasattr(msg, 'id') else None, tipo=msg.tipo_de_mensagem, cliente_id=cid)

            # Se for alteracao de status e houver mensagem de texto opcional configurada, dispara o texto no grupo
            if tipo == "status_grupo" and optional_text.strip():
                try:
                    import time
                    time.sleep(1)
                    msg_texto = models.MensagemDisparada(
                        mensagem=optional_text.strip(),
                        tipo_de_mensagem="texto"
                    )
                    enviar_wapi(grupo, msg_texto, db, sender_name, sender_number)
                except Exception as ex_opt:
                    logger.error(f"Erro ao enviar texto opcional apos alteracao do grupo: {ex_opt}")

            
            try:
                whatsapp_id = None
                if isinstance(data, dict):
                    whatsapp_id = (
                        data.get("id") or 
                        data.get("messageId") or 
                        data.get("key", {}).get("id") or
                        data.get("data", {}).get("id") or
                        data.get("response", {}).get("id")
                    )
                
                tipo_m = getattr(msg, 'tipo_de_mensagem', None) or getattr(msg, 'tipo', None) or "texto"
                conteudo = getattr(msg, 'mensagem', '') or ''
                link_m = getattr(msg, 'link_midia', None)

                media_url = None
                media_type = None
                if tipo_m == "nome_grupo":
                    conteudo = f"[Nome do Grupo Alterado para: {conteudo}]"
                elif tipo_m in ["status_grupo", "abrir_fechar_grupo"]:
                    val = (conteudo or "").lower().strip()
                    is_fechar = ("fechar" in val or "close" in val or "fechado" in val or "announcement" in val)
                    acao_str = "Fechado (Apenas Admins)" if is_fechar else "Aberto (Todos enviam)"
                    conteudo = f"[Status do Grupo: {acao_str}]"
                    media_type = "status_grupo"
                elif tipo_m == "enquete":

                    media_type = "enquete"
                    opcoes_raw = getattr(msg, 'opcoes_enquete', None) or (payload.get("poll") if isinstance(payload, dict) else None)
                    if isinstance(opcoes_raw, list):
                        media_url = "|".join([str(o).strip() for o in opcoes_raw if str(o).strip()])
                    elif isinstance(opcoes_raw, str) and opcoes_raw.strip():
                        arr = [opt.strip() for opt in opcoes_raw.split('\n') if opt.strip()]
                        media_url = "|".join(arr)
                    else:
                        media_url = "Sim|Não"
                elif tipo_m in ["imagem", "video", "audio", "arquivo", "documento"]:
                    media_url = link_m
                    media_type = "imagem" if tipo_m == "imagem" else "video" if tipo_m == "video" else "audio" if tipo_m == "audio" else "arquivo"

                ja_existe = False
                if whatsapp_id:
                    ja_existe = db.query(models.MensagemCapturada).filter(
                        models.MensagemCapturada.message_id == whatsapp_id
                    ).first() is not None

                if not ja_existe:
                    msg_cap = models.MensagemCapturada(
                        cliente_id=cid,
                        message_id=whatsapp_id,
                        from_me=True,
                        sender_name=sender_name,
                        sender_number=sender_number,
                        message_content=conteudo,
                        media_url=media_url,
                        media_type=media_type,
                        group_jid=grupo.id_do_grupo,
                        group_name=grupo.nome,
                        timestamp=datetime.now(BR_TZ).replace(tzinfo=None)
                    )
                    db.add(msg_cap)
                    db.commit()
            except Exception as cap_err:
                print(f"Erro ao salvar mensagem em MensagemCapturada: {cap_err}")

            return True, data
        else:
            raw_error = response.text[:1000]
            detalhes = f"HTTP {response.status_code}: {raw_error}"
            print(f"Erro W-API: {detalhes}")
            registrar_log(db, grupo.nome, msg.mensagem or msg.tipo_de_mensagem, "Erro", detalhes, msg_id=msg.id if hasattr(msg, 'id') else None, tipo=msg.tipo_de_mensagem, cliente_id=cid)
            return False, detalhes
    except Exception as e:
        detalhes = str(e)
        registrar_log(db, grupo.nome, msg.mensagem or msg.tipo_de_mensagem, "Erro", detalhes, msg_id=msg.id if hasattr(msg, 'id') else None, tipo=msg.tipo_de_mensagem, cliente_id=cid)
        return False, detalhes
