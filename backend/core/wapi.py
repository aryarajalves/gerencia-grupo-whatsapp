import os
import httpx
import models

WAPI_BASE = "https://api.w-api.app/v1"

def get_system_config(db, chave, env_fallback):
    config = db.query(models.Configuracao).filter(models.Configuracao.chave == chave).first()
    if config and config.valor:
        return config.valor
    return os.getenv(env_fallback, "")

def set_system_config(db, chave, valor):
    db.query(models.Configuracao).filter(models.Configuracao.chave == chave).delete()
    db.add(models.Configuracao(chave=chave, valor=valor))
    db.commit()

def get_wapi_headers(db):
    token = get_system_config(db, "WAPI_TOKEN", "WAPI_TOKEN")
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def get_wapi_instance(db):
    return get_system_config(db, "WAPI_INSTANCE_ID", "WAPI_INSTANCE_ID")

ENDPOINT_MAP = {
    "texto":     "/message/send-text",
    "imagem":    "/message/send-image",
    "video":     "/message/send-video",
    "audio":     "/message/send-audio",
    "arquivo":   "/message/send-document",
    "documento": "/message/send-document",
    "enquete":   "/message/send-poll",
    "nome_grupo": "/group/update-group-name",
    "revoke":    "/instances/{id}/client/action/delete-message-by-id",
    "download_media": "/message/download-media",
}
