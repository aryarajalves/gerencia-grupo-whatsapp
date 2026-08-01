"""
Testes unitários para a funcionalidade de Webhook de Extração de Contatos.

Valida:
- Campo webhook_extracao_url é salvo e recuperado corretamente na API de grupos
- A função disparar_webhook_contato envia o payload correto
- Falhas no webhook não interrompem o fluxo de extração
"""
import pytest
import uuid
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# ============================================================
# Fixture helpers (reutilizam conftest.py do projeto)
# ============================================================

def make_grupo_payload(webhook_url=None):
    return {
        "nome": "Grupo Webhook Teste",
        "id_do_grupo": f"test_{uuid.uuid4().hex[:8]}@g.us",
        "numero_do_disparo": "",
        "ativo": True,
        "dia_inicio_semana": 0,
        "dia_fim_semana": 4,
        "dia_lancamento_atual": 0,
        "quantidade_contatos": 0,
        "tipo_ciclo": "semanal",
        "extrair_contatos": True,
        "intervalo_extracao_minutos": 30,
        "webhook_extracao_url": webhook_url
    }


# ============================================================
# Testes da API de Grupos (campo webhook_extracao_url)
# ============================================================

def test_criar_grupo_com_webhook_url(client, setup_db):
    """Deve criar um grupo com webhook_extracao_url preenchido."""
    payload = make_grupo_payload(webhook_url="https://hook.example.com/contatos")
    resp = client.post("/grupos/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["webhook_extracao_url"] == "https://hook.example.com/contatos"


def test_criar_grupo_sem_webhook_url(client, setup_db):
    """Deve criar um grupo com webhook_extracao_url nulo quando não fornecido."""
    payload = make_grupo_payload(webhook_url=None)
    resp = client.post("/grupos/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["webhook_extracao_url"] is None


def test_atualizar_webhook_url_no_grupo(client, setup_db):
    """Deve atualizar o webhook_extracao_url de um grupo existente."""
    # Cria o grupo
    payload = make_grupo_payload(webhook_url=None)
    resp_create = client.post("/grupos/", json=payload)
    assert resp_create.status_code == 200
    grupo_id = resp_create.json()["id"]

    # Atualiza com webhook
    payload["webhook_extracao_url"] = "https://hook.example.com/novo"
    resp_update = client.put(f"/grupos/{grupo_id}", json=payload)
    assert resp_update.status_code == 200
    assert resp_update.json()["webhook_extracao_url"] == "https://hook.example.com/novo"


def test_remover_webhook_url_do_grupo(client, setup_db):
    """Deve permitir limpar o webhook_extracao_url de um grupo."""
    payload = make_grupo_payload(webhook_url="https://hook.example.com/contatos")
    resp_create = client.post("/grupos/", json=payload)
    grupo_id = resp_create.json()["id"]

    payload["webhook_extracao_url"] = None
    resp_update = client.put(f"/grupos/{grupo_id}", json=payload)
    assert resp_update.status_code == 200
    assert resp_update.json()["webhook_extracao_url"] is None


# ============================================================
# Testes da função disparar_webhook_contato (sync_service)
# ============================================================

def test_disparar_webhook_contato_sucesso():
    """Deve enviar POST com payload correto quando webhook responder 200."""
    from services.sync_service import disparar_webhook_contato

    contato = {"nome": "João Silva", "numero": "5511999999999"}
    grupo = {"nome": "Grupo Teste", "jid": "123@g.us"}

    with patch("httpx.Client") as MockClient:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_instance = MockClient.return_value.__enter__.return_value
        mock_instance.post.return_value = mock_resp

        # Não deve lançar exceção
        disparar_webhook_contato("https://hook.example.com/test", contato, grupo)

        # Verifica que o POST foi chamado com os campos corretos
        call_kwargs = mock_instance.post.call_args
        payload_enviado = call_kwargs[1]["json"]
        assert payload_enviado["numero"] == "5511999999999"
        assert payload_enviado["nome"] == "João Silva"
        assert payload_enviado["grupo"] == "Grupo Teste"
        assert payload_enviado["grupo_jid"] == "123@g.us"
        assert "extraido_em" in payload_enviado


def test_disparar_webhook_contato_falha_nao_bloqueia():
    """Deve apenas logar o erro e NÃO lançar exceção quando webhook falhar."""
    from services.sync_service import disparar_webhook_contato

    contato = {"nome": "Maria", "numero": "5511888888888"}
    grupo = {"nome": "Grupo Teste", "jid": "456@g.us"}

    with patch("httpx.Client") as MockClient:
        mock_instance = MockClient.return_value.__enter__.return_value
        mock_instance.post.side_effect = Exception("Connection refused")

        # Não deve lançar exceção — apenas logar
        try:
            disparar_webhook_contato("https://hook-invalido.example.com", contato, grupo)
        except Exception:
            pytest.fail("disparar_webhook_contato não deveria lançar exceção em caso de falha")


def test_disparar_webhook_contato_status_erro_nao_bloqueia():
    """Deve apenas logar e NÃO lançar exceção quando webhook retornar 4xx/5xx."""
    from services.sync_service import disparar_webhook_contato

    contato = {"nome": "Carlos", "numero": "5511777777777"}
    grupo = {"nome": "Grupo Teste", "jid": "789@g.us"}

    with patch("httpx.Client") as MockClient:
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_instance = MockClient.return_value.__enter__.return_value
        mock_instance.post.return_value = mock_resp

        try:
            disparar_webhook_contato("https://hook.example.com/errado", contato, grupo)
        except Exception:
            pytest.fail("disparar_webhook_contato não deveria lançar exceção quando recebe status 500")


def test_contato_grupo_model_webhook_enviado_default(db_session):
    """Deve ter webhook_enviado como False por padrão no modelo ContatoGrupo."""
    import models
    c = models.ContatoGrupo(nome="Teste", numero="123", jid_grupo="g@g.us", nome_grupo="G")
    db_session.add(c)
    db_session.commit()
    db_session.refresh(c)
    assert c.webhook_enviado is False
    assert c.webhook_enviado_em is None

