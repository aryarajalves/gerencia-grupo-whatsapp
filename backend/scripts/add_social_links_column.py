import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    if not DATABASE_URL:
        print("DATABASE_URL não configurada no .env")
        return

    engine = create_engine(DATABASE_URL)
    
    print(f"Iniciando migração no PostgreSQL: Adicionando coluna social_links...")

    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE conjuntos_grupos ADD COLUMN IF NOT EXISTS social_links TEXT"))
            conn.commit()
            print("Coluna social_links verificada/adicionada com sucesso!")
    except Exception as e:
        print(f"Ocorreu um erro durante a migração: {e}")

if __name__ == "__main__":
    migrate()
