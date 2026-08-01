import pytest
import models
from unittest.mock import patch, MagicMock
from services.message_service import enviar_wapi

def test_enquete_chat_persistence(db_session):
    """
    Testa se o envio de mensagem do tipo 'enquete' via message_service 
    cria o registro em MensagemCapturada com media_type='enquete' 
    e as opções formatadas em media_url com '|'.
    """
    from client_context import get_active_client_id
    cid = get_active_client_id(db_session)

    cfg1 = models.Configuracao(chave="WAPI_INSTANCE_ID", valor="instance_test_123")
    cfg2 = models.Configuracao(chave="WAPI_TOKEN", valor="token_test_123")
    db_session.add_all([cfg1, cfg2])
    db_session.commit()

    grupo = models.GrupoWhatsApp(
        cliente_id=cid,
        id_do_grupo="grupo_enquete_123@g.us",
        nome="Grupo Teste Enquete",
        ativo=True
    )
    db_session.add(grupo)
    db_session.commit()

    from types import SimpleNamespace
    msg_obj = SimpleNamespace(
        tipo_de_mensagem="enquete",
        mensagem="Quanto é 2 + 2 ?",
        opcoes_enquete="Opção 1\nOpção 2\nOpção 3",
        ordem=1
    )

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"id": "wapi_msg_999"}

    with patch("httpx.post", return_value=mock_resp):
        res = enviar_wapi(grupo, msg_obj, db_session)
    
    # Verifica se salvou a MensagemCapturada da enquete
    msg_cap = db_session.query(models.MensagemCapturada).filter(
        models.MensagemCapturada.group_jid == "grupo_enquete_123@g.us",
        models.MensagemCapturada.media_type == "enquete"
    ).first()

    assert msg_cap is not None
    assert msg_cap.message_content == "Quanto é 2 + 2 ?"
    assert msg_cap.media_type == "enquete"
    assert msg_cap.media_url == "Opção 1|Opção 2|Opção 3"
