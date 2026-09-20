"""
Script de migração para criar a tabela email_verifications no banco de dados.
"""
import os
import sys
from sqlalchemy import text

# Adiciona o diretório pai ao sys.path para importar módulos do backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
import models
from core.logger import logger


def run_migration():
    logger.info("Iniciando migração: Criação da tabela email_verifications...")
    Base.metadata.create_all(bind=engine)
    logger.info("Migração concluída com sucesso: Tabela email_verifications verificada/criada.")


if __name__ == "__main__":
    run_migration()
