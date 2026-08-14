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
    etiqueta: Optional[str] = None,
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
    
    if etiqueta:
        query = query.filter(models.MensagemDisparada.etiqueta == etiqueta)

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
    dados = mensagem.dict(exclude={"grupo_ids"})
    dados["cliente_id"] = cid
    db_mensagem = models.MensagemDisparada(**dados)
    
    if mensagem.grupo_ids:
        grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_(mensagem.grupo_ids)).all()
        db_mensagem.grupos = grupos
        
    db.add(db_mensagem)
    db.commit()
    db.refresh(db_mensagem)
    db_mensagem.grupo_ids = [g.id for g in db_mensagem.grupos]
    return db_mensagem

@router.put("/mensagens/{mensagem_id}", response_model=schemas.MensagemDisparada, dependencies=[Depends(security.get_api_key)])
def atualizar_mensagem(mensagem_id: uuid.UUID, mensagem: schemas.MensagemDisparadaCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.id == mensagem_id,
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    ).first()
    
    if not db_msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
        
    dados = mensagem.dict(exclude={"grupo_ids"})
    for key, value in dados.items():
        setattr(db_msg, key, value)
        
    if mensagem.grupo_ids is not None:
        grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_(mensagem.grupo_ids)).all()
        db_msg.grupos = grupos
        
    db.commit()
    db.refresh(db_msg)
    db_msg.grupo_ids = [g.id for g in db_msg.grupos]
    return db_msg

@router.delete("/mensagens/{mensagem_id}", dependencies=[Depends(security.get_api_key)])
def deletar_mensagem(mensagem_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.id == mensagem_id,
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    ).first()
    
    if not db_msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
        
    db.delete(db_msg)
    db.commit()
    return {"message": "Mensagem deletada com sucesso"}

@router.delete("/mensagens/bulk", dependencies=[Depends(security.get_api_key)])
def deletar_mensagens_bulk(payload: schemas.MensagemBulkDelete, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    if not payload.ids:
        return {"message": "Nenhuma mensagem especificada", "deleted_count": 0}

    query = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.id.in_(payload.ids),
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    )
    mensagens = query.all()
    deleted_count = len(mensagens)

    for m in mensagens:
        db.delete(m)

    db.commit()
    return {"message": f"{deleted_count} mensagem(ns) deletada(s) com sucesso", "deleted_count": deleted_count}

@router.patch("/mensagens/bulk-grupos", dependencies=[Depends(security.get_api_key)])
def atribuir_grupos_bulk(payload: schemas.MensagemBulkAssignGroups, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    if not payload.ids:
        return {"message": "Nenhuma mensagem especificada", "updated_count": 0}

    query = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.id.in_(payload.ids),
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    )
    mensagens = query.all()

    grupos = []
    if payload.grupo_ids:
        grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_(payload.grupo_ids)).all()

    for m in mensagens:
        m.grupos = grupos

    db.commit()
    return {"message": f"Grupos atualizados para {len(mensagens)} mensagem(ns)", "updated_count": len(mensagens)}

@router.post("/mensagens/bulk-duplicate", dependencies=[Depends(security.get_api_key)])
def duplicar_mensagens_bulk(payload: schemas.MensagemBulkDuplicate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    if not payload.ids:
        return {"message": "Nenhuma mensagem especificada", "duplicated_count": 0}

    mensagens_originais = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.id.in_(payload.ids),
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    ).all()

    if not mensagens_originais:
        raise HTTPException(status_code=404, detail="Nenhuma mensagem encontrada para duplicação")

    grupos = []
    if payload.grupo_ids:
        grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_(payload.grupo_ids)).all()

    novas_mensagens = []
    for msg in mensagens_originais:
        nova_msg = models.MensagemDisparada(
            cliente_id=cid,
            mensagem=msg.mensagem,
            numero_da_mensagem=msg.numero_da_mensagem,
            dia_do_lancamento=payload.dia_do_lancamento,
            horario_do_disparo=msg.horario_do_disparo,
            tipo_de_mensagem=msg.tipo_de_mensagem,
            link_midia=msg.link_midia,
            opcoes_enquete=msg.opcoes_enquete,
            enquete_multipla=msg.enquete_multipla,
            admin_only_settings=msg.admin_only_settings,
            etiqueta=msg.etiqueta,
            status="pendente",
            ativo=msg.ativo,
            grupos=grupos
        )
        db.add(nova_msg)
        novas_mensagens.append(nova_msg)

    db.commit()
    return {
        "message": f"{len(novas_mensagens)} mensagem(ns) duplicada(s) com sucesso para o Dia {payload.dia_do_lancamento}",
        "duplicated_count": len(novas_mensagens)
    }

@router.patch("/mensagens/{mensagem_id}/toggle", response_model=schemas.MensagemDisparada, dependencies=[Depends(security.get_api_key)])
def toggle_mensagem_ativa(mensagem_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_msg = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.id == mensagem_id,
        or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))
    ).first()
    
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
            "admin_only_settings": getattr(m, 'admin_only_settings', None),
            "etiqueta": m.etiqueta or "",
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
            admin_only_settings=item.get("admin_only_settings"),
            etiqueta=item.get("etiqueta") or None,
            ativo=bool(item.get("ativo", True))
        )
        db.add(db_msg)
        imported_count += 1

    db.commit()
    return {
        "imported_count": imported_count,
        "message": f"{imported_count} mensagem(ns) importada(s) com sucesso!"
    }
