import os
import sys
from sqlalchemy import create_engine, text

# Adiciona o diretório /app ao sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def run_migration():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL não encontrada no ambiente.")
        return

    # Ajusta URL se for para o container (localhost -> postgres)
    if "localhost" in database_url and os.path.exists("/.dockerenv"):
        database_url = database_url.replace("localhost", "postgres")

    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        print("Verificando coluna 'no_grupo' na tabela 'contatos_grupos'...")
        try:
            # Postgres: checa se a coluna existe
            res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='contatos_grupos' AND column_name='no_grupo';"))
            if not res.fetchone():
                print("Adicionando coluna 'no_grupo'...")
                conn.execute(text("ALTER TABLE contatos_grupos ADD COLUMN no_grupo BOOLEAN DEFAULT TRUE;"))
                conn.commit()
                print("Coluna adicionada com sucesso.")
            else:
                print("Coluna 'no_grupo' já existe.")
        except Exception as e:
            print(f"Erro ao migrar banco de dados: {e}")
            # Tenta sem commit se o banco não suportar (SQLite fallback)
            try:
                conn.execute(text("ALTER TABLE contatos_grupos ADD COLUMN no_grupo BOOLEAN DEFAULT TRUE;"))
                print("Coluna adicionada com sucesso (SQLite fallback).")
            except:
                pass

if __name__ == "__main__":
    run_migration()
