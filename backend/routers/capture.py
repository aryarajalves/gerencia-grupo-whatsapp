from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, Response, Query
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import uuid
import os
import httpx
from typing import Optional

import models, schemas, security, database, scheduler
from database import get_db
from client_context import get_active_client_id
from s3_helper import upload_file_to_s3

router = APIRouter(prefix="/captura", tags=["Captura de Mensagens"])

@router.get("/webhook-url", dependencies=[Depends(security.get_api_key)])
def get_webhook_url(request: Request):
    """
    Retorna a URL completa para configurar o webhook na W-API.
    """
    # Tenta pegar do ambiente ou usa o host da requisição
    base_url = os.getenv("BASE_URL")
    if not base_url:
        # Pega o host da requisição (ex: http://localhost:8000)
        scheme = request.url.scheme
        netloc = request.url.netloc
        base_url = f"{scheme}://{netloc}"
    
    return {"url": f"{base_url}/webhook/whatsapp"}

from datetime import datetime, date

@router.get("/mensagens/", response_model=schemas.PaginatedCapturas, dependencies=[Depends(security.get_api_key)])
def listar_mensagens_capturadas(
    limit: int = 20,
    offset: int = 0,
    search: Optional[str] = None,
    group_jid: Optional[str] = None,
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    origem: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    cid = get_active_client_id(db)
    query = db.query(models.MensagemCapturada).filter(
        or_(models.MensagemCapturada.cliente_id == cid, models.MensagemCapturada.cliente_id.is_(None))
    )
    
    if group_jid:
        query = query.filter(models.MensagemCapturada.group_jid == group_jid)

    if data_inicio:
        query = query.filter(func.date(models.MensagemCapturada.timestamp) >= data_inicio)

    if data_fim:
        query = query.filter(func.date(models.MensagemCapturada.timestamp) <= data_fim)

    if origem:
        origem_clean = origem.lower().strip()
        if origem_clean in ["sistema", "disparo_automatico"]:
            query = query.filter(
                models.MensagemCapturada.from_me == True,
                (models.MensagemCapturada.sender_name.ilike("%Disparo Automático%") | 
                 models.MensagemCapturada.sender_number.ilike("%Sistema%") |
                 models.MensagemCapturada.sender_name.ilike("%Sistema%"))
            )
        elif origem_clean in ["usuario", "lead", "grupo"]:
            query = query.filter(models.MensagemCapturada.from_me == False)
        elif origem_clean in ["chat", "chat_grupos"]:
            query = query.filter(
                models.MensagemCapturada.from_me == True,
                (models.MensagemCapturada.sender_name.ilike("%Você%") | 
                 models.MensagemCapturada.sender_name.ilike("%Chat%") |
                 models.MensagemCapturada.sender_number.ilike("%Bot%"))
            )

    if search:
        query = query.filter(
            (models.MensagemCapturada.group_name.ilike(f"%{search}%")) |
            (models.MensagemCapturada.message_content.ilike(f"%{search}%")) |
            (models.MensagemCapturada.sender_name.ilike(f"%{search}%"))
        )
    
    total = query.count()
    items = query.order_by(models.MensagemCapturada.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {"total": total, "items": items}

@router.delete("/mensagens/{msg_id}", dependencies=[Depends(security.get_api_key)])
def deletar_mensagem_capturada(msg_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemCapturada).filter(models.MensagemCapturada.id == msg_id, models.MensagemCapturada.cliente_id == cid).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Captura não encontrada")
    
    db.delete(db_msg)
    db.commit()
    return {"message": "Removido com sucesso"}

@router.get("/media-proxy")
async def media_proxy(url: str):
    """
    Proxy para carregar mídias do S3/W-API sem problemas de CORS ou Referrer.
    """
    if not url:
        raise HTTPException(status_code=400, detail="URL não fornecida")
        
    print(f"[MEDIA PROXY] Requisitando: {url}")
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.37 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.37",
                "Accept": "*/*"
            }
            resp = await client.get(url, headers=headers)
            
            if resp.status_code != 200:
                print(f"[MEDIA PROXY] Erro na origem ({resp.status_code}): {url}")
                raise HTTPException(status_code=resp.status_code, detail="Erro ao buscar mídia na origem")
            
            content_type = resp.headers.get("content-type", "application/octet-stream")
            
            # Se for octet-stream ou genérico, tentamos identificar pela URL ou pelo conteúdo
            if content_type in ["application/octet-stream", "binary/octet-stream", "application/force-download"]:
                url_lower = url.lower()
                if any(ext in url_lower for ext in [".jpg", ".jpeg", "image/jpeg"]):
                    content_type = "image/jpeg"
                elif ".png" in url_lower:
                    content_type = "image/png"
                elif ".gif" in url_lower:
                    content_type = "image/gif"
                elif ".webp" in url_lower:
                    content_type = "image/webp"
                elif ".mp4" in url_lower:
                    content_type = "video/mp4"
                elif ".ogg" in url_lower:
                    content_type = "audio/ogg"
                elif ".mp3" in url_lower:
                    content_type = "audio/mpeg"
                elif ".pdf" in url_lower:
                    content_type = "application/pdf"
                elif "mmg.whatsapp.net" in url_lower:
                    content_type = "image/jpeg"

            print(f"[MEDIA PROXY] Sucesso! Servindo como: {content_type}")

            return Response(
                content=resp.content,
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Expose-Headers": "Content-Type, Content-Length",
                    "Cross-Origin-Resource-Policy": "cross-origin",
                    "Cross-Origin-Embedder-Policy": "credentialless",
                    "Content-Disposition": "inline"
                }
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[MEDIA PROXY] Exceção: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno no proxy: {str(e)}")

from types import SimpleNamespace

@router.get("/conversas/", dependencies=[Depends(security.get_api_key)])
def listar_conversas(db: Session = Depends(get_db)):
    """
    Retorna a lista de todas as conversas ativas (Grupos + Contatos Privados),
    ordenadas pela mensagem mais recente do cliente ativo.
    """
    cid = get_active_client_id(db)
    grupos_db = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.cliente_id == cid).all()
    conversas_dict = {}
    
    for g in grupos_db:
        conversas_dict[g.id_do_grupo] = {
            "id_do_grupo": g.id_do_grupo,
            "nome": g.nome,
            "tipo": "grupo",
            "ativo": g.ativo,
            "ultima_mensagem": "",
            "timestamp": None
        }

    msgs = db.query(models.MensagemCapturada).filter(models.MensagemCapturada.cliente_id == cid).order_by(models.MensagemCapturada.timestamp.desc()).all()

    for m in msgs:
        jid = m.group_jid
        if not jid:
            continue
            
        is_group = jid.endswith("@g.us")
        tipo = "grupo" if is_group else "privado"

        if jid not in conversas_dict:
            conversas_dict[jid] = {
                "id_do_grupo": jid,
                "nome": m.group_name or (f"Grupo ({jid.split('@')[0]})" if is_group else f"Contato ({jid.split('@')[0]})"),
                "tipo": tipo,
                "ativo": True,
                "ultima_mensagem": m.message_content or (f"[{m.media_type or 'Mídia'}]" if m.media_url else ""),
                "timestamp": m.timestamp.isoformat() if m.timestamp else None
            }
        elif not conversas_dict[jid]["timestamp"] and m.timestamp:
            conversas_dict[jid]["ultima_mensagem"] = m.message_content or (f"[{m.media_type or 'Mídia'}]" if m.media_url else "")
            conversas_dict[jid]["timestamp"] = m.timestamp.isoformat()

    resultado = list(conversas_dict.values())
    resultado.sort(key=lambda x: x["timestamp"] or "", reverse=True)
    
    return resultado

@router.post("/enviar", dependencies=[Depends(security.get_api_key)])
async def enviar_mensagem_chat(req: schemas.ChatSendMessage, db: Session = Depends(get_db)):
    """
    Envia uma mensagem para um grupo ou contato privado via W-API.
    """
    cid = get_active_client_id(db)
    grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id_do_grupo == req.group_jid, models.GrupoWhatsApp.cliente_id == cid).first()
    if not grupo:
        if req.group_jid.endswith("@g.us"):
            raise HTTPException(status_code=404, detail="Grupo não encontrado no sistema")
        grupo = SimpleNamespace(id_do_grupo=req.group_jid, nome="Contato Privado", cliente_id=cid)

    fake_msg = models.MensagemDisparada(
        mensagem=req.message,
        tipo_de_mensagem="texto",
        cliente_id=cid
    )

    success, result = scheduler.enviar_wapi(grupo, fake_msg, db)
    if not success:
        raise HTTPException(status_code=502, detail=f"Erro na W-API: {result}")

    whatsapp_id = None
    if isinstance(result, dict):
        whatsapp_id = result.get("id") or result.get("messageId") or result.get("key", {}).get("id")
    
    print(f"Chat: Mensagem enviada para {req.group_jid}. WhatsApp ID extraído: {whatsapp_id}")

    db_msg = models.MensagemCapturada(
        cliente_id=cid,
        message_id=whatsapp_id,
        from_me=True,
        sender_name="Você",
        sender_number="Bot",
        message_content=req.message,
        group_jid=req.group_jid,
        group_name=grupo.nome,
        timestamp=datetime.now(scheduler.BR_TZ).replace(tzinfo=None)
    )
    db.add(db_msg)
    db.commit()

    return {"status": "success", "message": "Mensagem enviada"}

@router.post("/revogar/{msg_id}", dependencies=[Depends(security.get_api_key)])
async def revogar_mensagem_chat(msg_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Revoga (apaga para todos) uma mensagem no WhatsApp.
    """
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemCapturada).filter(models.MensagemCapturada.id == msg_id, models.MensagemCapturada.cliente_id == cid).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Registro da mensagem não encontrado no banco")
    
    if not db_msg.message_id:
        raise HTTPException(status_code=400, detail="Esta mensagem não possui um ID rastreável para ser apagada no WhatsApp")

    instance_id = scheduler._wapi_instance(db)
    headers = scheduler._wapi_headers(db)
    
    plan_config = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
    plan_type = plan_config.valor if plan_config else "LITE"

    if plan_type == "LITE":
        raise HTTPException(
            status_code=403,
            detail="PRO_REQUIRED::A função de apagar mensagens para todos requer o plano PRO da W-API."
        )

    if not instance_id:
        raise HTTPException(status_code=503, detail="W-API Instance ID não configurado")

    full_msg_id = f"true_{db_msg.group_jid}_{db_msg.message_id}"
    
    payload = {
        "messageId": full_msg_id,
        "forEveryone": True
    }
    
    endpoint = scheduler.ENDPOINT_MAP.get("revoke", "/message/delete")
    
    if "{id}" in endpoint:
        path = endpoint.replace("{id}", instance_id)
        url = f"{scheduler.WAPI_BASE}{path}"
    else:
        url = f"{scheduler.WAPI_BASE}{endpoint}?instanceId={instance_id}"

    import httpx
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code not in (200, 201):
                print(f"Erro ao revogar na W-API: Status {resp.status_code}, Body: {resp.text}")
                raise HTTPException(status_code=502, detail=f"W-API Error: {resp.text}")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Falha na conexão com W-API: {str(e)}")

    db.delete(db_msg)
    db.commit()

    return {"status": "success", "message": "Mensagem revogada"}

@router.post("/enviar-midia", dependencies=[Depends(security.get_api_key)])
async def enviar_midia_chat(
    group_jid: str = Form(...),
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Realiza upload de arquivo e envia como mídia para o grupo ou contato privado.
    """
    cid = get_active_client_id(db)
    grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id_do_grupo == group_jid, models.GrupoWhatsApp.cliente_id == cid).first()
    if not grupo:
        if group_jid.endswith("@g.us"):
            raise HTTPException(status_code=404, detail="Grupo não encontrado no sistema")
        grupo = SimpleNamespace(id_do_grupo=group_jid, nome="Contato Privado", cliente_id=cid)

    try:
        content = await file.read()
        file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
        
        tipo_msg = "arquivo"
        if "image" in file.content_type:
            tipo_msg = "imagem"
        elif "video" in file.content_type:
            tipo_msg = "video"
        elif "audio" in file.content_type or file_ext == "webm":
            tipo_msg = "audio"
            if file_ext == "webm" or file_ext == "bin":
                file_ext = "ogg"

        unique_filename = f"chat_media/{uuid.uuid4()}.{file_ext}"
        
        file_url = upload_file_to_s3(content, unique_filename, file.content_type)

        fake_msg = models.MensagemDisparada(
            mensagem=caption,
            link_midia=file_url,
            tipo_de_mensagem=tipo_msg,
            cliente_id=cid
        )

        success, result = scheduler.enviar_wapi(grupo, fake_msg, db)
        if not success:
            raise HTTPException(status_code=502, detail=f"Erro na W-API: {result}")

        db_msg = models.MensagemCapturada(
            cliente_id=cid,
            message_id=result.get("id") if isinstance(result, dict) else None,
            from_me=True,
            sender_name="Você",
            sender_number="Bot",
            message_content=caption,
            media_url=file_url,
            media_type=tipo_msg,
            group_jid=group_jid,
            group_name=grupo.nome,
            timestamp=datetime.now(scheduler.BR_TZ).replace(tzinfo=None)
        )
        db.add(db_msg)
        db.commit()

        return {"status": "success", "url": file_url}
        
    except Exception as e:
        print(f"Erro no upload/envio de mídia: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
