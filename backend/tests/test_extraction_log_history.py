import pytest
import uuid
import httpx
import models
from services.sync_service import atualizar_contagem_contatos

def test_extraction_logs_created_in_history(client, db_session, monkeypatch):
    # 0. Configurações da W-API para o teste
    db_session.add_all([
        models.Configuracao(chave="WAPI_INSTANCE_ID", valor="TEST_INST"),
        models.Configuracao(chave="WAPI_TOKEN", valor="TEST_TOK")
    ])
    db_session.commit()

    # Mock HTTP response
    class MockResponse:
        status_code = 200
        def json(self):
            return {"participants": [{"id": "5511999999999@s.whatsapp.net", "name": "Contato Teste"}]}

    monkeypatch.setattr(httpx.Client, "get", lambda *args, **kwargs: MockResponse())

    # 1. Cria um grupo ativo com extração habilitada
    grupo = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Teste Logs Extração",
        id_do_grupo="88888@g.us",
        extrair_contatos=True,
        intervalo_extracao_minutos=30,
        ativo=True
    )
    db_session.add(grupo)
    db_session.commit()

    # 2. Executa a função de atualização de contatos
    atualizar_contagem_contatos(db_session)

    # 3. Verifica se um log de disparo do tipo 'extracao_contatos' foi registrado no banco
    log = db_session.query(models.LogDisparo).filter(
        models.LogDisparo.grupo_nome == "Grupo Teste Logs Extração",
        models.LogDisparo.tipo == "extracao_contatos"
    ).first()

    assert log is not None
    assert log.tipo == "extracao_contatos"
    assert "Extração de contatos" in log.mensagem_corpo
