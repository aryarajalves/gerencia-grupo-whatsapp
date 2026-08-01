import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Adiciona o diretório pai ao path para importar models/database se necessário
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def migrate():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Erro: DATABASE_URL não encontrada no .env")
        return

    print(f"Conectando ao banco de dados...")
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        print("Iniciando migração da tabela mensagens_capturadas...")

        # Adicionar coluna message_id
        try:
            conn.execute(text("ALTER TABLE mensagens_capturadas ADD COLUMN message_id VARCHAR"))
            conn.commit()
            print("Coluna 'message_id' adicionada.")
        except Exception as e:
            print(f"Aviso ao adicionar 'message_id': {e}")

        # Adicionar coluna from_me
        try:
            conn.execute(text("ALTER TABLE mensagens_capturadas ADD COLUMN from_me BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Coluna 'from_me' adicionada.")
        except Exception as e:
            print(f"Aviso ao adicionar 'from_me': {e}")

        # Criar índice para message_id
        try:
            conn.execute(text("CREATE INDEX ix_mensagens_capturadas_message_id ON mensagens_capturadas (message_id)"))
            conn.commit()
            print("Índice para 'message_id' criado.")
        except Exception as e:
            print(f"Aviso ao criar índice: {e}")

    print("Migração concluída.")

if __name__ == "__main__":
    migrate()
