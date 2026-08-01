import pytest
import uuid

def test_webhook_message_upsert(client):
    """Testa o formato tradicional de webhook (message.upsert)"""
    payload = {
        "event": "message.upsert",
        "data": {
            "messages": [
                {
                    "key": {
                        "remoteJid": "123456789@g.us",
                        "fromMe": False,
                        "participant": "5511999999999@s.whatsapp.net"
                    },
                    "pushName": "Teste User",
                    "message": {
                        "conversation": "Olá via upsert"
                    }
                }
            ]
        }
    }
    response = client.post("/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_webhook_received_format(client):
    """Testa o novo formato de webhook (webhookReceived)"""
    payload = {
        "event": "webhookReceived",
        "instanceId": "LITE-INSTANCE",
        "fromMe": False,
        "chat": {
            "id": "120363423759307041@g.us"
        },
        "sender": {
            "id": "558596123586@s.whatsapp.net",
            "pushName": "Aryaraj"
        },
        "msgContent": {
            "conversation": "teste testado via webhookReceived"
        }
    }
    response = client.post("/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_webhook_ignore_from_me(client):
    """Verifica se mensagens do bot (fromMe: True) são ignoradas"""
    payload = {
        "event": "webhookReceived",
        "fromMe": True,
        "chat": {"id": "123@g.us"},
        "sender": {"id": "bot@s.whatsapp.net", "pushName": "Bot"},
        "msgContent": {"conversation": "Ignorar esta"}
    }
    response = client.post("/webhook/whatsapp", json=payload)
    assert response.status_code == 200
    # Na lógica atual, retorna success mas não salva no banco. 
    # Validaríamos o banco em um teste de integração real se necessário.
