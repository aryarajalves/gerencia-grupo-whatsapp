import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")
from database import engine

def migrate():
    print("Iniciando migração para webhook_enquete_ids...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN webhook_enquete_ids TEXT;"))
            conn.commit()
            print("Coluna 'webhook_enquete_ids' adicionada em 'grupos_whatsapp'.")
        except Exception as e:
            print(f"Nota (grupos_whatsapp.webhook_enquete_ids): {e}")

if __name__ == "__main__":
    migrate()
