import time
import signal
import sys
import os
from datetime import datetime

import scheduler
from core.logger import logger
import database
import migrations

def main():
    logger.info("==================================================")
    logger.info("Starting Dedicated Worker Container (Task Scheduler)")
    logger.info(f"Start Time: {datetime.now().isoformat()}")
    logger.info("==================================================")

    # 1. Garante que o esquema do banco de dados está sincronizado
    try:
        migrations.sync_database()
        logger.info("Esquema de banco de dados sincronizado pelo Worker.")
    except Exception as e:
        logger.error(f"Erro ao sincronizar banco no Worker: {e}")

    # 2. Inicia o agendador de tarefas em segundo plano
    sched = scheduler.iniciar_agendador()
    logger.info("Agendador de disparos e rotinas Periódicas rodando no Worker.")

    def handle_exit(sig, frame):
        logger.info("Recebido sinal de desligamento. Encerrando o Worker...")
        try:
            sched.shutdown(wait=False)
        except Exception as ex:
            logger.error(f"Erro ao desligar agendador: {ex}")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    print("Worker iniciado com sucesso e aguardando execuções de tarefas.")
    
    # Loop de escuta ativo para manter o container rodando
    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()
