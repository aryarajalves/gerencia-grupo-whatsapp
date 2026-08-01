import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    # Caminho para o banco SQLite (ajuste se estiver usando Postgres no .env)
    db_path = "zapgroup.db"
    
    if not os.path.exists(db_path):
        print(f"Banco de dados {db_path} não encontrado.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Iniciando migração da tabela mensagens_capturadas...")

    try:
        # Adiciona media_url
        cursor.execute("ALTER TABLE mensagens_capturadas ADD COLUMN media_url TEXT")
        print("Coluna 'media_url' adicionada.")
    except sqlite3.OperationalError:
        print("Coluna 'media_url' já existe ou erro na migração.")

    try:
        # Adiciona media_type
        cursor.execute("ALTER TABLE mensagens_capturadas ADD COLUMN media_type TEXT")
        print("Coluna 'media_type' adicionada.")
    except sqlite3.OperationalError:
        print("Coluna 'media_type' já existe ou erro na migração.")

    conn.commit()
    conn.close()
    print("Migração concluída com sucesso!")

if __name__ == "__main__":
    migrate()
