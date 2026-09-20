import os
import sys
from sqlalchemy import text

# Adiciona o diretório atual ao sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")

from database import engine

def migrate():
    print("Iniciando migração para webhook_enquete_modo e webhook_enquete_ativo...")
    with engine.connect() as conn:
        try:
            # 1. Coluna webhook_enquete_modo em grupos_whatsapp
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN webhook_enquete_modo VARCHAR(50) DEFAULT 'todas';"))
            print("Coluna 'webhook_enquete_modo' adicionada em 'grupos_whatsapp'.")
        except Exception as e:
            print(f"Nota (grupos_whatsapp.webhook_enquete_modo): {e}")

        try:
            # 2. Coluna webhook_enquete_ativo em mensagens_disparadas
            conn.execute(text("ALTER TABLE mensagens_disparadas ADD COLUMN webhook_enquete_ativo BOOLEAN DEFAULT TRUE;"))
            print("Coluna 'webhook_enquete_ativo' adicionada em 'mensagens_disparadas'.")
        except Exception as e:
            print(f"Nota (mensagens_disparadas.webhook_enquete_ativo): {e}")

        conn.commit()
    print("Migração concluída com sucesso!")

if __name__ == "__main__":
    migrate()
