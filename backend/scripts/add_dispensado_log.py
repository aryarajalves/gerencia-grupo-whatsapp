import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

load_dotenv()

def migrate():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL não configurada no .env")
        return

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            conn.execute(text(
                "ALTER TABLE logs_disparos ADD COLUMN IF NOT EXISTS dispensado BOOLEAN DEFAULT FALSE"
            ))
            conn.commit()
            print("Coluna 'dispensado' adicionada em 'logs_disparos' com sucesso!")
    except Exception as e:
        print(f"Erro ao executar migração: {e}")

if __name__ == "__main__":
    migrate()
