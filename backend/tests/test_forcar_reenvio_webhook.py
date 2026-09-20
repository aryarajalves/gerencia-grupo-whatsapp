"""
Testes unitários para a opção de forçar o reenvio de webhooks na extração de contatos.
Valida:
- Extração com forcar_reenvio_webhook=False não reenvia para contatos que já têm webhook_enviado=True.
- Extração com forcar_reenvio_webhook=True reenvia para todos os contatos não-administradores.
- Administradores NUNCA são disparados via webhook, mesmo se forcar_reenvio_webhook=True.
- Endpoint aceita payload JSON {"forcar_reenvio_webhook": True}.
"""
import pytest
import uuid
import httpx
from datetime import datetime
from unittest.mock import patch, MagicMock

import models
from services.sync_service import processar_participantes_grupo, BR_TZ


def test_forcar_reenvio_webhook_sync_service(db_session):
    """Quando forcar_reenvio_webhook=True, reenvia para contatos mesmo se webhook_enviado=True, mas ignora admins."""
    agora = datetime.now(BR_TZ).replace(tzinfo=None)
    grupo_jid = f"test_resend_{uuid.uuid4().hex[:6]}@g.us"

    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste Reenvio",
        id_do_grupo=grupo_jid,
        ativo=True,
        webhook_extracao_url="https://webhook.teste.com/contatos"
    )
    db_session.add(grupo)
    db_session.commit()

    # Contato 1: já enviado anteriormente
    c1 = models.ContatoGrupo(
        nome="Lead Ja Enviado",
        numero="5511999990001",
        jid_grupo=grupo_jid,
        nome_grupo=grupo.nome,
        no_grupo=True,
        is_admin=False,
        extraido_em=agora,
        webhook_enviado=True,
        webhook_enviado_em=agora
    )
    # Contato 2: admin (já cadastrado)
    c2 = models.ContatoGrupo(
        nome="Admin do Grupo",
        numero="5511999990002",
        jid_grupo=grupo_jid,
        nome_grupo=grupo.nome,
        no_grupo=True,
        is_admin=True,
        extraido_em=agora,
        webhook_enviado=False
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    participants = [
        {"phone": "5511999990001", "name": "Lead Ja Enviado", "admin": None},
        {"phone": "5511999990002", "name": "Admin do Grupo", "admin": "admin"},
        {"phone": "5511999990003", "name": "Lead Novo", "admin": None}
    ]

    # Cenário 1: Sem forçar reenvio (forcar_reenvio_webhook=False)
    # Deve enviar APENAS o Lead Novo (1 disparo). Lead 1 já foi enviado e Admin é excluído.
    with patch("services.sync_service.disparar_webhook_contato") as mock_disparo:
        mock_disparo.return_value = True
        detalhes = processar_participantes_grupo(
            db_session, None, "inst", {}, grupo, participants, agora,
            group_is_closed=False,
            forcar_reenvio_webhook=False,
            retornar_detalhes=True
        )
        assert detalhes["webhooks"] == 1
        assert mock_disparo.call_count == 1
        args, _ = mock_disparo.call_args
        assert args[1]["numero"] == "5511999990003"  # Apenas o novo

    # Cenário 2: Com forçar reenvio (forcar_reenvio_webhook=True)
    # Deve enviar o Lead 1 E o Lead Novo (2 disparos). Admin continua EXCLUÍDO.
    with patch("services.sync_service.disparar_webhook_contato") as mock_disparo:
        mock_disparo.return_value = True
        detalhes = processar_participantes_grupo(
            db_session, None, "inst", {}, grupo, participants, agora,
            group_is_closed=False,
            forcar_reenvio_webhook=True,
            retornar_detalhes=True
        )
        assert detalhes["webhooks"] == 2
        assert mock_disparo.call_count == 2
        numeros_disparados = [c[0][1]["numero"] for c in mock_disparo.call_args_list]
        assert "5511999990001" in numeros_disparados  # Lead já enviado foi reenviado
        assert "5511999990003" in numeros_disparados  # Lead novo foi enviado
        assert "5511999990002" not in numeros_disparados  # Admin NUNCA é enviado


def test_endpoint_extrair_contatos_com_forcar_reenvio(client, db_session, monkeypatch):
    """Valida que o endpoint POST /grupos/{id}/extrair-contatos aceita forcar_reenvio_webhook no payload."""
    db_session.add_all([
        models.Configuracao(chave="WAPI_INSTANCE_ID", valor="INST_TEST"),
        models.Configuracao(chave="WAPI_TOKEN", valor="TOK_TEST")
    ])
    db_session.commit()

    class MockResponse:
        status_code = 200
        def json(self):
            return {"participants": [
                {"phone": "5511999991111", "name": "Membro 1"},
                {"phone": "5511999992222", "name": "Admin 1", "admin": "admin"}
            ]}

    monkeypatch.setattr(httpx.Client, "get", lambda *args, **kwargs: MockResponse())

    grupo_id = uuid.uuid4()
    grupo = models.GrupoWhatsApp(
        id=grupo_id,
        nome="Grupo Reenvio API Teste",
        id_do_grupo=f"test_{grupo_id.hex[:6]}@g.us",
        extrair_contatos=True,
        quantidade_contatos=0,
        ativo=True,
        webhook_extracao_url="https://meu-webhook.com/endpoint"
    )
    db_session.add(grupo)
    db_session.commit()

    with patch("services.sync_service.disparar_webhook_contato") as mock_disparo:
        mock_disparo.return_value = True

        # Chamada com forcar_reenvio_webhook=True
        resp = client.post(
            f"/grupos/{grupo_id}/extrair-contatos",
            json={"forcar_reenvio_webhook": True}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "success"
        assert data["webhooks_disparados"] == 1  # 1 membro comum (admin ignorado)
        assert "1 webhooks disparados" in data["message"]
