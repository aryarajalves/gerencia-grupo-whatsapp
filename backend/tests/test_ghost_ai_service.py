import pytest
import uuid
from unittest.mock import patch, MagicMock
import models
from services.ghost_ai_service import (
    _classificacao_heuristica_fallback,
    analisar_mensagem_fantasma,
    processar_mensagem_privada_fantasma
)

def test_heuristica_fallback():
    # Mensagem com link e palavra de venda
    res1 = _classificacao_heuristica_fallback("Oi, tenho mentoria com desconto no link https://checkout.com/xyz")
    assert res1["e_venda_ou_prospeccao"] is True
    assert res1["tipo_infracao"] == "VENDA_CONCORRENTE"
    assert res1["grau_risco"] == "ALTO"

    # Mensagem com link apenas
    res2 = _classificacao_heuristica_fallback("Acesse https://site.com")
    assert res2["e_venda_ou_prospeccao"] is True
    assert res2["tipo_infracao"] == "SPAM_LINKS"

    # Mensagem comum
    res3 = _classificacao_heuristica_fallback("Bom dia, tudo bem?")
    assert res3["e_venda_ou_prospeccao"] is False
    assert res3["tipo_infracao"] == "CONVERSA_COMUM"

def test_analisar_mensagem_fantasma_com_mock_openai():
    mock_response_data = {
        "choices": [{
            "message": {
                "content": '{"e_venda_ou_prospeccao": true, "tipo_infracao": "VENDA_CONCORRENTE", "grau_risco": "ALTO", "resumo_motivo": "Oferta de mentoria paralela"}'
            }
        }]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_response_data

    with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-teste-real-12345"}):
        with patch("httpx.Client.post", return_value=mock_resp):
            resultado = analisar_mensagem_fantasma(
                texto_mensagem="Olá! Tenho mentoria do curso X por R$ 50",
                nome_grupo="Lançamento VIP",
                remetente_info="Invasor (5511999998888)"
            )
            assert resultado["e_venda_ou_prospeccao"] is True
            assert resultado["tipo_infracao"] == "VENDA_CONCORRENTE"
            assert resultado["grau_risco"] == "ALTO"

def test_processar_mensagem_privada_fantasma_gera_alerta(db_session):
    # 1. Cria cliente ativo
    cliente = models.Cliente(nome="Cliente Fantasma Teste", ativo=True)
    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)

    # 2. Cria grupo com numero_fantasma_ativo=True
    grupo_jid = f"grupo_{uuid.uuid4().hex[:6]}@g.us"
    grupo = models.GrupoWhatsApp(
        cliente_id=cliente.id,
        nome="Grupo Lançamento Beta",
        id_do_grupo=grupo_jid,
        numero_do_disparo="5511900000000",
        numero_fantasma_ativo=True,
        ativo=True
    )
    db_session.add(grupo)
    db_session.commit()
    db_session.refresh(grupo)

    # 3. Cria contato associado ao grupo
    contato_num = "5511988887777"
    contato = models.ContatoGrupo(
        cliente_id=cliente.id,
        jid_grupo=grupo_jid,
        numero=contato_num,
        nome="Invasor Teste",
        no_grupo=True
    )
    db_session.add(contato)
    db_session.commit()

    # 4. Executa processamento da mensagem privada recebida pelo fantasma
    processar_mensagem_privada_fantasma(
        db=db_session,
        sender_number=contato_num,
        sender_name="Invasor Teste",
        msg_body="Oi! Vi você no grupo e tenho um curso com desconto: https://promo.com",
        cid=str(cliente.id)
    )

    # 5. Valida se o LogDisparo de ALERTA foi criado
    log = db_session.query(models.LogDisparo).filter(
        models.LogDisparo.cliente_id == str(cliente.id),
        models.LogDisparo.tipo == "fantasma_pesca_leads"
    ).first()

    assert log is not None
    assert log.status == "ALERTA"
    assert "PESCA DE LEADS DETECTADA" in log.mensagem_corpo
    assert "Invasor Teste" in log.mensagem_corpo
    assert "Grupo Lançamento Beta" in log.mensagem_corpo
