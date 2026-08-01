import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models, security
from database import get_db

router = APIRouter(tags=["Configurações"])

@router.get("/config/public")
def get_config_public(db: Session = Depends(get_db)):
    chaves = ["COMPANY_NAME", "COMPANY_LOGO", "COMPANY_LOGO_SIZE"]
    configs = db.query(models.Configuracao).filter(models.Configuracao.chave.in_(chaves)).all()
    return {c.chave: c.valor for c in configs}

@router.get("/config/", dependencies=[Depends(security.get_api_key)])
def get_config(db: Session = Depends(get_db)):
    configs = db.query(models.Configuracao).all()
    res = {c.chave: (c.valor or "") for c in configs}
    # Priorizar o .env para as URLs
    res["BASE_URL"] = os.getenv("BASE_URL", res.get("BASE_URL", ""))
    res["FRONTEND_URL"] = os.getenv("FRONTEND_URL", "http://localhost:5173")
    if "WAPI_TOKEN" not in res or not res["WAPI_TOKEN"]:
        res["WAPI_TOKEN"] = os.getenv("WAPI_TOKEN", "")
    if "WAPI_INSTANCE_ID" not in res or not res["WAPI_INSTANCE_ID"]:
        res["WAPI_INSTANCE_ID"] = os.getenv("WAPI_INSTANCE_ID", "")
    return res

import uuid

@router.post("/config/", dependencies=[Depends(security.check_super_admin)])
def update_config(data: dict, db: Session = Depends(get_db)):
    for chave, valor in data.items():
        val_str = str(valor).strip() if valor is not None else ""
        db_conf = db.query(models.Configuracao).filter(models.Configuracao.chave == chave).first()
        if db_conf:
            db_conf.valor = val_str
        else:
            db.add(models.Configuracao(chave=chave, valor=val_str))
    db.commit()

    # Sincroniza com a tabela Cliente do cliente ativo
    cfg_active = db.query(models.Configuracao).filter(models.Configuracao.chave == "ACTIVE_CLIENT_ID").first()
    if cfg_active and cfg_active.valor:
        try:
            cid = uuid.UUID(cfg_active.valor)
            cliente = db.query(models.Cliente).filter(models.Cliente.id == cid).first()
            if cliente:
                if "COMPANY_NAME" in data and data["COMPANY_NAME"] is not None:
                    cliente.nome = str(data["COMPANY_NAME"]).strip()
                if "COMPANY_LOGO" in data and data["COMPANY_LOGO"] is not None:
                    cliente.logo_url = str(data["COMPANY_LOGO"]).strip()
                if "COMPANY_LOGO_SIZE" in data and data["COMPANY_LOGO_SIZE"] is not None:
                    try:
                        cliente.logo_size = int(data["COMPANY_LOGO_SIZE"])
                    except ValueError: pass
                if "WAPI_INSTANCE_ID" in data and data["WAPI_INSTANCE_ID"] is not None:
                    cliente.wapi_instance_id = str(data["WAPI_INSTANCE_ID"]).strip()
                if "WAPI_TOKEN" in data and data["WAPI_TOKEN"] is not None:
                    cliente.wapi_token = str(data["WAPI_TOKEN"]).strip()
                if "WHATSAPP_PLAN_TYPE" in data and data["WHATSAPP_PLAN_TYPE"] is not None:
                    cliente.wapi_plan_type = str(data["WHATSAPP_PLAN_TYPE"]).strip()
                db.commit()
        except Exception as e:
            print(f"Erro ao sincronizar cliente ativo com config: {e}")

    return {"message": "Configurações atualizadas"}
