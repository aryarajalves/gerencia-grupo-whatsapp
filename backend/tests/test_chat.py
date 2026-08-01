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

def test_send_message_chat_single_record(client, db_session, monkeypatch):
    from unittest.mock import MagicMock
    import models
    from client_context import get_active_client_id

    cid = get_active_client_id(db_session)

    cfg1 = models.Configuracao(chave="WAPI_INSTANCE_ID", valor="instance_test_123")
    cfg2 = models.Configuracao(chave="WAPI_TOKEN", valor="token_test_123")
    db_session.add_all([cfg1, cfg2])
    db_session.commit()

    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Teste Chat",
        id_do_grupo="120363405673797899@g.us",
        cliente_id=cid,
        ativo=True
    )
    db_session.add(grupo)
    db_session.commit()

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": "WAPI_MSG_CHAT_SINGLE_123"}

    import httpx
    monkeypatch.setattr(httpx, "post", lambda *args, **kwargs: mock_resp)

    payload = {
        "group_jid": "120363405673797899@g.us",
        "message": "Teste Sem Duplicata"
    }

    response = client.post("/captura/enviar", json=payload, headers=HEADERS)
    assert response.status_code == 200

    capturas = db_session.query(models.MensagemCapturada).filter(
        models.MensagemCapturada.group_jid == "120363405673797899@g.us",
        models.MensagemCapturada.message_content == "Teste Sem Duplicata"
    ).all()

    # Valida que foi criada EXATAMENTE 1 mensagem e não duplicada (2)
    assert len(capturas) == 1
    assert capturas[0].sender_name == "Você"
    assert capturas[0].sender_number == "Bot"
    assert capturas[0].from_me is True


