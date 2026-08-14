import os
import sys
from sqlalchemy import create_engine, text, inspect

# Adiciona o diretório pai ao sys.path para importar models/database se necessário
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:35cb19b8-13cd-4f02-af3e-abdcdd373ae5@localhost:5432/zapgroup")

def migrate():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        if inspector.has_table('grupos_whatsapp'):
            columns = [c['name'] for c in inspector.get_columns('grupos_whatsapp')]
            if 'numero_fantasma_ativo' not in columns:
                print("Adicionando coluna 'numero_fantasma_ativo' em 'grupos_whatsapp'...")
                conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN numero_fantasma_ativo BOOLEAN DEFAULT FALSE;"))
                conn.commit()
                print("Coluna adicionada com sucesso.")
            else:
                print("Coluna 'numero_fantasma_ativo' já existe na tabela 'grupos_whatsapp'.")

if __name__ == "__main__":
    migrate()
