from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from sqlalchemy import func, Time

import httpx
import models, database, scheduler
from database import get_db
from s3_helper import upload_file_to_s3

router = APIRouter(tags=["Webhooks"])

async def persist_whatsapp_media(db: Session, media_data: dict, msg_root: dict = None, media_type: str = "imagem") -> str:
    """
    Usa a W-API para descriptografar/baixar a mídia e armazena no nosso S3.
    """
    if not isinstance(media_data, dict):
        media_data = {}
    if not isinstance(msg_root, dict):
        msg_root = {}

    url = (
        media_data.get("url") or media_data.get("mediaUrl") or media_data.get("link") or 
        media_data.get("fileUrl") or media_data.get("fileLink") or media_data.get("media_url") or
        msg_root.get("url") or msg_root.get("mediaUrl") or msg_root.get("link") or 
        msg_root.get("fileUrl") or msg_root.get("fileLink") or msg_root.get("media_url") or
        (msg_root.get("image") if isinstance(msg_root.get("image"), str) else None) or
        (msg_root.get("video") if isinstance(msg_root.get("video"), str) else None) or
        (msg_root.get("audio") if isinstance(msg_root.get("audio"), str) else None) or
        (msg_root.get("document") if isinstance(msg_root.get("document"), str) else None)
    )
    media_key = media_data.get("mediaKey") or msg_root.get("mediaKey")
    direct_path = media_data.get("directPath") or msg_root.get("directPath")
    mimetype = media_data.get("mimetype") or msg_root.get("mimetype")

    if not url and not direct_path and not media_key:
        return None
        
    print(f"PERSISTINDO MÍDIA ({media_type}): url={url}, direct_path={direct_path}, media_key={media_key}")
    
    # Se já é uma URL pública (S3, CDN ou link público direto sem chaves de criptografia), retorna ela própria
    if url and (url.startswith("http://") or url.startswith("https://")) and not media_key and not direct_path:
        return url
    
    try:
        instance_id = scheduler._wapi_instance(db)
        headers = scheduler._wapi_headers(db)
        
        if not instance_id or not headers.get("Authorization"):
            print("FALHA: W-API não configurada para persistência de mídia.")
            return url

        wapi_url = f"{scheduler.WAPI_BASE}/message/download-media?instanceId={instance_id}"
        payload = {
            "mediaKey": media_key,
            "directPath": direct_path,
            "type": media_type if media_type != "imagem" else "image",
            "mimetype": mimetype
        }
        
        if payload["type"] == "imagem": payload["type"] = "image"
        if payload["type"] == "arquivo": payload["type"] = "document"

        async with httpx.AsyncClient(timeout=45.0) as client:
            print(f"Solicitando download para W-API: {payload['type']}")
            resp_wapi = await client.post(wapi_url, json=payload, headers=headers)
            
            if resp_wapi.status_code not in [200, 201]:
                print(f"FALHA W-API DOWNLOAD ({resp_wapi.status_code}): {resp_wapi.text}")
                return url

            download_data = resp_wapi.json()
            temp_download_url = download_data.get("fileLink") or download_data.get("url") or download_data.get("mediaUrl")
            
            if not temp_download_url:
                print(f"FALHA: W-API não retornou URL de download. Resposta: {download_data}")
                return url

            print(f"Baixando binário da URL temporária: {temp_download_url[:50]}...")
            resp_bin = await client.get(temp_download_url)
            
            if resp_bin.status_code == 200:
                content = resp_bin.content
                content_type = resp_bin.headers.get("content-type") or mimetype
                
                ext = "bin"
                if media_type == "imagem": ext = "jpg"
                elif media_type == "video": ext = "mp4"
                elif media_type == "audio": ext = "ogg"
                elif media_type == "arquivo": ext = "pdf"
                
                if media_type == "imagem": content_type = "image/jpeg"
                elif media_type == "video": content_type = "video/mp4"
                elif media_type == "audio": content_type = "audio/ogg"

                filename = f"capturas/{uuid.uuid4()}.{ext}"
                s3_url = upload_file_to_s3(content, filename, content_type)
                print(f"MÍDIA PERSISTIDA COM SUCESSO NO S3: {s3_url}")
                return s3_url
            else:
                print(f"FALHA AO BAIXAR BINÁRIO DA W-API ({resp_bin.status_code})")
                
    except Exception as e:
        print(f"ERRO NA PERSISTÊNCIA DE MÍDIA: {str(e)}")
    
    return url

from client_context import get_active_client_id

@router.post("/webhook/whatsapp")
async def webhook_whatsapp(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        event_type = data.get("event") or data.get("type")
        instance_id = data.get("instanceId") or data.get("instance_id") or data.get("instance")
        
        cid = None
        if instance_id:
            cliente = db.query(models.Cliente).filter(models.Cliente.wapi_instance_id == str(instance_id), models.Cliente.ativo == True).first()
            if cliente:
                cid = cliente.id
        
        if not cid:
            cid = get_active_client_id(db)

        print(f"WEBHOOK: Recebido evento do tipo '{event_type}' (Instance: {instance_id}, Cliente: {cid})")

        WAPI_EVENTS = ["message", "message.create", "message.upsert", "MESSAGES_UPSERT", "messages.upsert", "webhookReceived"]
        
        if event_type in WAPI_EVENTS:
            import json
            print(f"WEBHOOK PAYLOAD: {json.dumps(data)}")

            msgs = []
            payload_data = data.get("data") or data.get("payload") or data
            
            if isinstance(payload_data, dict):
                msgs = payload_data.get("messages") or [payload_data]
            elif isinstance(payload_data, list):
                msgs = payload_data
            else:
                msgs = [data]

            for msg in msgs:
                from_me = bool(msg.get("key", {}).get("fromMe") or msg.get("fromMe"))
                
                remote_jid = ""
                if "key" in msg:
                    remote_jid = msg["key"].get("remoteJid", "")
                elif "chat" in msg:
                    remote_jid = msg["chat"].get("id", "")
                else:
                    remote_jid = msg.get("remoteJid", "")

                if not remote_jid:
                    continue

                is_group = remote_jid.endswith("@g.us")
                group_name = "Contato Privado"

                if is_group:
                    grupo = db.query(models.GrupoWhatsApp).filter(
                        models.GrupoWhatsApp.id_do_grupo == remote_jid,
                        models.GrupoWhatsApp.cliente_id == cid
                    ).first()
                    if grupo:
                        group_name = grupo.nome
                    else:
                        group_name = msg.get("groupSubject") or msg.get("subject") or f"Grupo ({remote_jid.split('@')[0]})"
                else:
                    sender_info = msg.get("sender") or {}
                    push_name = msg.get("pushName") or sender_info.get("pushName") or "Contato"
                    clean_num = remote_jid.split("@")[0].split(":")[0]
                    group_name = f"{push_name} ({clean_num})" if push_name != "Contato" else f"Contato ({clean_num})"

                message_id = msg.get("key", {}).get("id") or msg.get("id") or msg.get("messageId")

                msg_body = ""
                media_url = None
                media_type = None
                message_dict = msg.get("message") or msg.get("msgContent") or {}
                
                media_payload = None
                msg_type = (msg.get("type") or msg.get("messageType") or "").lower()

                # Suporte a mídias
                if "imageMessage" in message_dict or msg_type in ["image", "imagem"] or "imageMessage" in msg or "image" in msg:
                    media_type = "imagem"
                    media_payload = message_dict.get("imageMessage") or msg.get("imageMessage") or (msg.get("image") if isinstance(msg.get("image"), dict) else None) or message_dict or msg
                    msg_body = (media_payload.get("caption") if isinstance(media_payload, dict) else "") or msg.get("caption") or msg.get("text") or msg.get("body") or ""
                elif "videoMessage" in message_dict or msg_type in ["video"] or "videoMessage" in msg or "video" in msg:
                    media_type = "video"
                    media_payload = message_dict.get("videoMessage") or msg.get("videoMessage") or (msg.get("video") if isinstance(msg.get("video"), dict) else None) or message_dict or msg
                    msg_body = (media_payload.get("caption") if isinstance(media_payload, dict) else "") or msg.get("caption") or msg.get("text") or msg.get("body") or ""
                elif "documentMessage" in message_dict or msg_type in ["document", "documento", "file"] or "documentMessage" in msg or "document" in msg:
                    media_type = "arquivo"
                    media_payload = message_dict.get("documentMessage") or msg.get("documentMessage") or (msg.get("document") if isinstance(msg.get("document"), dict) else None) or message_dict or msg
                    msg_body = (media_payload.get("caption") if isinstance(media_payload, dict) else "") or msg.get("caption") or msg.get("text") or msg.get("body") or ""
                elif "audioMessage" in message_dict or msg_type in ["audio", "ptt"] or "audioMessage" in msg or "audio" in msg:
                    media_type = "audio"
                    media_payload = message_dict.get("audioMessage") or msg.get("audioMessage") or (msg.get("audio") if isinstance(msg.get("audio"), dict) else None) or message_dict or msg
                    msg_body = ""
                elif "pollCreationMessage" in message_dict or "pollCreationMessage" in msg or msg_type in ["poll", "enquete", "pollcreation"]:
                    media_type = "enquete"
                    poll_payload = message_dict.get("pollCreationMessage") or msg.get("pollCreationMessage") or {}
                    msg_body = poll_payload.get("name") or poll_payload.get("title") or msg.get("text") or msg.get("body") or "Enquete"
                    opts = poll_payload.get("options") or poll_payload.get("pollOptions") or []
                    if isinstance(opts, list) and opts:
                        opt_names = [o.get("optionName") or o.get("name") or str(o) for o in opts if isinstance(o, (dict, str))]
                        media_url = "|".join([n for n in opt_names if n])
                elif "conversation" in message_dict:
                    msg_body = message_dict["conversation"]
                elif "extendedTextMessage" in message_dict:
                    msg_body = message_dict["extendedTextMessage"].get("text", "")
                elif msg.get("text") or msg.get("body") or msg.get("caption"):
                    msg_body = msg.get("text") or msg.get("body") or msg.get("caption") or ""
                
                # Tenta persistir mídia se identificada
                if media_type or media_payload:
                    media_url = await persist_whatsapp_media(db, media_payload or {}, msg, media_type or "imagem")

                if not msg_body and not media_url:
                    continue

                sender_name = "Você" if from_me else "Contato"
                sender_number = "Você" if from_me else "Desconhecido"

                if not from_me:
                    if "sender" in msg:
                        sender_name = msg["sender"].get("pushName") or "Contato"
                        sender_number = msg["sender"].get("id") or remote_jid
                    else:
                        sender_name = msg.get("pushName") or "Contato"
                        sender_number = msg.get("key", {}).get("participant") or remote_jid

                    sender_number = sender_number.split("@")[0].split(":")[0]
                else:
                    # Se foi enviada pelo próprio usuário (celular/painel), evita duplicata por message_id
                    if message_id:
                        existe = db.query(models.MensagemCapturada).filter(
                            models.MensagemCapturada.message_id == message_id,
                            models.MensagemCapturada.cliente_id == cid
                        ).first()
                        if existe:
                            continue
                
                db_msg = models.MensagemCapturada(
                    cliente_id=cid,
                    message_id=message_id,
                    from_me=from_me,
                    sender_name=sender_name,
                    sender_number=sender_number,
                    message_content=msg_body,
                    media_url=media_url,
                    media_type=media_type,
                    group_jid=remote_jid,
                    group_name=group_name,
                    timestamp=datetime.now(scheduler.BR_TZ).replace(tzinfo=None)
                )
                db.add(db_msg)
            
            db.commit()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/mensagens/capturadas/", dependencies=[Depends(database.get_db)])
def listar_mensagens_capturadas(
    limit: int = 50,
    offset: int = 0,
    search: str = None,
    group_jid: str = None,
    db: Session = Depends(get_db)
):
    cid = get_active_client_id(db)
    query = db.query(models.MensagemCapturada).filter(models.MensagemCapturada.cliente_id == cid)
    if group_jid:
        query = query.filter(models.MensagemCapturada.group_jid == group_jid)
    if search:
        query = query.filter(
            (models.MensagemCapturada.sender_name.ilike(f"%{search}%")) |
            (models.MensagemCapturada.message_content.ilike(f"%{search}%"))
        )
    total = query.count()
    items = query.order_by(models.MensagemCapturada.timestamp.desc()).offset(offset).limit(limit).all()
    return {"total": total, "items": items}

@router.delete("/mensagens/capturadas/{msg_id}")
def deletar_mensagem_capturada(msg_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemCapturada).filter(models.MensagemCapturada.id == msg_id, models.MensagemCapturada.cliente_id == cid).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    db.delete(db_msg)
    db.commit()
    return {"message": "Mensagem removida"}
