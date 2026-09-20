import httpx
import json
import base64
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
import pytz
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

from core.logger import logger
import models

BR_TZ = pytz.timezone("America/Sao_Paulo")


def decriptar_voto_enquete(
    poll_msg_id: str,
    secret_b64: str,
    enc_iv_b64: str,
    enc_payload_b64: str,
    creator_jids: List[Optional[str]],
    voter_jids: List[Optional[str]],
    todas_opcoes: List[str]
) -> List[str]:
    """
    Decripta os votos de enquetes do WhatsApp usando HKDF (SHA256) e AES-GCM,
    comparando os hashes das opções com os bytes descriptografados.
    """
    try:
        secret = base64.b64decode(secret_b64)
        enc_iv = base64.b64decode(enc_iv_b64)
        enc_payload = base64.b64decode(enc_payload_b64)
    except Exception as e:
        logger.warning(f"[ENQUETE WEBHOOK] Erro ao decodificar base64 do voto: {e}")
        return []

    # Filtra e limpa JIDs candidatos
    c_candidates = list(dict.fromkeys([c.split(":")[0] for c in creator_jids if c]))
    v_candidates = list(dict.fromkeys([v.split(":")[0] for v in voter_jids if v]))

    for c in c_candidates:
        for v in v_candidates:
            use_case = poll_msg_id.encode() + c.encode() + v.encode() + b"Poll Vote"
            try:
                hkdf = HKDF(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=None,
                    info=use_case,
                )
                key = hkdf.derive(secret)
                add_data = f"{poll_msg_id}\x00{v}".encode()
                aesgcm = AESGCM(key)
                decrypted = aesgcm.decrypt(enc_iv, enc_payload, add_data)
                
                # Se decriptou com sucesso:
                opcoes_marcadas = []
                for opt in todas_opcoes:
                    opt_hash = hashlib.sha256(opt.encode()).digest()
                    if opt_hash in decrypted:
                        opcoes_marcadas.append(opt)
                return opcoes_marcadas
            except Exception:
                continue
    return []


def extrair_dados_voto_enquete(
    msg: dict,
    db: Session,
    cid: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    Identifica se a mensagem/payload contém um voto ou interação de enquete
    e extrai os dados relevantes de forma estruturada.
    """
    try:
        message_dict = msg.get("message") or msg.get("msgContent") or {}
        msg_type = (msg.get("type") or msg.get("messageType") or "").lower()

        # Suporte a variantes do W-API: pollCreationMessageV2, pollCreationMessageV3, pollCreationMessage
        poll_create_key = next((k for k in message_dict if k.startswith("pollCreationMessage")), None)
        poll_update_key = next((k for k in message_dict if k.startswith("pollUpdateMessage")), None)

        poll_update = (
            (message_dict.get(poll_update_key) if poll_update_key else None)
            or message_dict.get("pollVoteMessage")
            or msg.get("pollUpdateMessage")
            or msg.get("pollVoteMessage")
            or msg.get("pollUpdate")
            or msg.get("vote")
        )

        poll_creation = (
            (message_dict.get(poll_create_key) if poll_create_key else None)
            or msg.get("pollCreationMessage")
            or msg.get("pollCreationMessageV3")
            or msg.get("pollCreationMessageV2")
        )

        # Se for um evento ou payload direto de voto de enquete
        is_poll_vote = bool(
            poll_update
            or msg_type in ["poll_vote", "pollupdate", "pollupdatemessage", "poll_response", "poll_vote_update"]
            or "pollupdatemessage" in msg_type
        )

        if not is_poll_vote and not poll_creation:
            return None

        # Identifica o ID da enquete original
        poll_msg_id = None
        if poll_update and isinstance(poll_update, dict):
            poll_key = poll_update.get("pollCreationMessageKey") or poll_update.get("messageKey") or {}
            if isinstance(poll_key, dict):
                poll_msg_id = poll_key.get("ID") or poll_key.get("id") or poll_key.get("messageId")
            elif isinstance(poll_key, str):
                poll_msg_id = poll_key

        if not poll_msg_id:
            poll_msg_id = msg.get("key", {}).get("id") or msg.get("id") or msg.get("messageId")

        # Identifica o participante/votante
        sender_info = msg.get("sender") or {}
        sender_jid = (
            msg.get("key", {}).get("participant")
            or msg.get("participant")
            or sender_info.get("id")
            or msg.get("sender_number")
            or ""
        )
        sender_number = sender_jid.split("@")[0].split(":")[0] if sender_jid else "Desconhecido"
        sender_name = (
            msg.get("pushName")
            or sender_info.get("pushName")
            or msg.get("sender_name")
            or "Participante"
        )

        # Tenta recuperar a enquete original do banco de dados (se houver)
        enquete_titulo = "Enquete"
        todas_opcoes = []
        poll_secret = None
        poll_creator_lid = None
        poll_creator_id = None
        poll_webhook_ativo = None
        is_programada = False
        
        programada_id = None
        if poll_msg_id:
            query_cap = db.query(models.MensagemCapturada).filter(
                models.MensagemCapturada.message_id == str(poll_msg_id)
            )
            if cid:
                query_cap = query_cap.filter(models.MensagemCapturada.cliente_id == cid)
            msg_db = query_cap.first()

            if msg_db:
                if msg_db.message_content:
                    enquete_titulo = msg_db.message_content
                if msg_db.media_url:
                    if msg_db.media_url.startswith("{"):
                        try:
                            meta = json.loads(msg_db.media_url)
                            todas_opcoes = meta.get("options") or []
                            poll_secret = meta.get("secret")
                            poll_creator_lid = meta.get("creator_lid")
                            poll_creator_id = meta.get("creator_id")
                            if "webhook_ativo" in meta:
                                poll_webhook_ativo = bool(meta.get("webhook_ativo"))
                            if meta.get("programada_id"):
                                is_programada = True
                                programada_id = str(meta.get("programada_id"))
                        except Exception:
                            pass
                    elif "|" in msg_db.media_url:
                        todas_opcoes = [opt.strip() for opt in msg_db.media_url.split("|") if opt.strip()]

        # Se for poll_creationMessage recebido diretamente
        if poll_creation and isinstance(poll_creation, dict):
            enquete_titulo = poll_creation.get("name") or poll_creation.get("title") or enquete_titulo
            opts = poll_creation.get("options") or poll_creation.get("pollOptions") or []
            if isinstance(opts, list) and opts:
                todas_opcoes = [
                    (o.get("optionName") or o.get("name") or str(o))
                    for o in opts if isinstance(o, (dict, str))
                ]

        # Extrai opções selecionadas
        opcoes_selecionadas = []
        if poll_update and isinstance(poll_update, dict):
            # Formatos da W-API: pollVotes: ["4"] ou selectedOptions / votes
            selected_opts = (
                poll_update.get("pollVotes")
                or poll_update.get("selectedOptions")
                or poll_update.get("selectedOptionLocalIds")
                or poll_update.get("votes")
                or poll_update.get("options")
                or []
            )
            if isinstance(selected_opts, list):
                for item in selected_opts:
                    if isinstance(item, dict):
                        op_name = item.get("optionName") or item.get("name") or item.get("text") or str(item)
                        opcoes_selecionadas.append(op_name)
                    elif isinstance(item, str):
                        opcoes_selecionadas.append(item)
                    elif isinstance(item, int) and item < len(todas_opcoes):
                        opcoes_selecionadas.append(todas_opcoes[item])

            # Se vier criptografado (encIV e encPayload) e não veio em texto puro
            if not opcoes_selecionadas:
                vote_obj = poll_update.get("vote") or {}
                enc_iv = vote_obj.get("encIV")
                enc_payload = vote_obj.get("encPayload")
                if enc_iv and enc_payload and poll_secret:
                    creator_jids = [
                        poll_creator_lid,
                        poll_creator_id,
                        poll_update.get("pollCreationMessageKey", {}).get("participant"),
                        msg.get("connectedLid"),
                        f"{msg.get('connectedPhone')}@s.whatsapp.net" if msg.get("connectedPhone") else None
                    ]
                    voter_jids = [
                        msg.get("sender", {}).get("senderLid"),
                        f"{msg.get('sender', {}).get('id')}@s.whatsapp.net" if msg.get("sender", {}).get("id") else None,
                        msg.get("sender", {}).get("id"),
                        msg.get("key", {}).get("participant"),
                        poll_update.get("pollCreationMessageKey", {}).get("participant")
                    ]
                    opcoes_selecionadas = decriptar_voto_enquete(
                        poll_msg_id=str(poll_msg_id),
                        secret_b64=poll_secret,
                        enc_iv_b64=enc_iv,
                        enc_payload_b64=enc_payload,
                        creator_jids=creator_jids,
                        voter_jids=voter_jids,
                        todas_opcoes=todas_opcoes
                    )

        # Se não extraiu opções selecionadas mas veio texto ou body no voto
        if not opcoes_selecionadas:
            voto_texto = msg.get("text") or msg.get("body") or (poll_update.get("text") if isinstance(poll_update, dict) else "")
            if voto_texto and voto_texto != enquete_titulo:
                opcoes_selecionadas.append(voto_texto)

        opcao_marcada_str = ", ".join(opcoes_selecionadas) if opcoes_selecionadas else "Nenhuma opção selecionada"

        return {
            "id_mensagem_enquete": poll_msg_id,
            "titulo": enquete_titulo,
            "opcao_marcada": opcao_marcada_str,
            "opcoes_marcadas": opcoes_selecionadas,
            "todas_opcoes": todas_opcoes,
            "sender_name": sender_name,
            "sender_number": sender_number,
            "sender_jid": sender_jid,
            "webhook_ativo": poll_webhook_ativo,
            "is_programada": is_programada,
            "programada_id": programada_id,
        }
    except Exception as e:
        logger.error(f"[ENQUETE WEBHOOK] Erro ao extrair dados de voto de enquete: {e}")
        return None


async def disparar_webhook_enquete(
    webhook_url: str,
    payload: Dict[str, Any]
) -> bool:
    """
    Envia o payload de voto/resposta da enquete para a URL de webhook externa.
    """
    if not webhook_url or not webhook_url.strip().startswith("http"):
        logger.warning(f"[ENQUETE WEBHOOK] URL de webhook inválida: '{webhook_url}'")
        return False

    try:
        logger.info(f"[ENQUETE WEBHOOK] Disparando webhook de enquete para: {webhook_url}")
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                webhook_url.strip(),
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            if 200 <= resp.status_code < 300:
                logger.info(f"[ENQUETE WEBHOOK] Disparo realizado com sucesso! Status: {resp.status_code}")
                return True
            else:
                logger.warning(
                    f"[ENQUETE WEBHOOK] Webhook retornou status não-2xx ({resp.status_code}): {resp.text[:200]}"
                )
                return False
    except Exception as e:
        logger.error(f"[ENQUETE WEBHOOK] Falha na requisição para '{webhook_url}': {e}")
        return False


import asyncio

_pending_debounce_tasks: Dict[str, asyncio.Task] = {}
_pending_debounce_payloads: Dict[str, Any] = {}


async def _executar_disparo_com_delay(
    debounce_key: str,
    webhook_url: str,
    delay_segundos: int
):
    try:
        logger.info(
            f"[ENQUETE DEBOUNCE] Aguardando {delay_segundos}s para consolidar voto mais recente (Key: {debounce_key})"
        )
        await asyncio.sleep(delay_segundos)
        payload = _pending_debounce_payloads.pop(debounce_key, None)
        _pending_debounce_tasks.pop(debounce_key, None)
        if payload:
            logger.info(f"[ENQUETE DEBOUNCE] Delay de {delay_segundos}s concluído. Disparando webhook mais recente.")
            await disparar_webhook_enquete(webhook_url, payload)
    except asyncio.CancelledError:
        logger.info(f"[ENQUETE DEBOUNCE] Disparo anterior cancelado pois o usuário alterou seu voto (Key: {debounce_key}).")
    except Exception as e:
        logger.error(f"[ENQUETE DEBOUNCE] Erro no disparo delayed para '{webhook_url}': {e}")
        _pending_debounce_payloads.pop(debounce_key, None)
        _pending_debounce_tasks.pop(debounce_key, None)


async def processar_evento_enquete_grupo(
    db: Session,
    group_jid: str,
    msg_raw: dict,
    cid: Optional[str] = None
):
    """
    Verifica se o grupo possui webhook de enquete ativo e dispara a notificação externa
    com suporte a delay/debounce para enviar apenas a escolha mais recente.
    """
    try:
        # Busca o grupo correspondente
        query_grupo = db.query(models.GrupoWhatsApp).filter(
            models.GrupoWhatsApp.id_do_grupo == group_jid
        )
        if cid:
            query_grupo = query_grupo.filter(models.GrupoWhatsApp.cliente_id == cid)
        grupo = query_grupo.first()

        if not grupo:
            return

        if not getattr(grupo, "webhook_enquete_ativo", False):
            return

        webhook_url = getattr(grupo, "webhook_enquete_url", None)
        if not webhook_url:
            return

        dados_voto = extrair_dados_voto_enquete(msg_raw, db, cid)
        if not dados_voto:
            return

        # Modo de Enquete: "todas" vs "selecionadas"
        modo_enquetes = getattr(grupo, "webhook_enquete_modo", "todas") or "todas"
        if modo_enquetes == "selecionadas":
            # Se houver lista de IDs selecionados no grupo
            enquetes_permitidas = []
            ids_raw = getattr(grupo, "webhook_enquete_ids", None)
            if ids_raw:
                try:
                    if ids_raw.startswith("["):
                        enquetes_permitidas = json.loads(ids_raw)
                    else:
                        enquetes_permitidas = [x.strip() for x in ids_raw.split(",") if x.strip()]
                except Exception:
                    pass

            programada_id = dados_voto.get("programada_id")
            poll_webhook_habilitado = dados_voto.get("webhook_ativo")

            # Se o grupo tem uma lista de enquetes selecionadas específica
            if enquetes_permitidas:
                # Verifica se a mensagem programada está na lista permitida
                if not programada_id or str(programada_id) not in [str(x) for x in enquetes_permitidas]:
                    logger.info(f"[ENQUETE WEBHOOK] Enquete '{dados_voto.get('titulo')}' ({programada_id}) ignorada pois não está entre as enquetes selecionadas deste grupo.")
                    return
            else:
                # Fallback: Se não definiu lista específica, checa a flag da mensagem programada
                if poll_webhook_habilitado is False:
                    logger.info(f"[ENQUETE WEBHOOK] Enquete '{dados_voto.get('titulo')}' ignorada pois está desabilitada para webhook.")
                    return
                elif poll_webhook_habilitado is None and not dados_voto.get("is_programada"):
                    logger.info(f"[ENQUETE WEBHOOK] Enquete '{dados_voto.get('titulo')}' ignorada: grupo configurado para 'Apenas Enquetes Programadas Selecionadas'.")
                    return

        agora_bsb = datetime.now(BR_TZ).strftime("%Y-%m-%d %H:%M:%S")

        payload = {
            "evento": "voto_enquete",
            "grupo": {
                "id": str(grupo.id),
                "nome": grupo.nome,
                "jid": grupo.id_do_grupo
            },
            "usuario": {
                "nome": dados_voto["sender_name"],
                "numero": dados_voto["sender_number"],
                "jid": dados_voto["sender_jid"]
            },
            "enquete": {
                "id_mensagem_enquete": dados_voto["id_mensagem_enquete"],
                "titulo": dados_voto["titulo"],
                "opcao_marcada": dados_voto["opcao_marcada"],
                "opcoes_marcadas": dados_voto["opcoes_marcadas"],
                "todas_opcoes": dados_voto["todas_opcoes"]
            },
            "data_hora": agora_bsb,
            "raw_data": msg_raw
        }

        delay_segundos = int(getattr(grupo, "webhook_enquete_delay_segundos", 0) or 0)

        # Se delay for 0 ou negativo, dispara imediatamente
        if delay_segundos <= 0:
            await disparar_webhook_enquete(webhook_url, payload)
            return

        # Debounce por participante + enquete + grupo
        voter_id = dados_voto["sender_jid"] or dados_voto["sender_number"]
        poll_id = dados_voto["id_mensagem_enquete"] or "default"
        debounce_key = f"{grupo.id}:{voter_id}:{poll_id}"

        # Cancela disparo anterior se houver
        if debounce_key in _pending_debounce_tasks:
            task = _pending_debounce_tasks[debounce_key]
            if not task.done():
                task.cancel()

        # Atualiza payload para o mais recente e agenda nova execução
        _pending_debounce_payloads[debounce_key] = payload
        _pending_debounce_tasks[debounce_key] = asyncio.create_task(
            _executar_disparo_com_delay(debounce_key, webhook_url, delay_segundos)
        )
    except Exception as e:
        logger.error(f"[ENQUETE WEBHOOK] Erro ao processar evento de enquete do grupo {group_jid}: {e}")
