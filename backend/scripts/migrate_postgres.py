import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Usa a URL do ambiente ou a padrão do docker
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:35cb19b8-13cd-4f02-af3e-abdcdd373ae5@postgres:5432/zapgroup")

def migrate():
    engine = create_engine(DATABASE_URL)
    
    print(f"Conectando ao banco de dados: {DATABASE_URL}")
    
    with engine.connect() as conn:
        print("Iniciando migração da tabela mensagens_capturadas no Postgres...")
        
        # Adiciona media_url
        try:
            conn.execute(text("ALTER TABLE mensagens_capturadas ADD COLUMN IF NOT EXISTS media_url TEXT"))
            conn.commit()
            print("Coluna 'media_url' verificada/adicionada.")
        except Exception as e:
            print(f"Erro ao adicionar media_url: {e}")

        # Adiciona media_type
        try:
            conn.execute(text("ALTER TABLE mensagens_capturadas ADD COLUMN IF NOT EXISTS media_type TEXT"))
            conn.commit()
            print("Coluna 'media_type' verificada/adicionada.")
        except Exception as e:
            print(f"Erro ao adicionar media_type: {e}")

    print("Migração concluída com sucesso!")

if __name__ == "__main__":
    migrate()
