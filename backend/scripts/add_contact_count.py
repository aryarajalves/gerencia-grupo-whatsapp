import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Adiciona o diretório pai ao sys.path para importar o models se necessário
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

load_dotenv()

def migrate():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL não configurada no .env")
        return

    # Força o uso de postgresql se estiver usando o driver padrão
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN IF NOT EXISTS quantidade_contatos INTEGER DEFAULT 0"))
            conn.commit()
            print("Coluna 'quantidade_contatos' adicionada (ou já existia) com sucesso!")
    except Exception as e:
        print(f"Erro ao executar migração: {e}")

if __name__ == "__main__":
    migrate()
