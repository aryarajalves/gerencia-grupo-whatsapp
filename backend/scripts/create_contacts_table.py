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
        database_url = database_url.replace("postgres://", "postgres://", 1) # SQLAlchemy 1.4+ needs postgresql://

    # Ensure postgresql://
    database_url = database_url.replace("postgres://", "postgresql://")

    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            # SQL para criar a tabela se não existir
            sql = """
            CREATE TABLE IF NOT EXISTS contatos_grupos (
                id UUID PRIMARY KEY,
                nome VARCHAR,
                numero VARCHAR,
                jid_grupo VARCHAR,
                nome_grupo VARCHAR,
                extraido_em TIMESTAMP WITHOUT TIME ZONE
            );
            
            -- Índice para evitar duplicatas (mesmo número no mesmo grupo)
            CREATE UNIQUE INDEX IF NOT EXISTS idx_contato_grupo_unico ON contatos_grupos (numero, jid_grupo);
            """
            conn.execute(text(sql))
            conn.commit()
            print("Tabela 'contatos_grupos' criada com sucesso!")
    except Exception as e:
        print(f"Erro ao executar migração: {e}")

if __name__ == "__main__":
    migrate()
