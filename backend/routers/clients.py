from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from typing import List

import models, schemas, security
from database import get_db

router = APIRouter(prefix="/clientes", tags=["Gestão de Clientes"])

@router.get("/", response_model=List[schemas.ClienteResponse], dependencies=[Depends(security.get_api_key)])
def listar_clientes(db: Session = Depends(get_db)):
    """
    Retorna todos os clientes/instâncias cadastrados.
    """
    return db.query(models.Cliente).filter(models.Cliente.ativo == True).order_by(models.Cliente.criado_em.asc()).all()

@router.post("/", response_model=schemas.ClienteResponse, dependencies=[Depends(security.get_api_key)])
def criar_cliente(payload: schemas.ClienteCreate, db: Session = Depends(get_db)):
    """
    Cadastra um novo cliente com configurações e credenciais W-API próprias.
    """
    if not payload.nome or not payload.nome.strip():
        raise HTTPException(status_code=400, detail="O nome da empresa/cliente é obrigatório")

    novo_cliente = models.Cliente(
        nome=payload.nome.strip(),
        subtitulo=payload.subtitulo or "CONTROL PANEL",
        logo_url=payload.logo_url or "",
        logo_size=payload.logo_size or 44,
        wapi_instance_id=payload.wapi_instance_id or "",
        wapi_token=payload.wapi_token or "",
        wapi_plan_type=payload.wapi_plan_type or "PRO",
        ativo=True
    )
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)

    # Torna o cliente recém-criado como ativo nas configurações do sistema
    def set_cfg(k, v):
        cfg = db.query(models.Configuracao).filter(models.Configuracao.chave == k).first()
        if cfg:
            cfg.valor = str(v or "")
        else:
            db.add(models.Configuracao(chave=k, valor=str(v or "")))

    set_cfg("ACTIVE_CLIENT_ID", str(novo_cliente.id))
    set_cfg("COMPANY_NAME", novo_cliente.nome)
    set_cfg("COMPANY_LOGO", novo_cliente.logo_url)
    if novo_cliente.wapi_instance_id:
        set_cfg("WAPI_INSTANCE_ID", novo_cliente.wapi_instance_id)
    if novo_cliente.wapi_token:
        set_cfg("WAPI_TOKEN", novo_cliente.wapi_token)
    if novo_cliente.wapi_plan_type:
        set_cfg("WHATSAPP_PLAN_TYPE", novo_cliente.wapi_plan_type)
    
    db.commit()

    return novo_cliente

@router.post("/{client_id}/selecionar", dependencies=[Depends(security.get_api_key)])
def selecionar_cliente(client_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Muda o cliente ativo na aplicação.
    """
    cliente = db.query(models.Cliente).filter(models.Cliente.id == client_id, models.Cliente.ativo == True).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    def set_cfg(k, v):
        cfg = db.query(models.Configuracao).filter(models.Configuracao.chave == k).first()
        if cfg:
            cfg.valor = str(v or "")
        else:
            db.add(models.Configuracao(chave=k, valor=str(v or "")))

    set_cfg("ACTIVE_CLIENT_ID", str(cliente.id))
    set_cfg("COMPANY_NAME", cliente.nome or "")
    set_cfg("COMPANY_LOGO", cliente.logo_url or "")
    set_cfg("COMPANY_LOGO_SIZE", str(cliente.logo_size or 44))
    set_cfg("WAPI_INSTANCE_ID", cliente.wapi_instance_id or "")
    set_cfg("WAPI_TOKEN", cliente.wapi_token or "")
    set_cfg("WHATSAPP_PLAN_TYPE", cliente.wapi_plan_type or "PRO")

    db.commit()

    return {
        "status": "success",
        "message": f"Cliente alterado para '{cliente.nome}'",
        "cliente": {
            "id": str(cliente.id),
            "nome": cliente.nome,
            "logo_url": cliente.logo_url,
            "wapi_instance_id": cliente.wapi_instance_id,
            "wapi_plan_type": cliente.wapi_plan_type
        }
    }

@router.delete("/{client_id}", dependencies=[Depends(security.get_api_key)])
def deletar_cliente(client_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Remove um cliente do sistema.
    """
    cliente = db.query(models.Cliente).filter(models.Cliente.id == client_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    total_clientes = db.query(models.Cliente).filter(models.Cliente.ativo == True).count()
    if total_clientes <= 1:
        raise HTTPException(status_code=400, detail="É necessário manter pelo menos 1 cliente no sistema")

    cliente.ativo = False
    db.commit()

    # Se o cliente deletado era o ativo, seleciona o próximo disponível
    cfg_active = db.query(models.Configuracao).filter(models.Configuracao.chave == "ACTIVE_CLIENT_ID").first()
    if cfg_active and cfg_active.valor == str(cliente.id):
        proximo = db.query(models.Cliente).filter(models.Cliente.ativo == True).first()
        if proximo:
            def set_cfg(k, v):
                cfg = db.query(models.Configuracao).filter(models.Configuracao.chave == k).first()
                if cfg:
                    cfg.valor = str(v or "")
                else:
                    db.add(models.Configuracao(chave=k, valor=str(v or "")))

            set_cfg("ACTIVE_CLIENT_ID", str(proximo.id))
            set_cfg("COMPANY_NAME", proximo.nome)
            set_cfg("COMPANY_LOGO", proximo.logo_url or "")
            if proximo.wapi_instance_id:
                set_cfg("WAPI_INSTANCE_ID", proximo.wapi_instance_id)
            if proximo.wapi_token:
                set_cfg("WAPI_TOKEN", proximo.wapi_token)
            if proximo.wapi_plan_type:
                set_cfg("WHATSAPP_PLAN_TYPE", proximo.wapi_plan_type)
            db.commit()

    return {"status": "success", "message": "Cliente desativado com sucesso"}
