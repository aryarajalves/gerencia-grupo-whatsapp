import os
import time
import psycopg2
from sqlalchemy import inspect, text
from database import engine, Base
import models
from core.logger import logger


def _parse_db_url(database_url: str):
    """Extrai as partes da DATABASE_URL para conectar sem especificar o banco."""
    url = database_url.replace("postgresql://", "").replace("postgres://", "")
    user_pass, rest = url.split("@")
    user, password = user_pass.split(":", 1)
    host_port_db = rest.split("/")
    host_port = host_port_db[0]
    dbname = host_port_db[1] if len(host_port_db) > 1 else "postgres"

    if ":" in host_port:
        host, port = host_port.split(":")
        port = int(port)
    else:
        host = host_port
        port = 5432

    return user, password, host, port, dbname


def _wait_for_postgres(user, password, host, port, max_retries=15, delay=2):
    """Aguarda o PostgreSQL estar pronto para aceitar conexões."""
    logger.info(f"[BANCO DE DADOS] Aguardando PostgreSQL em {host}:{port}...")
    for attempt in range(1, max_retries + 1):
        try:
            conn = psycopg2.connect(
                dbname="postgres",
                user=user,
                password=password,
                host=host,
                port=port,
                connect_timeout=3
            )
            conn.close()
            logger.info(f"[BANCO DE DADOS] PostgreSQL disponível (tentativa {attempt}/{max_retries}).")
            return True
        except psycopg2.OperationalError:
            logger.info(f"[BANCO DE DADOS] PostgreSQL ainda não disponível. Aguardando {delay}s... ({attempt}/{max_retries})")
            time.sleep(delay)

    raise RuntimeError(
        f"ERRO: PostgreSQL em {host}:{port} não respondeu após {max_retries} tentativas. "
        "Verifique se o serviço está rodando e acessível."
    )


def _ensure_database_exists(user, password, host, port, dbname):
    """Cria o banco de dados se ele não existir."""
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=password,
            host=host,
            port=port
        )
        conn.autocommit = True
        cursor = conn.cursor()

        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
        exists = cursor.fetchone()

        if not exists:
            logger.info(f"[BANCO DE DADOS] Banco de dados '{dbname}' não encontrado. Criando...")
            cursor.execute(f'CREATE DATABASE "{dbname}"')
            logger.info(f"[BANCO DE DADOS] Banco de dados '{dbname}' criado com sucesso!")
        else:
            logger.info(f"[BANCO DE DADOS] Banco de dados '{dbname}' já existe.")

        cursor.close()
        conn.close()
    except Exception as e:
        raise RuntimeError(f"ERRO ao criar banco de dados '{dbname}': {e}")


def sync_database():
    """
    1. Aguarda o PostgreSQL estar pronto.
    2. Cria o banco de dados se não existir.
    3. Cria as tabelas que não existem.
    4. Aplica migrações de colunas faltantes.
    """
    logger.info("[BANCO DE DADOS] Iniciando Sincronização de Banco de Dados...")

    database_url = os.getenv("DATABASE_URL", "")
    if not database_url:
        raise RuntimeError("ERRO: Variável de ambiente DATABASE_URL não definida.")

    user, password, host, port, dbname = _parse_db_url(database_url)

    _wait_for_postgres(user, password, host, port)
    _ensure_database_exists(user, password, host, port, dbname)

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)

    with engine.connect() as conn:
        columns = [c['name'] for c in inspector.get_columns('mensagens_disparadas')]
        if 'ativo' not in columns:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'ativo' em 'mensagens_disparadas'...")
            conn.execute(text("ALTER TABLE mensagens_disparadas ADD COLUMN ativo BOOLEAN DEFAULT TRUE;"))
            conn.commit()

        if 'opcoes_enquete' not in columns:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'opcoes_enquete' em 'mensagens_disparadas'...")
            conn.execute(text("ALTER TABLE mensagens_disparadas ADD COLUMN opcoes_enquete TEXT;"))
            conn.commit()

        columns_grupos = [c['name'] for c in inspector.get_columns('grupos_whatsapp')]
        if 'ativo' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'ativo' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN ativo BOOLEAN DEFAULT TRUE;"))
            conn.commit()
        
        if 'dia_inicio_semana' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'dia_inicio_semana' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN dia_inicio_semana INTEGER DEFAULT 0;"))
            conn.commit()

        if 'dia_fim_semana' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'dia_fim_semana' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN dia_fim_semana INTEGER DEFAULT 4;"))
            conn.commit()

        if 'dia_lancamento_atual' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'dia_lancamento_atual' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN dia_lancamento_atual INTEGER DEFAULT 0;"))
            conn.commit()

        if 'link_convite' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'link_convite' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN link_convite TEXT;"))
            conn.commit()

        if 'quantidade_contatos' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'quantidade_contatos' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN quantidade_contatos INTEGER DEFAULT 0;"))
            conn.commit()

        if 'extrair_contatos' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'extrair_contatos' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN extrair_contatos BOOLEAN DEFAULT TRUE;"))
            conn.commit()

        if 'intervalo_extracao_minutos' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'intervalo_extracao_minutos' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN intervalo_extracao_minutos INTEGER DEFAULT 30;"))
            conn.commit()

        if 'ultima_extracao_em' not in columns_grupos:
            logger.info("[BANCO DE DADOS] Adicionando coluna 'ultima_extracao_em' em 'grupos_whatsapp'...")
            conn.execute(text("ALTER TABLE grupos_whatsapp ADD COLUMN ultima_extracao_em TIMESTAMP;"))
            conn.commit()

        if inspector.has_table('usuarios'):
            columns_users = [c['name'] for c in inspector.get_columns('usuarios')]
            if 'senha_hash' not in columns_users:
                logger.info("[BANCO DE DADOS] Adicionando coluna 'senha_hash' em 'usuarios'...")
                conn.execute(text("ALTER TABLE usuarios ADD COLUMN senha_hash TEXT;"))
                conn.commit()

        if inspector.has_table('logs_disparos'):
            columns_logs = [c['name'] for c in inspector.get_columns('logs_disparos')]
            if 'mensagem_id' not in columns_logs:
                logger.info("[BANCO DE DADOS] Adicionando coluna 'mensagem_id' em 'logs_disparos'...")
                conn.execute(text("ALTER TABLE logs_disparos ADD COLUMN mensagem_id UUID;"))
                conn.commit()
            
            if 'tipo' not in columns_logs:
                logger.info("[BANCO DE DADOS] Adicionando coluna 'tipo' em 'logs_disparos'...")
                conn.execute(text("ALTER TABLE logs_disparos ADD COLUMN tipo TEXT;"))
                conn.commit()

        if inspector.has_table('mensagens_capturadas'):
            columns_capturas = [c['name'] for c in inspector.get_columns('mensagens_capturadas')]
            
            if 'conteudo' in columns_capturas and 'message_content' not in columns_capturas:
                logger.info("[BANCO DE DADOS] Renomeando 'conteudo' para 'message_content' em 'mensagens_capturadas'...")
                conn.execute(text("ALTER TABLE mensagens_capturadas RENAME COLUMN conteudo TO message_content;"))
                conn.commit()
                
            if 'grupo_jid' in columns_capturas and 'group_jid' not in columns_capturas:
                logger.info("[BANCO DE DADOS] Renomeando 'grupo_jid' para 'group_jid' em 'mensagens_capturadas'...")
                conn.execute(text("ALTER TABLE mensagens_capturadas RENAME COLUMN grupo_jid TO group_jid;"))
                conn.commit()

            if 'grupo_nome' in columns_capturas and 'group_name' not in columns_capturas:
                logger.info("[BANCO DE DADOS] Renomeando 'grupo_nome' para 'group_name' em 'mensagens_capturadas'...")
                conn.execute(text("ALTER TABLE mensagens_capturadas RENAME COLUMN grupo_nome TO group_name;"))
                conn.commit()

            if 'criado_em' in columns_capturas and 'timestamp' not in columns_capturas:
                logger.info("[BANCO DE DADOS] Renomeando 'criado_em' para 'timestamp' em 'mensagens_capturadas'...")
                conn.execute(text("ALTER TABLE mensagens_capturadas RENAME COLUMN criado_em TO timestamp;"))
                conn.commit()

            columns_capturas_pos = [c['name'] for c in inspector.get_columns('mensagens_capturadas')]
            if 'group_name' not in columns_capturas_pos:
                logger.info("[BANCO DE DADOS] Adicionando coluna 'group_name' em 'mensagens_capturadas'...")
                conn.execute(text("ALTER TABLE mensagens_capturadas ADD COLUMN group_name TEXT;"))
                conn.commit()

        tables_multi_tenancy = ["grupos_whatsapp", "mensagens_disparadas", "logs_disparos", "mensagens_capturadas", "contatos_grupos", "conjuntos_grupos"]
        for table_name in tables_multi_tenancy:
            if inspector.has_table(table_name):
                cols = inspector.get_columns(table_name)
                client_col = next((c for c in cols if c['name'] == 'cliente_id'), None)
                if not client_col:
                    logger.info(f"[BANCO DE DADOS] Adicionando coluna 'cliente_id' em '{table_name}'...")
                    col_type = "UUID" if "postgresql" in database_url else "VARCHAR(36)"
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN cliente_id {col_type};"))
                    conn.commit()
                elif "postgresql" in database_url and "UUID" not in str(client_col.get('type', '')).upper():
                    logger.info(f"[BANCO DE DADOS] Convertendo 'cliente_id' em '{table_name}' para o tipo UUID...")
                    conn.execute(text(f"ALTER TABLE {table_name} ALTER COLUMN cliente_id TYPE UUID USING cliente_id::uuid;"))
                    conn.commit()

    logger.info("[BANCO DE DADOS] Sincronização Concluída com Sucesso.")
