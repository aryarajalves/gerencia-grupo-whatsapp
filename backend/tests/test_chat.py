import pytest
import uuid

HEADERS = {"X-API-Key": "test-secret"}

def test_list_messages_chat(client):
    response = client.get("/captura/mensagens/", headers=HEADERS)
    assert response.status_code == 200
    assert "items" in response.json()

def test_send_message_chat_invalid_group(client):
    # Testa enviar para um grupo que não existe
    payload = {
        "group_jid": "123456789@g.us",
        "message": "Teste unitário"
    }
    response = client.post("/captura/enviar", json=payload, headers=HEADERS)
    assert response.status_code == 404

def test_revoke_message_not_found(client):
    # Testa revogar uma mensagem que não existe no banco
    random_id = str(uuid.uuid4())
    response = client.post(f"/captura/revogar/{random_id}", headers=HEADERS)
    assert response.status_code == 404

