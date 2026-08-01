from sqlalchemy.orm import Session
import uuid
import models

def get_active_client_id(db: Session) -> uuid.UUID:
    """
    Retorna o ID do cliente/instância atualmente ativo no sistema.
    Se não houver nenhum selecionado ou cadastrado, resolve ou cria o cliente padrão.
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

    # Se não houver nenhum cliente cadastrado no banco, cria o cliente padrão inicial
    c_nome = db.query(models.Configuracao).filter(models.Configuracao.chave == "COMPANY_NAME").first()
    c_logo = db.query(models.Configuracao).filter(models.Configuracao.chave == "COMPANY_LOGO").first()
    w_inst = db.query(models.Configuracao).filter(models.Configuracao.chave == "WAPI_INSTANCE_ID").first()
    w_tok = db.query(models.Configuracao).filter(models.Configuracao.chave == "WAPI_TOKEN").first()
    w_plan = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()

    padrao = models.Cliente(
        nome=c_nome.valor if (c_nome and c_nome.valor) else "Empresa de Teste",
        subtitulo="CONTROL PANEL",
        logo_url=c_logo.valor if (c_logo and c_logo.valor) else "",
        wapi_instance_id=w_inst.valor if (w_inst and w_inst.valor) else "",
        wapi_token=w_tok.valor if (w_tok and w_tok.valor) else "",
        wapi_plan_type=w_plan.valor if (w_plan and w_plan.valor) else "PRO",
        ativo=True
    )
    db.add(padrao)
    db.commit()
    db.refresh(padrao)

    if cfg:
        cfg.valor = str(padrao.id)
    else:
        db.add(models.Configuracao(chave="ACTIVE_CLIENT_ID", valor=str(padrao.id)))
    db.commit()

    return padrao.id
