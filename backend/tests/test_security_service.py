import pytest
import uuid
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import Base
from services.security_service import processar_mensagem_seguranca_grupo

# Setup banco SQLite in-memory para testes
@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_mensagem_grupo_aberto_nao_toma_acao(db_session):
    """Quando o grupo está ABERTO (status_grupo_fechado=False), nenhuma ação de bloqueio deve ocorrer."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Teste Aberto",
        id_do_grupo="120363000000000000@g.us",
        status_grupo_fechado=False,
        seguranca_adms_ativa=True,
        adms_permitidos="5511999999999"
    )
    db_session.add(grupo)
    db_session.commit()

    resultado = processar_mensagem_seguranca_grupo(
        db=db_session,
        group_jid="120363000000000000@g.us",
        sender_number="5511888888888",
        sender_name="Membro Comum",
        message_id="msg_123"
    )

    assert resultado["action_taken"] is False
    assert resultado["reason"] == "group_is_open"

def test_mensagem_admin_autorizado_em_grupo_fechado(db_session):
    """Quando um admin da Lista de Segurança envia mensagem no grupo fechado, é liberado."""
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Teste Fechado",
        id_do_grupo="120363111111111111@g.us",
        status_grupo_fechado=True,
        seguranca_adms_ativa=True,
        adms_permitidos="5511999999999, 558596123586"
    )
    db_session.add(grupo)
    db_session.commit()

    resultado = processar_mensagem_seguranca_grupo(
        db=db_session,
        group_jid="120363111111111111@g.us",
        sender_number="558596123586",
        sender_name="Admin Legal",
        message_id="msg_456"
    )

    assert resultado["action_taken"] is False
    assert resultado["reason"] == "sender_is_authorized_admin"

@patch("services.security_service.httpx.Client")
def test_mensagem_invasor_grupo_fechado_dispara_fluxo_completo(mock_client_cls, db_session):
    """
    Quando um usuário comum (não-admin) envia mensagem em grupo FECHADO com segurança ativa:
    Deve acionar deleção da mensagem, remoção do participante, envio do alerta no grupo e log.
    """
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_client.post.return_value = mock_response
    mock_client.request.return_value = mock_response
    mock_client.__enter__.return_value = mock_client
    mock_client_cls.return_value = mock_client

    # Configura credenciais da W-API
    cfg_inst = models.Configuracao(chave="WAPI_INSTANCE_ID", valor="inst_123")
    cfg_token = models.Configuracao(chave="WAPI_TOKEN", valor="token_abc")
    cfg_plan = models.Configuracao(chave="WHATSAPP_PLAN_TYPE", valor="PRO")
    db_session.add_all([cfg_inst, cfg_token, cfg_plan])

    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo VIP Fechado",
        id_do_grupo="120363222222222222@g.us",
        status_grupo_fechado=True,
        seguranca_adms_ativa=True,
        adms_permitidos="558596123586",
        remover_impostor_msg=True,
        msg_remocao_impostor="🚫 Atenção: Usuário @{numero} foi removido por violar as regras."
    )
    db_session.add(grupo)
    db_session.commit()

    resultado = processar_mensagem_seguranca_grupo(
        db=db_session,
        group_jid="120363222222222222@g.us",
        sender_number="5511977776666",
        sender_name="Invasor",
        message_id="msg_impostor_789"
    )

    assert resultado["action_taken"] is True
    assert resultado["impostor"] == "5511977776666"
    assert "mensagem_deletada" in resultado["acoes"]
    assert "participante_removido" in resultado["acoes"]
    assert "mensagem_alerta_enviada" in resultado["acoes"]

    # Valida se foi gravado o log de segurança
    log = db_session.query(models.LogDisparo).filter_by(tipo="seguranca_impostor_msg").first()
    assert log is not None
    assert "5511977776666" in log.mensagem_corpo
    assert log.status == "ALERTA"
