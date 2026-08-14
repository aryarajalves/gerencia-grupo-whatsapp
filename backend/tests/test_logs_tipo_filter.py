import pytest
import models
import uuid

def test_filtro_logs_por_tipo(client, db_session):
    # 1. Cria cliente ativo
    cliente = models.Cliente(nome="Cliente Teste Filtro Logs", ativo=True)
    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)

    cfg = models.Configuracao(chave="ACTIVE_CLIENT_ID", valor=str(cliente.id))
    db_session.add(cfg)
    db_session.commit()

    # 2. Cria logs de diferentes tipos
    log_disparo = models.LogDisparo(
        cliente_id=cliente.id,
        grupo_nome="Grupo A",
        mensagem_corpo="Mensagem de teste",
        tipo="texto",
        status="Sucesso"
    )
    log_extracao = models.LogDisparo(
        cliente_id=cliente.id,
        grupo_nome="Grupo A",
        mensagem_corpo="Extração realizada",
        tipo="extracao_contatos",
        status="Sucesso"
    )
    log_fantasma = models.LogDisparo(
        cliente_id=cliente.id,
        grupo_nome="Grupo B",
        mensagem_corpo="Alerta pesca de leads",
        tipo="fantasma_pesca_leads",
        status="ALERTA"
    )
    db_session.add_all([log_disparo, log_extracao, log_fantasma])
    db_session.commit()

    # 3. Testa filtro por extracao
    resp_extracao = client.get("/logs/?tipo=extracao")
    assert resp_extracao.status_code == 200
    items_extracao = resp_extracao.json()["items"]
    assert any(i["tipo"] == "extracao_contatos" for i in items_extracao)
    assert not any(i["tipo"] == "fantasma_pesca_leads" for i in items_extracao)

    # 4. Testa filtro por fantasma
    resp_fantasma = client.get("/logs/?tipo=fantasma")
    assert resp_fantasma.status_code == 200
    items_fantasma = resp_fantasma.json()["items"]
    assert any(i["tipo"] == "fantasma_pesca_leads" for i in items_fantasma)
    assert not any(i["tipo"] == "extracao_contatos" for i in items_fantasma)

    # 5. Testa filtro por disparos
    resp_disparos = client.get("/logs/?tipo=disparos")
    assert resp_disparos.status_code == 200
    items_disparos = resp_disparos.json()["items"]
    assert any(i["tipo"] == "texto" for i in items_disparos)
    assert not any(i["tipo"] == "extracao_contatos" for i in items_disparos)
