from sqlalchemy.orm import Session
import uuid
import models

def get_active_client_id(db: Session) -> uuid.UUID | None:
    """
    Retorna o ID do cliente/instância atualmente ativo no sistema.
    Se não houver nenhum cliente cadastrado/ativo, retorna None.
    """
    cfg = db.query(models.Configuracao).filter(models.Configuracao.chave == "ACTIVE_CLIENT_ID").first()
    if cfg and cfg.valor:
        try:
            cid = uuid.UUID(cfg.valor)
            cliente = db.query(models.Cliente).filter(models.Cliente.id == cid, models.Cliente.ativo == True).first()
            if cliente:
                return cliente.id
        except Exception:
            pass

    # Se a config não foi encontrada ou o cliente foi desativado, pega o primeiro cliente ativo
    cliente = db.query(models.Cliente).filter(models.Cliente.ativo == True).order_by(models.Cliente.criado_em.asc()).first()
    if cliente:
        # Atualiza a config para sincronizar
        if cfg:
            cfg.valor = str(cliente.id)
        else:
            db.add(models.Configuracao(chave="ACTIVE_CLIENT_ID", valor=str(cliente.id)))
        db.commit()
        return cliente.id

    return None
