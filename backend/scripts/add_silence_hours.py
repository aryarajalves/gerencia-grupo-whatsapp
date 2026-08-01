import sys
import os

# Adiciona o diretório atual ao sys.path para importar models e database
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import SessionLocal
import models

def add_silence_hours_config():
    db = SessionLocal()
    try:
        configs = [
            {"chave": "SILENCE_HOURS_ENABLED", "valor": "false"},
            {"chave": "SILENCE_HOURS_START", "valor": "22:00"},
            {"chave": "SILENCE_HOURS_END", "valor": "08:00"}
        ]
        
        for cfg in configs:
            existe = db.query(models.Configuracao).filter(models.Configuracao.chave == cfg["chave"]).first()
            if not existe:
                nova_cfg = models.Configuracao(chave=cfg["chave"], valor=cfg["valor"])
                db.add(nova_cfg)
                print(f"Adicionada configuração: {cfg['chave']} = {cfg['valor']}")
            else:
                print(f"Configuração já existe: {cfg['chave']}")
        
        db.commit()
        print("Migração concluída com sucesso!")
        
        # Log no DATABASE_SCHEMA_LOG.md
        log_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'DATABASE_SCHEMA_LOG.md'))
        with open(log_path, 'a', encoding='utf-8') as f:
            from datetime import datetime
            f.write(f"\n| {datetime.now().strftime('%Y-%m-%d')} | configuracoes | SILENCE_HOURS_ENABLED, SILENCE_HOURS_START, SILENCE_HOURS_END | add_silence_hours.py | Adição de configurações de horário de silêncio |\n")

    except Exception as e:
        print(f"Erro na migração: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_silence_hours_config()
