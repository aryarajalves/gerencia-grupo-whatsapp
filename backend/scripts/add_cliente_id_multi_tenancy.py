import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from database import DATABASE_URL, engine
import models

def migrate():
    print(f"Conectando ao banco de dados: {DATABASE_URL}")
    
    tables = [
        "grupos_whatsapp",
        "mensagens_disparadas",
        "logs_disparos",
        "mensagens_capturadas",
        "contatos_grupos",
        "conjuntos_grupos"
    ]
    
    with engine.connect() as conn:
        # 1. Garante que existe ao menos um Cliente padrão
        res = conn.execute(text("SELECT id FROM clientes WHERE ativo = true ORDER BY criado_em ASC LIMIT 1")).fetchone()
        default_client_id = None
        if res:
            default_client_id = str(res[0])
        else:
            print("Nenhum cliente padrão encontrado. O script continuará permitindo NULL para registros legados.")

        for table in tables:
            print(f"\nVerificando tabela '{table}'...")
            
            # Verifica se a coluna cliente_id já existe
            is_postgres = "postgresql" in str(DATABASE_URL)
            if is_postgres:
                check_col = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='{table}' AND column_name='cliente_id'
                """)).fetchone()
            else:
                # SQLite
                check_col = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
                check_col = any(col[1] == 'cliente_id' for col in check_col)

            if not check_col:
                print(f"Adicionando coluna 'cliente_id' na tabela '{table}'...")
                col_type = "UUID" if is_postgres else "VARCHAR(36)"
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN cliente_id {col_type}"))
                conn.commit()
                print(f"Coluna 'cliente_id' adicionada com sucesso em '{table}'.")

                if default_client_id:
                    print(f"Associando registros legados da tabela '{table}' ao cliente {default_client_id}...")
                    conn.execute(text(f"UPDATE {table} SET cliente_id = '{default_client_id}' WHERE cliente_id IS NULL"))
                    conn.commit()
            else:
                print(f"Coluna 'cliente_id' já existe na tabela '{table}'.")
                if default_client_id:
                    conn.execute(text(f"UPDATE {table} SET cliente_id = '{default_client_id}' WHERE cliente_id IS NULL"))
                    conn.commit()

        print("\nMigração de Multi-Tenancy (cliente_id) concluída com sucesso!")

if __name__ == "__main__":
    migrate()
