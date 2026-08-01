import os
import time
import json
import pika
from core.logger import logger
import models
from database import SessionLocal
from services.message_service import enviar_wapi
from services.sync_service import extrair_e_salvar_contatos
from services.queue_service import RABBITMQ_URL, QUEUE_DISPAROS, QUEUE_EXTRACAO

# Delay configurável entre cada tarefa processada (padrão: 2 segundos)
DELAY_ENTRE_TAREFAS_SEGUNDOS = int(os.getenv("RABBITMQ_DELAY_SECONDS", "2"))


def _process_dispatch(ch, method, properties, body):
    db = SessionLocal()
    try:
        data = json.loads(body.decode('utf-8'))
        grupo_id = data.get("grupo_id")
        msg_id = data.get("mensagem_id")
        logger.info(f"[CONSUMER DISPAROS] Executando disparo -> Grupo {grupo_id} | Msg {msg_id}")

        grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id).first()
        msg = db.query(models.MensagemDisparada).filter(models.MensagemDisparada.id == msg_id).first()

        if grupo and msg:
            enviar_wapi(grupo, msg, db)
        else:
            logger.warning(f"[CONSUMER DISPAROS] Grupo ou Mensagem não encontrados: {grupo_id} | {msg_id}")

        time.sleep(DELAY_ENTRE_TAREFAS_SEGUNDOS)
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"[CONSUMER DISPAROS] Disparo concluído com sucesso.")
    except Exception as e:
        logger.error(f"[CONSUMER DISPAROS] Erro ao processar disparo: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    finally:
        db.close()

def _process_extraction(ch, method, properties, body):
    db = SessionLocal()
    try:
        data = json.loads(body.decode('utf-8'))
        grupo_id = data.get("grupo_id")
        logger.info(f"[CONSUMER EXTRAÇÃO] Processando extração -> Grupo {grupo_id}")

        grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id).first()
        if grupo:
            extrair_e_salvar_contatos(db, grupo)
        else:
            logger.warning(f"[CONSUMER EXTRAÇÃO] Grupo não encontrado para extração: {grupo_id}")

        time.sleep(DELAY_ENTRE_TAREFAS_SEGUNDOS)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"[CONSUMER EXTRAÇÃO] Erro ao processar extração: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    finally:
        db.close()

def start_dispatch_consumer():
    logger.info("[CONSUMER DISPAROS] Iniciando consumidor dedicado para disparos de mensagens...")
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            params.socket_timeout = 10
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.queue_declare(queue=QUEUE_DISPAROS, durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_DISPAROS, on_message_callback=_process_dispatch)

            logger.info("[CONSUMER DISPAROS] Ouvindo fila 'whatsapp_disparos' em tempo real...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            time.sleep(5)
        except Exception as e:
            logger.error(f"[CONSUMER DISPAROS] Erro no consumidor de disparos: {e}")
            time.sleep(5)

def start_extraction_consumer():
    logger.info("[CONSUMER EXTRAÇÃO] Iniciando consumidor dedicado para extração de contatos em segundo plano...")
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            params.socket_timeout = 10
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.queue_declare(queue=QUEUE_EXTRACAO, durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_EXTRACAO, on_message_callback=_process_extraction)

            logger.info("[CONSUMER EXTRAÇÃO] Ouvindo fila 'whatsapp_extracao'...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            time.sleep(5)
        except Exception as e:
            logger.error(f"[CONSUMER EXTRAÇÃO] Erro no consumidor de extrações: {e}")
            time.sleep(5)

def start_consumer_loop():
    import threading
    t1 = threading.Thread(target=start_dispatch_consumer, daemon=True)
    t2 = threading.Thread(target=start_extraction_consumer, daemon=True)
    t1.start()
    t2.start()
    logger.info("[CONSUMER FILA] Consumidores dedicados (Disparos + Extrações) iniciados com sucesso.")

