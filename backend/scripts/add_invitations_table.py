import sqlite3
import os

def migrate():
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(__file__), "..", "zapgroup.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Iniciando migração para Tabela de Convites...")

    try:
        # Criar tabela invitations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS invitations (
            id CHAR(36) PRIMARY KEY,
            token VARCHAR(255) UNIQUE NOT NULL,
            cargo VARCHAR(50) NOT NULL,
            tipo VARCHAR(50) DEFAULT 'convite',
            usuario_id CHAR(36),
            usado BOOLEAN DEFAULT 0,
            expira_em TIMESTAMP,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
        """)
        print("Tabela 'invitations' verificada/criada.")

        conn.commit()
        print("Migração concluída com sucesso!")
    except Exception as e:
        print(f"Erro na migração: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
