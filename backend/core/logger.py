import logging
import sys
from logging.handlers import RotatingFileHandler
import os
from datetime import datetime, timezone, timedelta

# Fuso horário de Brasília (UTC-3)
BR_OFFSET = timezone(timedelta(hours=-3))

class BrasiliaFormatter(logging.Formatter):
    """Formatador de log que converte automaticamente qualquer registro para o Horário de Brasília (UTC-3)."""
    def formatTime(self, record, datefmt=None):
        dt = datetime.fromtimestamp(record.created, tz=BR_OFFSET)
        if datefmt:
            return dt.strftime(datefmt)
        return dt.strftime("%Y-%m-%d %H:%M:%S")

LOG_FORMAT = "%(asctime)s [%(levelname)s] [%(name)s]: %(message)s"
LOG_DIR = "data/logs"

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

formatter = BrasiliaFormatter(LOG_FORMAT)

# Criar logger principal da aplicação
logger = logging.getLogger("zapgroup")
logger.setLevel(logging.INFO)
logger.handlers.clear()

# Handler para console (Docker logs)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Handler para arquivo (Persistência)
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, "app.log"),
    maxBytes=10*1024*1024, # 10MB
    backupCount=5
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

def setup_uvicorn_logging():
    """Configura o formatador em Horário de Brasília para as requisições HTTP do Uvicorn."""
    uv_formatter = BrasiliaFormatter("%(asctime)s [%(levelname)s] [HTTP REQUISICAO]: %(message)s")
    
    for uvicorn_logger_name in ["uvicorn", "uvicorn.access", "uvicorn.error"]:
        uv_logger = logging.getLogger(uvicorn_logger_name)
        for handler in uv_logger.handlers:
            handler.setFormatter(uv_formatter)

def get_logger(name):
    return logging.getLogger(f"zapgroup.{name}")
