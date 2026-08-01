import os
import json
import pika
from core.logger import logger

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin@rabbitmq:5672/")
RABBITMQ_ENABLED = os.getenv("RABBITMQ_ENABLED", "true").lower() == "true"

QUEUE_DISPAROS = "whatsapp_disparos"
QUEUE_EXTRACAO = "whatsapp_extracao"

def _get_connection():
    try:
        params = pika.URLParameters(RABBITMQ_URL)
        params.socket_timeout = 5
        connection = pika.BlockingConnection(params)
        return connection
    except Exception as e:
        logger.warning(f"[RABBITMQ] Falha ao conectar em {RABBITMQ_URL}: {e}")
        return None

def is_queue_available() -> bool:
    if not RABBITMQ_ENABLED:
        return False
    conn = _get_connection()
    if conn:
        try:
            conn.close()
            return True
        except Exception:
            pass
    return False

def setup_queues():
    conn = _get_connection()
    if not conn:
        logger.warning("[RABBITMQ] Não foi possível conectar para inicializar filas.")
        return False
    try:
        channel = conn.channel()
        channel.queue_declare(queue=QUEUE_DISPAROS, durable=True)
        channel.queue_declare(queue=QUEUE_EXTRACAO, durable=True)
        conn.close()
        logger.info("[RABBITMQ] Filas 'whatsapp_disparos' e 'whatsapp_extracao' declaradas com sucesso.")
        return True
    except Exception as e:
        logger.error(f"[RABBITMQ] Erro ao declarar filas: {e}")
        if conn and not conn.is_closed:
            conn.close()
        return False

def publish_dispatch_task(grupo_id: str, mensagem_id: str, payload_extra: dict = None) -> bool:
    """Enfileira uma tarefa de disparo de mensagem para ser enviada 1 por vez."""
    if not RABBITMQ_ENABLED:
        return False

    conn = _get_connection()
    if not conn:
        return False

    try:
        channel = conn.channel()
        channel.queue_declare(queue=QUEUE_DISPAROS, durable=True)

        body_data = {
            "type": "dispatch",
            "grupo_id": str(grupo_id),
            "mensagem_id": str(mensagem_id),
            "extra": payload_extra or {}
        }

        channel.basic_publish(
            exchange="",
            routing_key=QUEUE_DISPAROS,
            body=json.dumps(body_data),
            properties=pika.BasicProperties(
                delivery_mode=2  # torna a mensagem persistente
            )
        )
        conn.close()
        logger.info(f"[RABBITMQ] Tarefa de disparo enfileirada: Grupo {grupo_id} | Msg {mensagem_id}")
        return True
    except Exception as e:
        logger.error(f"[RABBITMQ] Erro ao publicar disparo na fila: {e}")
        if conn and not conn.is_closed:
            conn.close()
        return False

def publish_extraction_task(grupo_id: str) -> bool:
    """Enfileira uma tarefa de extração de contatos para ser executada 1 por vez."""
    if not RABBITMQ_ENABLED:
        return False

    conn = _get_connection()
    if not conn:
        return False

    try:
        channel = conn.channel()
        channel.queue_declare(queue=QUEUE_EXTRACAO, durable=True)

        body_data = {
            "type": "extraction",
            "grupo_id": str(grupo_id)
        }

        channel.basic_publish(
            exchange="",
            routing_key=QUEUE_EXTRACAO,
            body=json.dumps(body_data),
            properties=pika.BasicProperties(
                delivery_mode=2
            )
        )
        conn.close()
        logger.info(f"[RABBITMQ] Tarefa de extração enfileirada: Grupo {grupo_id}")
        return True
    except Exception as e:
        logger.error(f"[RABBITMQ] Erro ao publicar extração na fila: {e}")
        if conn and not conn.is_closed:
            conn.close()
        return False
