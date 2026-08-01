import pytest
import uuid
from unittest.mock import patch, MagicMock
import models
from services.message_service import enviar_wapi

def test_enviar_wapi_saves_to_mensagem_capturada(db_session):
    # Mock do get_wapi_instance e httpx.post
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Teste Disparo",
        id_do_grupo="120363405673797894@g.us",
        ativo=True,
        dia_lancamento_atual=1
    )
    db_session.add(grupo)

    conf_inst = models.Configuracao(chave="WAPI_INSTANCE_ID", valor="test_instance")
    conf_tok = models.Configuracao(chave="WAPI_TOKEN", valor="test_token")
    db_session.add_all([conf_inst, conf_tok])
    db_session.commit()

    msg = models.MensagemDisparada(
        id=uuid.uuid4(),
        mensagem="Finalmente é hoje, às 20h! 🔥",
        tipo_de_mensagem="texto",
        dia_do_lancamento=1
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": "WAPI_MSG_123456"}

    with patch("httpx.post", return_value=mock_resp):
        sucesso, data = enviar_wapi(grupo, msg, db_session)
        assert sucesso is True
        assert data["id"] == "WAPI_MSG_123456"

    # Confirma que foi gravado em MensagemCapturada para o Chat de Grupos
    cap = db_session.query(models.MensagemCapturada).filter(
        models.MensagemCapturada.message_id == "WAPI_MSG_123456"
    ).first()

    assert cap is not None
    assert cap.message_content == "Finalmente é hoje, às 20h! 🔥"
    assert cap.group_jid == "120363405673797894@g.us"
    assert cap.from_me is True
