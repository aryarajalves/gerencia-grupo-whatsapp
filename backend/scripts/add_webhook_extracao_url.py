"""
Script de migração: adiciona coluna webhook_extracao_url na tabela grupos_whatsapp.
Permite que cada grupo tenha um webhook configurado para receber dados de novos contatos extraídos.

Execute com: python backend/scripts/add_webhook_extracao_url.py
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
                ADD COLUMN IF NOT EXISTS webhook_extracao_url TEXT;
            """))
            conn.commit()
            print("[OK] Coluna 'webhook_extracao_url' adicionada com sucesso à tabela 'grupos_whatsapp'.")
        except Exception as e:
            print(f"[ERRO] Falha ao adicionar coluna: {e}")

if __name__ == "__main__":
    migrate()
