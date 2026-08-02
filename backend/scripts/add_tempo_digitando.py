import os
import sys
from sqlalchemy import create_engine, text

# Ajusta o sys.path para reconhecer a raiz do backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine

def migrate():
    with engine.connect() as conn:
        print("Adicionando coluna 'tempo_digitando_segundos' na tabela 'grupos_whatsapp'...")
        try:
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN tempo_digitando_segundos INTEGER DEFAULT 0;"))
            conn.commit()
            print("Coluna 'tempo_digitando_segundos' adicionada com sucesso!")
        except Exception as e:
            print(f"Aviso ou Erro (pode já existir): {e}")

if __name__ == "__main__":
    migrate()
