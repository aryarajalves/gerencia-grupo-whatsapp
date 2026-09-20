import pytest
import models
import uuid
from unittest.mock import patch, AsyncMock
from services.poll_webhook_service import (
    extrair_dados_voto_enquete,
    disparar_webhook_enquete,
    processar_evento_enquete_grupo
)

def test_criar_e_atualizar_grupo_com_webhook_enquete(client, db_session):
    """
    Testa a criação e atualização de um grupo com webhook_enquete_ativo e webhook_enquete_url.
    """
    # 1. Cria cliente ativo
    cliente = models.Cliente(nome="Cliente Teste Enquete", ativo=True)
    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)

    cfg = models.Configuracao(chave="ACTIVE_CLIENT_ID", valor=str(cliente.id))
    db_session.add(cfg)
    db_session.commit()

    # 2. Cria grupo com webhook de enquete ativo
    grupo_payload = {
        "nome": "Grupo Enquetes VIP",
        "id_do_grupo": f"enquete_{uuid.uuid4().hex[:8]}@g.us",
        "numero_do_disparo": "5511999998888",
        "ativo": True,
        "dia_inicio_semana": 0,
        "dia_fim_semana": 4,
        "webhook_enquete_ativo": True,
        "webhook_enquete_url": "https://meu-webhook.com/enquete"
    }

    resp = client.post("/grupos/", json=grupo_payload)
    assert resp.status_code == 200, resp.text
    created_data = resp.json()
    assert created_data["webhook_enquete_ativo"] is True
    assert created_data["webhook_enquete_url"] == "https://meu-webhook.com/enquete"
    grupo_id = created_data["id"]

    # 3. Atualiza grupo alterando a URL e desativando
    grupo_payload["webhook_enquete_ativo"] = False
    grupo_payload["webhook_enquete_url"] = "https://novo-webhook.com/enquete"
    put_resp = client.put(f"/grupos/{grupo_id}", json=grupo_payload)
    assert put_resp.status_code == 200
    updated_data = put_resp.json()
    assert updated_data["webhook_enquete_ativo"] is False
    assert updated_data["webhook_enquete_url"] == "https://novo-webhook.com/enquete"

    # 4. Valida persistência via GET
    get_resp = client.get("/grupos/")
    assert get_resp.status_code == 200
    grupos = get_resp.json()
    target = next((g for g in grupos if g["id"] == grupo_id), None)
    assert target is not None
    assert target["webhook_enquete_ativo"] is False
    assert target["webhook_enquete_url"] == "https://novo-webhook.com/enquete"


def test_extrair_dados_voto_enquete(db_session):
    """
    Testa a extração dos dados de votação da enquete a partir de payload bruto.
    """
    # 1. Simula enquete original salva no banco
    poll_id = "POLL_MSG_123"
    msg_cap = models.MensagemCapturada(
        message_id=poll_id,
        message_content="Qual seu objetivo principal?",
        media_url="Vender mais|Ganhar seguidores|Automação de processos",
        media_type="enquete",
        from_me=True,
        sender_name="Admin",
        sender_number="5511999990000",
        group_jid="123456@g.us",
        group_name="Grupo Teste"
    )
    db_session.add(msg_cap)
    db_session.commit()

    # 2. Simula mensagem de voto recebida
    msg_voto = {
        "key": {
            "id": "VOTE_MSG_999",
            "remoteJid": "123456@g.us",
            "participant": "5511988887777@s.whatsapp.net"
        },
        "pushName": "Lucas Silva",
        "message": {
            "pollUpdateMessage": {
                "pollCreationMessageKey": {
                    "id": poll_id
                },
                "selectedOptions": [
                    {"optionName": "Vender mais"}
                ]
            }
        }
    }

    dados = extrair_dados_voto_enquete(msg_voto, db_session)
    assert dados is not None
    assert dados["id_mensagem_enquete"] == poll_id
    assert dados["titulo"] == "Qual seu objetivo principal?"
    assert dados["sender_name"] == "Lucas Silva"
    assert dados["sender_number"] == "5511988887777"
    assert "Vender mais" in dados["opcao_marcada"]
    assert "Vender mais" in dados["opcoes_marcadas"]
    assert len(dados["todas_opcoes"]) == 3


@pytest.mark.asyncio
async def test_disparar_webhook_enquete():
    """
    Testa o envio HTTP do payload de enquete para a URL configurada.
    """
    payload_teste = {
        "evento": "voto_enquete",
        "usuario": {"nome": "Teste", "numero": "5511999999999"},
        "enquete": {"titulo": "Pergunta", "opcao_marcada": "Opção A"}
    }

    with patch("httpx.AsyncClient.post") as mock_post:
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_post.return_value = mock_resp

        sucesso = await disparar_webhook_enquete("https://webhook.site/test", payload_teste)
        assert sucesso is True
        mock_post.assert_called_once()


@pytest.mark.asyncio
async def test_processar_evento_enquete_grupo(db_session):
    """
    Testa o fluxo completo do processamento de evento de enquete no grupo.
    """
    group_jid = "enquete_flow_group@g.us"
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste Webhook Enquete",
        id_do_grupo=group_jid,
        numero_do_disparo="5511999998888",
        ativo=True,
        webhook_enquete_ativo=True,
        webhook_enquete_url="https://webhook.site/enquetes-vip"
    )
    db_session.add(grupo)
    db_session.commit()

    msg_voto = {
        "key": {
            "id": "MSG_VOTE_01",
            "remoteJid": group_jid,
            "participant": "5521999887766@s.whatsapp.net"
        },
        "pushName": "Mariana Souza",
        "message": {
            "pollUpdateMessage": {
                "pollCreationMessageKey": {"id": "ORIG_POLL_01"},
                "selectedOptions": [{"optionName": "Sim, tenho interesse"}]
            }
        }
    }

    with patch("services.poll_webhook_service.disparar_webhook_enquete", new_callable=AsyncMock) as mock_dispatch:
        mock_dispatch.return_value = True
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto)
        assert mock_dispatch.called
        call_args = mock_dispatch.call_args
        assert call_args[0][0] == "https://webhook.site/enquetes-vip"
        assert call_args[0][1]["usuario"]["nome"] == "Mariana Souza"
        assert call_args[0][1]["usuario"]["numero"] == "5521999887766"
        assert "Sim, tenho interesse" in call_args[0][1]["enquete"]["opcao_marcada"]


@pytest.mark.asyncio
async def test_processar_evento_enquete_grupo_debounce(db_session):
    """
    Testa que ao trocar de opção antes do delay, apenas o voto mais recente é enviado.
    """
    import asyncio
    group_jid = "debounce_group@g.us"
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste Debounce",
        id_do_grupo=group_jid,
        numero_do_disparo="5511999998888",
        ativo=True,
        webhook_enquete_ativo=True,
        webhook_enquete_url="https://webhook.site/debounce-test",
        webhook_enquete_delay_segundos=1
    )
    db_session.add(grupo)
    db_session.commit()

    # Voto 1: Opção A
    msg_voto_1 = {
        "key": {"id": "VOTE_1", "remoteJid": group_jid, "participant": "5511999990001@s.whatsapp.net"},
        "pushName": "Roberto",
        "message": {
            "pollUpdateMessage": {
                "pollCreationMessageKey": {"id": "POLL_DB_01"},
                "selectedOptions": [{"optionName": "Opção A"}]
            }
        }
    }

    # Voto 2: Opção B (trocou de opção quase imediatamente)
    msg_voto_2 = {
        "key": {"id": "VOTE_2", "remoteJid": group_jid, "participant": "5511999990001@s.whatsapp.net"},
        "pushName": "Roberto",
        "message": {
            "pollUpdateMessage": {
                "pollCreationMessageKey": {"id": "POLL_DB_01"},
                "selectedOptions": [{"optionName": "Opção B"}]
            }
        }
    }

    with patch("services.poll_webhook_service.disparar_webhook_enquete", new_callable=AsyncMock) as mock_dispatch:
        mock_dispatch.return_value = True
        
        # Envia voto 1
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto_1)
        # Quase imediatamente envia voto 2
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto_2)
        
        # Aguarda delay de 1s + margem
        await asyncio.sleep(1.2)

        # Deve ter sido chamado exatamente 1 vez com a "Opção B"
        assert mock_dispatch.call_count == 1
        call_args = mock_dispatch.call_args
        assert call_args[0][1]["enquete"]["opcao_marcada"] == "Opção B"


def test_endpoint_testar_webhook_enquete(client):
    """
    Testa o endpoint POST /grupos/test-poll-webhook com mock de httpx.
    """
    payload = {
        "webhook_url": "https://webhook.site/teste-enquete-manual",
        "grupo_nome": "Grupo Teste Manual",
        "grupo_jid": "120363405673797894@g.us"
    }

    with patch("httpx.AsyncClient.post") as mock_post:
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_post.return_value = mock_resp

        resp = client.post("/grupos/test-poll-webhook", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "sucesso" in data["message"].lower()


def test_decriptar_voto_enquete_sucesso():
    """
    Testa a função decriptar_voto_enquete com dados reais de teste.
    """
    from services.poll_webhook_service import decriptar_voto_enquete

    poll_msg_id = "3EB010F7349302419A22"
    secret_b64 = "GajxhDtqgaNHJIMwum/DNTyV8eOmfht5S/G2Ix+fSyE="
    enc_iv_b64 = "FIvr96p1TB+mnrzN"
    enc_payload_b64 = "UQHRJIRr50IaunwyK8WQ4up7S9BRFA3Z0W52IazKuy+sWIl9ViSbiIMlNRbXG+wNvN4="
    creator_jids = ["25619983261796@lid"]
    voter_jids = ["25619983261796@lid"]
    todas_opcoes = ["4", "6", "8"]

    opcoes = decriptar_voto_enquete(
        poll_msg_id=poll_msg_id,
        secret_b64=secret_b64,
        enc_iv_b64=enc_iv_b64,
        enc_payload_b64=enc_payload_b64,
        creator_jids=creator_jids,
        voter_jids=voter_jids,
        todas_opcoes=todas_opcoes
    )

    assert opcoes == ["4"]


@pytest.mark.asyncio
async def test_modo_enquetes_selecionadas_filtro(db_session):
    """
    Testa que no modo 'selecionadas', enquetes não autorizadas são ignoradas
    e enquetes autorizadas disparam normalmente.
    """
    from services.poll_webhook_service import processar_evento_enquete_grupo

    group_jid = "120363405673797894@g.us"
    grupo = db_session.query(models.GrupoWhatsApp).filter_by(id_do_grupo=group_jid).first()
    if not grupo:
        grupo = models.GrupoWhatsApp(
            nome="Grupo Modo Selecionadas",
            id_do_grupo=group_jid,
            webhook_enquete_ativo=True,
            webhook_enquete_url="https://webhook.site/teste-modo",
            webhook_enquete_modo="selecionadas"
        )
        db_session.add(grupo)
    else:
        grupo.webhook_enquete_ativo = True
        grupo.webhook_enquete_url = "https://webhook.site/teste-modo"
        grupo.webhook_enquete_modo = "selecionadas"
    db_session.commit()

    # Enquete 1 (Manual/Sem autorização): Não deve disparar
    msg_voto_manual = {
        "key": {"id": "VOTE_MANUAL", "remoteJid": group_jid, "participant": "5511999990001@s.whatsapp.net"},
        "pushName": "Roberto",
        "message": {
            "pollUpdateMessage": {
                "pollCreationMessageKey": {"id": "POLL_MANUAL_NAO_AUTORIZADA"},
                "selectedOptions": [{"optionName": "Opção 1"}]
            }
        }
    }

    with patch("services.poll_webhook_service.disparar_webhook_enquete", new_callable=AsyncMock) as mock_dispatch:
        mock_dispatch.return_value = True
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto_manual)
        assert mock_dispatch.call_count == 0

    # Enquete 2 (Programada com webhook_ativo=True no DB): Deve disparar
    import json
    db_session.add(models.MensagemCapturada(
        message_id="POLL_PROGRAMADA_AUTORIZADA",
        sender_name="Bot",
        message_content="Enquete Autorizada",
        media_url=json.dumps({"options": ["Sim", "Não"], "secret": None, "webhook_ativo": True, "programada_id": "prog-123"}),
        group_jid=group_jid
    ))
    db_session.commit()

    msg_voto_autorizado = {
        "key": {"id": "VOTE_AUTORIZADO", "remoteJid": group_jid, "participant": "5511999990001@s.whatsapp.net"},
        "pushName": "Roberto",
        "message": {
            "pollUpdateMessage": {
                "pollCreationMessageKey": {"id": "POLL_PROGRAMADA_AUTORIZADA"},
                "selectedOptions": [{"optionName": "Sim"}]
            }
        }
    }

    with patch("services.poll_webhook_service.disparar_webhook_enquete", new_callable=AsyncMock) as mock_dispatch:
        mock_dispatch.return_value = True
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto_autorizado)
        assert mock_dispatch.call_count == 1
        call_args = mock_dispatch.call_args
        assert call_args[0][1]["enquete"]["opcao_marcada"] == "Sim"

    # Enquete 3 (Com lista específica de IDs no grupo): Apenas o ID na lista dispara
    grupo.webhook_enquete_ids = json.dumps(["prog-999"])  # Apenas prog-999 está na lista
    db_session.commit()

    with patch("services.poll_webhook_service.disparar_webhook_enquete", new_callable=AsyncMock) as mock_dispatch:
        mock_dispatch.return_value = True
        # prog-123 não está em prog-999, portanto deve ser ignorado
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto_autorizado)
        assert mock_dispatch.call_count == 0

    # Agora inclui prog-123 na lista de permitidos
    grupo.webhook_enquete_ids = json.dumps(["prog-123", "prog-999"])
    db_session.commit()

    with patch("services.poll_webhook_service.disparar_webhook_enquete", new_callable=AsyncMock) as mock_dispatch:
        mock_dispatch.return_value = True
        await processar_evento_enquete_grupo(db_session, group_jid, msg_voto_autorizado)
        assert mock_dispatch.call_count == 1
        assert call_args[0][1]["enquete"]["opcao_marcada"] == "Sim"
