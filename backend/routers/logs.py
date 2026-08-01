from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import date, datetime, time
from sqlalchemy import func, or_

import models, schemas, security, scheduler
from database import get_db
from client_context import get_active_client_id

router = APIRouter(tags=["Logs"])

@router.get("/logs/", response_model=schemas.PaginatedLog, dependencies=[Depends(security.get_api_key)])
def listar_logs(
    status: Optional[str] = Query(None),
    grupo: Optional[str] = Query(None),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    cid = get_active_client_id(db)
    query = db.query(models.LogDisparo).filter(
        or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None))
    )
    
    if status:
        query = query.filter(models.LogDisparo.status.ilike(status))
    
    if grupo:
        query = query.filter(models.LogDisparo.grupo_nome.ilike(f"%{grupo}%"))
        
    if data_inicio:
        query = query.filter(func.date(models.LogDisparo.criado_em) >= data_inicio)
        
    if data_fim:
        query = query.filter(func.date(models.LogDisparo.criado_em) <= data_fim)
        
    total = query.count()
    
    base_stats_query = db.query(models.LogDisparo).filter(
        or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None))
    )
    if grupo:
        base_stats_query = base_stats_query.filter(models.LogDisparo.grupo_nome.ilike(f"%{grupo}%"))
    if data_inicio:
        base_stats_query = base_stats_query.filter(func.date(models.LogDisparo.criado_em) >= data_inicio)
    if data_fim:
        base_stats_query = base_stats_query.filter(func.date(models.LogDisparo.criado_em) <= data_fim)
        
    total_sucesso = base_stats_query.filter(models.LogDisparo.status == "Sucesso").count()
    total_erro = base_stats_query.filter(models.LogDisparo.status == "Erro").count()

    logs = query.order_by(models.LogDisparo.criado_em.desc(), models.LogDisparo.id).offset(offset).limit(limit).all()
    
    formatted_logs = []
    for log in logs:
        tipo_resolved = log.tipo
        if not tipo_resolved and log.mensagem_id:
            msg_orig = db.query(models.MensagemDisparada).filter(models.MensagemDisparada.id == log.mensagem_id).first()
            if msg_orig and msg_orig.tipo_de_mensagem:
                tipo_resolved = msg_orig.tipo_de_mensagem

        if not tipo_resolved:
            corpo = (log.mensagem_corpo or "").lower()
            if any(ext in corpo for ext in [".png", ".jpg", ".jpeg", ".webp"]):
                tipo_resolved = "imagem"
            elif any(ext in corpo for ext in [".mp4", ".mov", ".avi"]):
                tipo_resolved = "video"
            elif any(ext in corpo for ext in [".ogg", ".mp3", ".wav", ".m4a"]):
                tipo_resolved = "audio"
            elif any(ext in corpo for ext in [".pdf", ".doc", ".docx", ".zip"]):
                tipo_resolved = "arquivo"
            elif "nome do grupo alterado" in corpo:
                tipo_resolved = "nome_grupo"
            elif "quanto é 2 + 2" in corpo or "enquete" in corpo:
                tipo_resolved = "enquete"
            else:
                tipo_resolved = "texto"

        log_dict = {
            "id": log.id,
            "grupo_nome": log.grupo_nome,
            "mensagem_corpo": log.mensagem_corpo,
            "status": log.status,
            "detalhes_erro": log.detalhes_erro,
            "mensagem_id": log.mensagem_id,
            "tipo": tipo_resolved,
            "tipo_mensagem": tipo_resolved,
            "criado_em": log.criado_em,
            "dispensado": log.dispensado or False
        }
        formatted_logs.append(log_dict)

    return {
        "total": total, 
        "total_geral": total_sucesso + total_erro,
        "total_sucesso": total_sucesso,
        "total_erro": total_erro,
        "items": formatted_logs
    }

@router.post("/logs/bulk-delete", dependencies=[Depends(security.get_api_key)])
def bulk_deletar_logs(body: dict, db: Session = Depends(get_db)):
    ids = body.get("ids", [])
    if not ids:
        return {"message": "Nenhum ID fornecido"}
    
    valid_ids = []
    for id_str in ids:
        try:
            valid_ids.append(uuid.UUID(id_str))
        except ValueError:
            continue
            
    if not valid_ids:
        return {"message": "Nenhum ID válido fornecido"}

    cid = get_active_client_id(db)
    db.query(models.LogDisparo).filter(models.LogDisparo.id.in_(valid_ids), models.LogDisparo.cliente_id == cid).delete(synchronize_session=False)
    db.commit()
    return {"message": f"{len(valid_ids)} registros de log removidos com sucesso"}

@router.delete("/logs/{log_id}", dependencies=[Depends(security.get_api_key)])
def deletar_log(log_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    log = db.query(models.LogDisparo).filter(models.LogDisparo.id == log_id, models.LogDisparo.cliente_id == cid).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")
    
    db.delete(log)
    db.commit()
    return {"message": "Log deletado com sucesso"}

@router.patch("/logs/{log_id}/dispensar", dependencies=[Depends(security.get_api_key)])
def dispensar_falha(log_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    log = db.query(models.LogDisparo).filter(models.LogDisparo.id == log_id, models.LogDisparo.cliente_id == cid).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")
    log.dispensado = True
    db.commit()
    return {"message": "Falha dispensada com sucesso"}

@router.post("/logs/{log_id}/retry", dependencies=[Depends(security.get_api_key)])
def reenviar_log(log_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    log = db.query(models.LogDisparo).filter(
        models.LogDisparo.id == log_id,
        or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None))
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")
        
    grupo = db.query(models.GrupoWhatsApp).filter(
        models.GrupoWhatsApp.nome == log.grupo_nome,
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None))
    ).first()
    if not grupo:
        raise HTTPException(status_code=404, detail=f"Grupo '{log.grupo_nome}' não encontrado.")
        
    mensagem = None
    if log.mensagem_id:
        mensagem = db.query(models.MensagemDisparada).filter(
            models.MensagemDisparada.id == log.mensagem_id,
            or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
        ).first()
    
    if not mensagem:
        mensagem = db.query(models.MensagemDisparada).filter(
            models.MensagemDisparada.mensagem == log.mensagem_corpo,
            or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
        ).first()
    
    if not mensagem:
        mensagem = models.MensagemDisparada(
            cliente_id=cid,
            mensagem=log.mensagem_corpo if log.tipo != "imagem" and log.tipo != "video" and log.tipo != "audio" and log.tipo != "arquivo" else "",
            numero_da_mensagem=0,
            dia_do_lancamento=0,
            horario_do_disparo=time(0,0),
            tipo_de_mensagem=log.tipo or "texto",
            link_midia=log.mensagem_corpo if log.tipo in ["imagem", "video", "audio", "arquivo"] else ""
        )
        
    sucesso, detalhes = scheduler.enviar_payload_n8n(grupo, mensagem, db)
    
    if sucesso:
        return {"message": "Reenvio realizado com sucesso", "status": "Sucesso"}
    else:
        raise HTTPException(status_code=500, detail=f"Falha no reenvio: {detalhes}")
