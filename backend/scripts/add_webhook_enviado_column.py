"""
Script de migração: adiciona colunas webhook_enviado e webhook_enviado_em na tabela contatos_grupos.
Permite rastrear exatamente quais contatos já foram despachados com sucesso para o webhook do grupo.

Execute com: python backend/scripts/add_webhook_enviado_column.py
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/zapgroup")

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                ALTER TABLE contatos_grupos
                ADD COLUMN IF NOT EXISTS webhook_enviado BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS webhook_enviado_em TIMESTAMP NULL;
            """))
            conn.commit()
            print("[OK] Colunas 'webhook_enviado' e 'webhook_enviado_em' adicionadas com sucesso à tabela 'contatos_grupos'.")
        except Exception as e:
            print(f"[ERRO] Falha ao adicionar colunas de webhook: {e}")

if __name__ == "__main__":
    migrate()
