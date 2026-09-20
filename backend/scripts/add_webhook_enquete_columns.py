"""
Script de migração: adiciona colunas webhook_enquete_ativo e webhook_enquete_url na tabela grupos_whatsapp.
Permite que cada grupo configure o envio de votos e respostas de enquetes para um webhook externo.

Execute com: python backend/scripts/add_webhook_enquete_columns.py
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/zapgrupo")

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                ALTER TABLE grupos_whatsapp
                ADD COLUMN IF NOT EXISTS webhook_enquete_ativo BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS webhook_enquete_url TEXT,
                ADD COLUMN IF NOT EXISTS webhook_enquete_delay_segundos INTEGER DEFAULT 0;
            """))
            conn.commit()
            print("[OK] Colunas 'webhook_enquete_ativo', 'webhook_enquete_url' e 'webhook_enquete_delay_segundos' adicionadas com sucesso à tabela 'grupos_whatsapp'.")
        except Exception as e:
            print(f"[ERRO] Falha ao adicionar colunas de webhook de enquete: {e}")

if __name__ == "__main__":
    migrate()
