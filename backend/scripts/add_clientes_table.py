import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
import models
from sqlalchemy import inspect
from sqlalchemy.orm import Session

def migrate():
    print("Iniciando migração da tabela 'clientes'...")
    Base.metadata.create_all(bind=engine)
    
    inspector = inspect(engine)
    if inspector.has_table('clientes'):
        print("Tabela 'clientes' verificada com sucesso!")
        with Session(engine) as db:
            count = db.query(models.Cliente).count()
            if count == 0:
                c_nome = db.query(models.Configuracao).filter(models.Configuracao.chave == "COMPANY_NAME").first()
                c_logo = db.query(models.Configuracao).filter(models.Configuracao.chave == "COMPANY_LOGO").first()
                w_inst = db.query(models.Configuracao).filter(models.Configuracao.chave == "WAPI_INSTANCE_ID").first()
                w_tok = db.query(models.Configuracao).filter(models.Configuracao.chave == "WAPI_TOKEN").first()
                w_plan = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
                
                cliente_padrao = models.Cliente(
                    nome=c_nome.valor if (c_nome and c_nome.valor) else "Empresa de Teste",
                    subtitulo="CONTROL PANEL",
                    logo_url=c_logo.valor if (c_logo and c_logo.valor) else "",
                    wapi_instance_id=w_inst.valor if (w_inst and w_inst.valor) else "",
                    wapi_token=w_tok.valor if (w_tok and w_tok.valor) else "",
                    wapi_plan_type=w_plan.valor if (w_plan and w_plan.valor) else "PRO",
                    ativo=True
                )
                db.add(cliente_padrao)
                db.commit()
                print(f"Cliente inicial inserido: {cliente_padrao.nome} (ID: {cliente_padrao.id})")
            else:
                print(f"Já existem {count} cliente(s) cadastrado(s).")

if __name__ == "__main__":
    migrate()
