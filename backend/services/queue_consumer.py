import time
import json
import pika
from core.logger import logger
import models
from database import SessionLocal
from services.message_service import enviar_wapi
from services.sync_service import extrair_e_salvar_contatos
from services.queue_service import RABBITMQ_URL, QUEUE_DISPAROS, QUEUE_EXTRACAO

DELAY_ENTRE_TAREFAS_SEGUNDOS = 2

def _process_message(ch, method, properties, body):
    db = SessionLocal()
    try:
        data = json.loads(body.decode('utf-8'))
        task_type = data.get("type")

        if task_type == "dispatch":
            grupo_id = data.get("grupo_id")
            msg_id = data.get("mensagem_id")
            logger.info(f"[CONSUMER FILA] Processando disparo 1 por vez -> Grupo {grupo_id} | Msg {msg_id}")

            grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id).first()
            msg = db.query(models.MensagemDisparada).filter(models.MensagemDisparada.id == msg_id).first()

            if grupo and msg:
                enviar_wapi(grupo, msg, db)
            else:
                logger.warning(f"[CONSUMER FILA] Grupo ou Mensagem não encontrados para disparo: {grupo_id} | {msg_id}")

        elif task_type == "extraction":
            grupo_id = data.get("grupo_id")
            logger.info(f"[CONSUMER FILA] Processando extração 1 por vez -> Grupo {grupo_id}")

            grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id).first()
            if grupo:
                extrair_e_salvar_contatos(db, grupo)
            else:
                logger.warning(f"[CONSUMER FILA] Grupo não encontrado para extração: {grupo_id}")

        # Pausa intencional para cadenciar e evitar sobrecarga na W-API
        time.sleep(DELAY_ENTRE_TAREFAS_SEGUNDOS)

        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"[CONSUMER FILA] Tarefa concluída e confirmada (ACK) com sucesso.")
    except Exception as e:
        logger.error(f"[CONSUMER FILA] Erro ao processar mensagem da fila: {e}")
        # Confirma para evitar loop infinito em mensagem com payload inválido
        ch.basic_ack(delivery_tag=method.delivery_tag)
    finally:
        db.close()

def start_consumer_loop():
    logger.info("[CONSUMER FILA] Iniciando consumidor RabbitMQ com suporte a 1 mensagem por vez (prefetch_count=1)...")
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            params.socket_timeout = 10
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.queue_declare(queue=QUEUE_DISPAROS, durable=True)
            channel.queue_declare(queue=QUEUE_EXTRACAO, durable=True)

            # GARANTIA 1 POR VEZ: prefetch_count = 1
            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(queue=QUEUE_DISPAROS, on_message_callback=_process_message)
            channel.basic_consume(queue=QUEUE_EXTRACAO, on_message_callback=_process_message)

            logger.info("[CONSUMER FILA] Ouvindo filas 'whatsapp_disparos' e 'whatsapp_extracao'...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            logger.warning("[CONSUMER FILA] RabbitMQ desconectado. Tentando reconectar em 5 segundos...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"[CONSUMER FILA] Erro no consumidor RabbitMQ: {e}")
            time.sleep(5)
