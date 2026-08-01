import pytest
import models
from datetime import datetime

def test_capture_origin_filter(client, db_session):
    """
    Testa a filtragem por origem no endpoint GET /captura/mensagens/?origem=...
    """
    db_session.query(models.MensagemCapturada).delete()
    db_session.commit()

    from client_context import get_active_client_id
    cid = get_active_client_id(db_session)

    m_sistema = models.MensagemCapturada(
        cliente_id=cid,
        from_me=True,
        sender_name="Disparo Automático",
        sender_number="Sistema",
        message_content="Mensagem de Campanha 1",
        group_jid="grupo1@g.us",
        group_name="Grupo Teste 1"
    )

    m_usuario = models.MensagemCapturada(
        cliente_id=cid,
        from_me=False,
        sender_name="Lead Silva",
        sender_number="5511999998888",
        message_content="Olá, tudo bem?",
        group_jid="grupo1@g.us",
        group_name="Grupo Teste 1"
    )

    m_chat = models.MensagemCapturada(
        cliente_id=cid,
        from_me=True,
        sender_name="Você",
        sender_number="Bot",
        message_content="Resposta do operador via Chat",
        group_jid="grupo1@g.us",
        group_name="Grupo Teste 1"
    )

    db_session.add_all([m_sistema, m_usuario, m_chat])
    db_session.commit()

    # 1. Filtro 'sistema'
    resp_sistema = client.get("/captura/mensagens/?origem=sistema")
    assert resp_sistema.status_code == 200
    data_sistema = resp_sistema.json()
    assert data_sistema["total"] == 1
    assert data_sistema["items"][0]["sender_name"] == "Disparo Automático"

    # 2. Filtro 'usuario'
    resp_usuario = client.get("/captura/mensagens/?origem=usuario")
    assert resp_usuario.status_code == 200
    data_usuario = resp_usuario.json()
    assert data_usuario["total"] == 1
    assert data_usuario["items"][0]["sender_name"] == "Lead Silva"

    # 3. Filtro 'chat'
    resp_chat = client.get("/captura/mensagens/?origem=chat")
    assert resp_chat.status_code == 200
    data_chat = resp_chat.json()
    assert data_chat["total"] == 1
    assert data_chat["items"][0]["sender_name"] == "Você"
