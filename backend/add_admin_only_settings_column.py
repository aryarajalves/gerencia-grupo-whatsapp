from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE mensagens_disparadas ADD COLUMN admin_only_settings BOOLEAN;"))
            conn.commit()
            print("Coluna admin_only_settings adicionada com sucesso em mensagens_disparadas.")
        except Exception as e:
            print(f"Nota/Erro na migração: {e}")

if __name__ == "__main__":
    migrate()
