import sqlite3
import os

def migrate():
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(__file__), "..", "zapgroup.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Iniciando migração para Conjuntos de Grupos...")

    try:
        # Criar tabela conjuntos_grupos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS conjuntos_grupos (
            id CHAR(36) PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            ativo BOOLEAN DEFAULT 1,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Tabela 'conjuntos_grupos' verificada/criada.")

        # Criar tabela grupo_conjunto_associacoes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS grupo_conjunto_associacoes (
            id CHAR(36) PRIMARY KEY,
            conjunto_id CHAR(36) NOT NULL,
            grupo_id CHAR(36) NOT NULL,
            posicao INTEGER NOT NULL,
            max_leads INTEGER DEFAULT 900,
            FOREIGN KEY (conjunto_id) REFERENCES conjuntos_grupos(id) ON DELETE CASCADE,
            FOREIGN KEY (grupo_id) REFERENCES grupos_whatsapp(id) ON DELETE CASCADE
        )
        """)
        print("Tabela 'grupo_conjunto_associacoes' verificada/criada.")

        conn.commit()
        print("Migração concluída com sucesso!")
    except Exception as e:
        print(f"Erro na migração: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
