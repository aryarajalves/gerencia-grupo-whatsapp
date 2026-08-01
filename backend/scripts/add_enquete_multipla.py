import sqlite3
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv(dotenv_path="backend/.env")

# Caminho para o banco SQLite (ajuste se necessário para o ambiente de dev)
DB_PATH = "backend/database.db"

def migrate():
    print("Iniciando migração: Adicionando coluna 'enquete_multipla' em 'mensagens_disparadas'...")
    
    # Se estiver usando SQLite localmente
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("ALTER TABLE mensagens_disparadas ADD COLUMN enquete_multipla BOOLEAN DEFAULT 0")
            conn.commit()
            conn.close()
            print("[OK] Coluna adicionada via SQLite.")
        except Exception as e:
            if "duplicate column name" in str(e).lower():
                print("[INFO] Coluna já existe.")
            else:
                print(f"[ERRO] Falha ao migrar SQLite: {e}")

    # Tentar via SQLAlchemy (para PostgreSQL em produção)
    try:
        # Pega a URL do banco do .env ou usa o padrão
        db_url = os.getenv("DATABASE_URL", "sqlite:///./backend/database.db")
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE mensagens_disparadas ADD COLUMN IF NOT EXISTS enquete_multipla BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("[OK] Migração concluída via SQLAlchemy.")
    except Exception as e:
        print(f"[AVISO] SQLAlchemy migração (pode falhar em SQLite se já feita): {e}")

if __name__ == "__main__":
    migrate()
