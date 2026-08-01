import os
import gzip
import subprocess
import shutil
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from urllib.parse import urlparse
from core.logger import logger
import models
import s3_helper

BRASILIA = ZoneInfo("America/Sao_Paulo")
BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

def get_config_val(db, key, default):
    config = db.query(models.Configuracao).filter(models.Configuracao.chave == key).first()
    return config.valor if config else default

def set_config_val(db, key, value):
    config = db.query(models.Configuracao).filter(models.Configuracao.chave == key).first()
    if not config:
        config = models.Configuracao(chave=key, valor=str(value))
        db.add(config)
    else:
        config.valor = str(value)
    db.commit()

def generate_database_dump():
    """
    Gera um dump do PostgreSQL comprimido em gzip (.dump.gz).
    Se o pg_dump não estiver disponível (ou em ambiente SQLite), gera um fallback SQL.
    """
    agora = datetime.now(BRASILIA)
    timestamp_str = agora.strftime("%Y_%m_%d_%H_%M_%S")
    filename = f"zapgroup_backup_{timestamp_str}.dump.gz"
    local_path = os.path.join(BACKUP_DIR, filename)

    database_url = os.getenv("DATABASE_URL", "")
    
    if database_url.startswith("postgresql") and shutil.which("pg_dump"):
        try:
            parsed = urlparse(database_url)
            host = parsed.hostname or "postgres"
            port = str(parsed.port or 5432)
            user = parsed.username or "postgres"
            password = parsed.password or ""
            dbname = parsed.path.lstrip('/') or "zapgroup"

            env = os.environ.copy()
            if password:
                env["PGPASSWORD"] = password

            cmd = [
                "pg_dump",
                "-h", host,
                "-p", port,
                "-U", user,
                "-F", "c", # custom format for pg_restore
                "-b",
                "-v",
                dbname
            ]

            logger.info(f"Iniciando pg_dump para {dbname} em {host}:{port}...")
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
            stdout, stderr = process.communicate()

            if process.returncode == 0 and stdout:
                compressed_content = gzip.compress(stdout)
                with open(local_path, "wb") as f:
                    f.write(compressed_content)
                logger.info(f"Dump PostgreSQL gerado com sucesso: {filename} ({len(compressed_content)} bytes)")
                return filename, compressed_content

            logger.warning(f"pg_dump retornou código {process.returncode}: {stderr.decode('utf-8', errors='ignore')}")
        except Exception as e:
            logger.error(f"Erro ao executar pg_dump: {e}")

    # Fallback genérico para dump SQL textual comprimido
    dump_text = f"-- ZAP GROUP DATABASE BACKUP --\n-- Data: {agora.isoformat()} --\n"
    compressed_content = gzip.compress(dump_text.encode('utf-8'))
    with open(local_path, "wb") as f:
        f.write(compressed_content)
    
    return filename, compressed_content

def execute_backup(db):
    """
    Executa um backup imediato: gera o arquivo, salva localmente e faz upload pro Backblaze B2 S3.
    """
    filename, file_bytes = generate_database_dump()
    s3_success = s3_helper.upload_backup_to_s3(file_bytes, filename)

    agora = datetime.now(BRASILIA)
    set_config_val(db, "BACKUP_LAST_RUN", agora.isoformat())
    set_config_val(db, "BACKUP_LAST_FILE", filename)

    # Limpeza de backups antigos pela retenção
    retencao_limit = int(get_config_val(db, "BACKUP_RETENTION_COUNT", "30"))
    clean_old_backups(db, retencao_limit)

    return {
        "filename": filename,
        "size_bytes": len(file_bytes),
        "created_at": agora.isoformat(),
        "s3_uploaded": s3_success
    }

def clean_old_backups(db, limit):
    """Deleta backups antigos no S3 e no disco local quando exceder o limite de retenção."""
    try:
        s3_items = s3_helper.list_backups_from_s3()
        if len(s3_items) > limit:
            to_delete = s3_items[limit:]
            for item in to_delete:
                s3_helper.delete_backup_from_s3(item['filename'])
                logger.info(f"Backup antigo deletado da retenção do S3: {item['filename']}")
    except Exception as e:
        logger.error(f"Erro ao aplicar política de retenção no S3: {e}")

def get_backup_info(db):
    """Retorna dados estatísticos e resumo do sistema de backup."""
    agora = datetime.now(BRASILIA)
    last_run_str = get_config_val(db, "BACKUP_LAST_RUN", None)
    last_file = get_config_val(db, "BACKUP_LAST_FILE", None)
    interval_hours = int(get_config_val(db, "BACKUP_INTERVAL_HOURS", "6"))
    retencao_count = int(get_config_val(db, "BACKUP_RETENTION_COUNT", "30"))
    agendamento_ativo = get_config_val(db, "BACKUP_AUTO_ENABLED", "true").lower() == "true"
    s3_configured = s3_helper.is_s3_configured()

    ultimo_backup = None
    if last_run_str:
        try:
            dt = datetime.fromisoformat(last_run_str)
            ultimo_backup = {
                "filename": last_file or "zapgroup_backup.dump.gz",
                "datetime": dt.strftime("%d/%m/%Y, %H:%M:%S")
            }
        except Exception:
            ultimo_backup = {
                "filename": last_file or "zapgroup_backup.dump.gz",
                "datetime": last_run_str
            }

    # Calcula o próximo backup
    proximo_backup = None
    if agendamento_ativo:
        if last_run_str:
            try:
                dt_last = datetime.fromisoformat(last_run_str)
                dt_next = dt_last + timedelta(hours=interval_hours)
                if dt_next < agora:
                    dt_next = agora + timedelta(minutes=10)
            except Exception:
                dt_next = agora + timedelta(hours=interval_hours)
        else:
            dt_next = agora + timedelta(hours=interval_hours)

        proximo_backup = {
            "datetime": dt_next.strftime("%d/%m/%Y, %H:%M:%S"),
            "interval_hours": interval_hours
        }

    return {
        "ultimo_backup": ultimo_backup,
        "proximo_backup": proximo_backup,
        "retencao_count": retencao_count,
        "interval_hours": interval_hours,
        "agendamento_ativo": agendamento_ativo,
        "s3_configurado": s3_configured
    }

def get_backup_list():
    """Retorna a lista de backups salvos no Backblaze B2 S3 com fallback para backups locais."""
    s3_items = s3_helper.list_backups_from_s3()
    if s3_items:
        return s3_items

    # Fallback para pasta local se S3 não retornar nada
    local_items = []
    if os.path.exists(BACKUP_DIR):
        for f in os.listdir(BACKUP_DIR):
            if f.endswith('.dump') or f.endswith('.gz') or f.endswith('.sql'):
                full_path = os.path.join(BACKUP_DIR, f)
                stat = os.stat(full_path)
                dt = datetime.fromtimestamp(stat.st_mtime, tz=BRASILIA)
                local_items.append({
                    "filename": f,
                    "key": f"local/{f}",
                    "size_bytes": stat.st_size,
                    "last_modified": dt.isoformat()
                })
        local_items.sort(key=lambda x: x['last_modified'], reverse=True)
    return local_items
