import pytest
import uuid
import json
from unittest.mock import MagicMock, patch
from datetime import time

import models
from services.queue_consumer import _process_dispatch
from services.message_service import enviar_wapi

def test_queue_consumer_ignores_paused_group(setup_db, db_session):
    """Garante que se o grupo estiver pausado (ativo=False), o consumidor do RabbitMQ descarta a tarefa sem enviar."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Pausado Teste",
        id_do_grupo="120363999999999999@g.us",
        ativo=False, # GRUPO PAUSADO
        dia_lancamento_atual=1
    )
    msg = models.MensagemDisparada(
        id=uuid.uuid4(),
        mensagem="Mensagem Teste",
        dia_do_lancamento=1,
        horario_do_disparo=time(10, 0),
        tipo_de_mensagem="texto",
        ativo=True
    )
    assoc = models.GrupoMensagem(grupo_id=grupo.id, mensagem_id=msg.id)
    
    db_session.add(grupo)
    db_session.add(msg)
    db_session.add(assoc)
    db_session.commit()

    ch_mock = MagicMock()
    method_mock = MagicMock()
    method_mock.delivery_tag = 123
    body = json.dumps({"grupo_id": str(grupo.id), "mensagem_id": str(msg.id)}).encode("utf-8")

    fake_session_cm = MagicMock(wraps=db_session)
    fake_session_cm.close = MagicMock()

    with patch("services.queue_consumer.SessionLocal", return_value=fake_session_cm):
        with patch("services.queue_consumer.enviar_wapi") as mock_enviar:
            _process_dispatch(ch_mock, method_mock, None, body)
            mock_enviar.assert_not_called()
            ch_mock.basic_ack.assert_called_once_with(delivery_tag=123)

    db_session.query(models.GrupoMensagem).delete()
    db_session.query(models.MensagemDisparada).delete()
    db_session.query(models.GrupoWhatsApp).delete()
    db_session.commit()

def test_queue_consumer_ignores_inactive_message(setup_db, db_session):
    """Garante que se a mensagem estiver inativa (ativo=False), o consumidor descarta sem enviar."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Ativo Teste",
        id_do_grupo="120363999999999998@g.us",
        ativo=True,
        dia_lancamento_atual=1
    )
    msg = models.MensagemDisparada(
        id=uuid.uuid4(),
        mensagem="Mensagem Inativa Teste",
        dia_do_lancamento=1,
        horario_do_disparo=time(10, 0),
        tipo_de_mensagem="texto",
        ativo=False # MENSAGEM INATIVA
    )
    assoc = models.GrupoMensagem(grupo_id=grupo.id, mensagem_id=msg.id)
    
    db_session.add(grupo)
    db_session.add(msg)
    db_session.add(assoc)
    db_session.commit()

    ch_mock = MagicMock()
    method_mock = MagicMock()
    method_mock.delivery_tag = 124
    body = json.dumps({"grupo_id": str(grupo.id), "mensagem_id": str(msg.id)}).encode("utf-8")

    fake_session_cm = MagicMock(wraps=db_session)
    fake_session_cm.close = MagicMock()

    with patch("services.queue_consumer.SessionLocal", return_value=fake_session_cm):
        with patch("services.queue_consumer.enviar_wapi") as mock_enviar:
            _process_dispatch(ch_mock, method_mock, None, body)
            mock_enviar.assert_not_called()
            ch_mock.basic_ack.assert_called_once_with(delivery_tag=124)

    db_session.query(models.GrupoMensagem).delete()
    db_session.query(models.MensagemDisparada).delete()
    db_session.query(models.GrupoWhatsApp).delete()
    db_session.commit()

def test_queue_consumer_ignores_cycle_mismatch(setup_db, db_session):
    """Garante que se o dia de lançamento do grupo divergir da mensagem, descarta sem enviar."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Ciclo Teste",
        id_do_grupo="120363999999999997@g.us",
        ativo=True,
        dia_lancamento_atual=2 # Grupo está no Dia 2
    )
    msg = models.MensagemDisparada(
        id=uuid.uuid4(),
        mensagem="Mensagem Dia 1",
        dia_do_lancamento=1, # Mensagem era do Dia 1
        horario_do_disparo=time(10, 0),
        tipo_de_mensagem="texto",
        ativo=True
    )
    assoc = models.GrupoMensagem(grupo_id=grupo.id, mensagem_id=msg.id)
    
    db_session.add(grupo)
    db_session.add(msg)
    db_session.add(assoc)
    db_session.commit()

    ch_mock = MagicMock()
    method_mock = MagicMock()
    method_mock.delivery_tag = 125
    body = json.dumps({"grupo_id": str(grupo.id), "mensagem_id": str(msg.id)}).encode("utf-8")

    fake_session_cm = MagicMock(wraps=db_session)
    fake_session_cm.close = MagicMock()

    with patch("services.queue_consumer.SessionLocal", return_value=fake_session_cm):
        with patch("services.queue_consumer.enviar_wapi") as mock_enviar:
            _process_dispatch(ch_mock, method_mock, None, body)
            mock_enviar.assert_not_called()
            ch_mock.basic_ack.assert_called_once_with(delivery_tag=125)

    db_session.query(models.GrupoMensagem).delete()
    db_session.query(models.MensagemDisparada).delete()
    db_session.query(models.GrupoWhatsApp).delete()
    db_session.commit()

def test_enviar_wapi_aborts_when_group_paused(setup_db, db_session):
    """Garante que enviar_wapi não dispara para grupos inativos quando forcar_envio=False."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Pausado WAPI",
        id_do_grupo="120363999999999996@g.us",
        ativo=False
    )
    msg = models.MensagemDisparada(
        id=uuid.uuid4(),
        mensagem="Olá grupo pausado",
        tipo_de_mensagem="texto"
    )
    db_session.add(grupo)
    db_session.add(msg)
    db_session.commit()

    with patch("httpx.post") as mock_http:
        sucesso, detalhes = enviar_wapi(grupo, msg, db_session, forcar_envio=False)
        assert sucesso is False
        assert "pausado" in detalhes.lower()
        mock_http.assert_not_called()

    log = db_session.query(models.LogDisparo).filter_by(grupo_nome="Grupo Pausado WAPI").order_by(models.LogDisparo.criado_em.desc()).first()
    assert log is not None
    assert log.status == "Ignorado"

    db_session.query(models.LogDisparo).delete()
    db_session.query(models.MensagemDisparada).delete()
    db_session.query(models.GrupoWhatsApp).delete()
    db_session.commit()

def test_retry_log_blocks_when_group_paused(client, setup_db, db_session):
    """Garante que o endpoint POST /logs/{id}/retry bloqueia o reenvio se o grupo estiver pausado."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Para Retry Teste",
        id_do_grupo="120363999999999995@g.us",
        ativo=False # Grupo pausado
    )
    msg = models.MensagemDisparada(
        id=uuid.uuid4(),
        mensagem="Mensagem de teste retry",
        tipo_de_mensagem="texto"
    )
    log = models.LogDisparo(
        id=uuid.uuid4(),
        grupo_nome=grupo.nome,
        mensagem_corpo=msg.mensagem,
        status="Erro",
        detalhes_erro="Erro anterior simulado",
        mensagem_id=msg.id,
        tipo="texto"
    )
    db_session.add(grupo)
    db_session.add(msg)
    db_session.add(log)
    db_session.commit()

    resp = client.post(f"/logs/{log.id}/retry")
    assert resp.status_code == 400
    assert "pausado" in resp.json()["detail"].lower()

    db_session.query(models.LogDisparo).delete()
    db_session.query(models.MensagemDisparada).delete()
    db_session.query(models.GrupoWhatsApp).delete()
    db_session.commit()
