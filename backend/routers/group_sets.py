from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

import models, schemas, security
from database import get_db
from client_context import get_active_client_id

router = APIRouter(tags=["Conjuntos de Grupos"], prefix="/conjuntos")

@router.get("/", response_model=List[schemas.ConjuntoGrupo], dependencies=[Depends(security.get_api_key)])
def listar_conjuntos(db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    conjuntos = db.query(models.ConjuntoGrupo).filter(models.ConjuntoGrupo.cliente_id == cid).all()
    
    # Enriquecer com dados dos grupos
    for c in conjuntos:
        associacoes = db.query(models.GrupoConjuntoAssociacao).filter_by(conjunto_id=c.id).order_by(models.GrupoConjuntoAssociacao.posicao).all()
        c.grupos = []
        for assoc in associacoes:
            grupo = db.query(models.GrupoWhatsApp).filter_by(id=assoc.grupo_id).first()
            if grupo:
                # Criar objeto Pydantic-like para o schema
                g_assoc = schemas.GrupoConjuntoAssociacao(
                    id=assoc.id,
                    conjunto_id=assoc.conjunto_id,
                    grupo_id=assoc.grupo_id,
                    posicao=assoc.posicao,
                    max_leads=assoc.max_leads,
                    grupo_nome=grupo.nome,
                    quantidade_contatos=grupo.quantidade_contatos,
                    link_convite=grupo.link_convite
                )
                c.grupos.append(g_assoc)
    return conjuntos

@router.post("/", response_model=schemas.ConjuntoGrupo, dependencies=[Depends(security.get_api_key)])
def criar_conjunto(conjunto: schemas.ConjuntoGrupoCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    # Verificar se o slug já existe
    if db.query(models.ConjuntoGrupo).filter_by(slug=conjunto.slug).first():
        raise HTTPException(status_code=400, detail="Este slug já está em uso.")

    db_conjunto = models.ConjuntoGrupo(
        cliente_id=cid,
        nome=conjunto.nome,
        slug=conjunto.slug,
        ativo=conjunto.ativo,
        social_links=conjunto.social_links
    )
    db.add(db_conjunto)
    db.commit()
    db.refresh(db_conjunto)

    # Adicionar associações
    for item in conjunto.grupos:
        assoc = models.GrupoConjuntoAssociacao(
            conjunto_id=db_conjunto.id,
            grupo_id=item.grupo_id,
            posicao=item.posicao,
            max_leads=item.max_leads
        )
        db.add(assoc)
    
    db.commit()
    db.refresh(db_conjunto)
    return db_conjunto

@router.put("/{conjunto_id}", response_model=schemas.ConjuntoGrupo, dependencies=[Depends(security.get_api_key)])
def atualizar_conjunto(conjunto_id: uuid.UUID, conjunto: schemas.ConjuntoGrupoCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_conjunto = db.query(models.ConjuntoGrupo).filter(models.ConjuntoGrupo.id == conjunto_id, models.ConjuntoGrupo.cliente_id == cid).first()
    if not db_conjunto:
        raise HTTPException(status_code=404, detail="Conjunto não encontrado")

    # Verificar slug
    if db_conjunto.slug != conjunto.slug:
        if db.query(models.ConjuntoGrupo).filter_by(slug=conjunto.slug).first():
            raise HTTPException(status_code=400, detail="Este slug já está em uso.")

    db_conjunto.nome = conjunto.nome
    db_conjunto.slug = conjunto.slug
    db_conjunto.ativo = conjunto.ativo
    db_conjunto.social_links = conjunto.social_links
    db_conjunto.cliente_id = cid

    # Atualizar associações (remover antigas e adicionar novas para simplicidade)
    db.query(models.GrupoConjuntoAssociacao).filter_by(conjunto_id=conjunto_id).delete()
    
    for item in conjunto.grupos:
        assoc = models.GrupoConjuntoAssociacao(
            conjunto_id=db_conjunto.id,
            grupo_id=item.grupo_id,
            posicao=item.posicao,
            max_leads=item.max_leads
        )
        db.add(assoc)

    db.commit()
    db.refresh(db_conjunto)
    return db_conjunto

@router.delete("/{conjunto_id}", dependencies=[Depends(security.get_api_key)])
def deletar_conjunto(conjunto_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_conjunto = db.query(models.ConjuntoGrupo).filter(models.ConjuntoGrupo.id == conjunto_id, models.ConjuntoGrupo.cliente_id == cid).first()
    if not db_conjunto:
        raise HTTPException(status_code=404, detail="Conjunto não encontrado")
    
    db.delete(db_conjunto)
    db.commit()
    return {"message": "Conjunto deletado com sucesso"}
