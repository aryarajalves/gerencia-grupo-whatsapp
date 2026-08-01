import pytest
import uuid
import httpx
import models

def test_manual_group_extraction_endpoint(client, db_session, monkeypatch):
    # Configurações W-API para o teste
    db_session.add_all([
        models.Configuracao(chave="WAPI_INSTANCE_ID", valor="INST_MANUAL"),
        models.Configuracao(chave="WAPI_TOKEN", valor="TOK_MANUAL")
    ])
    db_session.commit()

    # Mock HTTP response
    class MockResponse:
        status_code = 200
        def json(self):
            return {"participants": [
                {"phone": "5511888888888", "short": "Lead Manual 1"},
                {"phoneNumber": "5511777777777", "name": "Lead Manual 2"}
            ]}

    monkeypatch.setattr(httpx.Client, "get", lambda *args, **kwargs: MockResponse())

    # Cria grupo de teste
    grupo_id = uuid.uuid4()
    grupo = models.GrupoWhatsApp(
        id=grupo_id,
        nome="Grupo Extração Manual",
        id_do_grupo="77777@g.us",
        extrair_contatos=True,
        quantidade_contatos=0,
        ativo=True
    )
    db_session.add(grupo)
    db_session.commit()

    # Dispara a extração manual via endpoint POST /grupos/{id}/extrair-contatos
    resp = client.post(f"/grupos/{grupo_id}/extrair-contatos")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["quantidade_contatos"] == 2

    # Valida atualização no banco
    db_session.refresh(grupo)
    assert grupo.quantidade_contatos == 2
    assert grupo.ultima_extracao_em is not None

    # Valida que os contatos foram salvos na tabela ContatoGrupo
    c_saved = db_session.query(models.ContatoGrupo).filter_by(jid_grupo="77777@g.us").all()
    assert len(c_saved) == 2

    # Valida criação do log no Histórico
    log = db_session.query(models.LogDisparo).filter_by(
        grupo_nome="Grupo Extração Manual",
        tipo="extracao_contatos"
    ).first()
    assert log is not None
    assert "Extração manual" in log.mensagem_corpo
