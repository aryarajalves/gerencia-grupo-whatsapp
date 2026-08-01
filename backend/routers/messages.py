from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from datetime import time

from sqlalchemy import or_

import models, schemas, security
from database import get_db
from client_context import get_active_client_id

router = APIRouter(tags=["Mensagens"])

@router.get("/mensagens/", response_model=schemas.PaginatedMensagem, dependencies=[Depends(security.get_api_key)])
def listar_mensagens(
    dia: Optional[int] = None, 
    tipo: Optional[str] = None,
    horario_inicio: Optional[time] = None, 
    horario_fim: Optional[time] = None, 
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    cid = get_active_client_id(db)
    query = db.query(models.MensagemDisparada).filter(
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    )
    
    if dia is not None:
        query = query.filter(models.MensagemDisparada.dia_do_lancamento == dia)
    
    if tipo:
        query = query.filter(models.MensagemDisparada.tipo_de_mensagem == tipo)
    
    if horario_inicio:
        query = query.filter(models.MensagemDisparada.horario_do_disparo >= horario_inicio)
    
    if horario_fim:
        query = query.filter(models.MensagemDisparada.horario_do_disparo <= horario_fim)
        
    total = query.count()
    mensagens = query.order_by(models.MensagemDisparada.dia_do_lancamento, models.MensagemDisparada.horario_do_disparo).offset(offset).limit(limit).all()
    
    # Injetar grupo_ids para o frontend
    for m in mensagens:
        m.grupo_ids = [g.id for g in m.grupos]
    
    return {"total": total, "items": mensagens}

@router.post("/mensagens/", response_model=schemas.MensagemDisparada, dependencies=[Depends(security.get_api_key)])
def agendar_mensagem(mensagem: schemas.MensagemDisparadaCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    # Remove grupo_ids do dump para não dar erro no construtor do modelo
    dados = mensagem.model_dump()
    grupo_ids = dados.pop('grupo_ids', [])
    
    db_mensagem = models.MensagemDisparada(**dados)
    db_mensagem.cliente_id = cid
    
    if grupo_ids:
        grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_(grupo_ids), models.GrupoWhatsApp.cliente_id == cid).all()
        db_mensagem.grupos = grupos
        
    db.add(db_mensagem)
    db.commit()
    db.refresh(db_mensagem)
    
    # Re-adiciona para o response
    db_mensagem.grupo_ids = [g.id for g in db_mensagem.grupos]
    return db_mensagem

@router.put("/mensagens/{mensagem_id}", response_model=schemas.MensagemDisparada, dependencies=[Depends(security.get_api_key)])
def atualizar_mensagem(mensagem_id: uuid.UUID, mensagem: schemas.MensagemDisparadaCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemDisparada).filter(models.MensagemDisparada.id == mensagem_id, models.MensagemDisparada.cliente_id == cid).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    
    dados = mensagem.model_dump()
    grupo_ids = dados.pop('grupo_ids', [])
    
    for key, value in dados.items():
        setattr(db_msg, key, value)
    
    db_msg.cliente_id = cid
    
    # Sincroniza grupos
    if grupo_ids is not None:
        grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_(grupo_ids), models.GrupoWhatsApp.cliente_id == cid).all()
        db_msg.grupos = grupos
    
    db.commit()
    db.refresh(db_msg)
    db_msg.grupo_ids = [g.id for g in db_msg.grupos]
    return db_msg

@router.delete("/mensagens/{mensagem_id}", dependencies=[Depends(security.get_api_key)])
def deletar_mensagem(mensagem_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemDisparada).filter(models.MensagemDisparada.id == mensagem_id, models.MensagemDisparada.cliente_id == cid).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    
    db.delete(db_msg)
    db.commit()
    return {"message": "Mensagem deletada com sucesso"}

@router.patch("/mensagens/{mensagem_id}/toggle", response_model=schemas.MensagemDisparada, dependencies=[Depends(security.get_api_key)])
def toggle_mensagem(mensagem_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemDisparada).filter(models.MensagemDisparada.id == mensagem_id, models.MensagemDisparada.cliente_id == cid).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    
    db_msg.ativo = not db_msg.ativo
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.get("/mensagens/export", dependencies=[Depends(security.get_api_key)])
def exportar_mensagens(db: Session = Depends(get_db)):
    from datetime import datetime
    cid = get_active_client_id(db)
    mensagens = db.query(models.MensagemDisparada).filter(
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    ).order_by(models.MensagemDisparada.dia_do_lancamento, models.MensagemDisparada.horario_do_disparo).all()

    export_items = []
    for m in mensagens:
        export_items.append({
            "mensagem": m.mensagem or "",
            "numero_da_mensagem": m.numero_da_mensagem or 1,
            "dia_do_lancamento": m.dia_do_lancamento or 1,
            "horario_do_disparo": m.horario_do_disparo.strftime("%H:%M:%S") if m.horario_do_disparo else "12:00:00",
            "tipo_de_mensagem": m.tipo_de_mensagem or "texto",
            "link_midia": m.link_midia or "",
            "opcoes_enquete": m.opcoes_enquete or "",
            "enquete_multipla": getattr(m, 'enquete_multipla', False) or False,
            "ativo": m.ativo if m.ativo is not None else True
        })

    return {
        "version": "1.0",
        "exported_at": datetime.now().isoformat(),
        "total_messages": len(export_items),
        "items": export_items
    }

@router.post("/mensagens/import", dependencies=[Depends(security.get_api_key)])
def importar_mensagens(payload: dict, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    items = payload.get("items") or payload.get("mensagens") or []
    if not isinstance(items, list) or not items:
        raise HTTPException(status_code=400, detail="Arquivo ou lista de mensagens inválida.")

    imported_count = 0
    for item in items:
        try:
            h_str = item.get("horario_do_disparo", "12:00:00")
            if isinstance(h_str, str):
                parts = h_str.split(":")
                h = int(parts[0])
                m = int(parts[1]) if len(parts) > 1 else 0
                s = int(parts[2]) if len(parts) > 2 else 0
                horario = time(h, m, s)
            else:
                horario = time(12, 0, 0)
        except Exception:
            horario = time(12, 0, 0)

        db_msg = models.MensagemDisparada(
            cliente_id=cid,
            mensagem=item.get("mensagem", ""),
            numero_da_mensagem=int(item.get("numero_da_mensagem", 1)),
            dia_do_lancamento=int(item.get("dia_do_lancamento", 1)),
            horario_do_disparo=horario,
            tipo_de_mensagem=item.get("tipo_de_mensagem", "texto"),
            link_midia=item.get("link_midia", ""),
            opcoes_enquete=item.get("opcoes_enquete", ""),
            enquete_multipla=bool(item.get("enquete_multipla", False)),
            ativo=bool(item.get("ativo", True))
        )
        db.add(db_msg)
        imported_count += 1

    db.commit()
    return {
        "imported_count": imported_count,
        "message": f"{imported_count} mensagem(ns) importada(s) com sucesso!"
    }
