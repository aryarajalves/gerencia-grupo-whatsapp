import pytest
import uuid
import models

def test_criar_e_filtrar_mensagem_com_etiqueta(client, db_session):
    # 1. Cria Cliente de teste
    c1 = models.Cliente(id=uuid.uuid4(), nome="Cliente Teste Etiqueta", ativo=True)
    db_session.add(c1)
    db_session.commit()

    # Selecionar cliente
    client.post(f"/clientes/{c1.id}/selecionar")

    # 2. Criar mensagens com etiquetas diferentes e sem etiqueta
    payload_oferta = {
        "mensagem": "Super Oferta de Lançamento!",
        "dia_do_lancamento": 1,
        "horario_do_disparo": "10:00:00",
        "tipo_de_mensagem": "texto",
        "etiqueta": "Oferta"
    }
    payload_lembrete = {
        "mensagem": "Lembrete da live de hoje!",
        "dia_do_lancamento": 1,
        "horario_do_disparo": "19:00:00",
        "tipo_de_mensagem": "texto",
        "etiqueta": "Lembrete"
    }
    payload_sem_tag = {
        "mensagem": "Mensagem comum sem tag",
        "dia_do_lancamento": 2,
        "horario_do_disparo": "12:00:00",
        "tipo_de_mensagem": "texto",
        "etiqueta": None
    }

    res1 = client.post("/mensagens/", json=payload_oferta)
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["etiqueta"] == "Oferta"

    res2 = client.post("/mensagens/", json=payload_lembrete)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["etiqueta"] == "Lembrete"

    res3 = client.post("/mensagens/", json=payload_sem_tag)
    assert res3.status_code == 200
    data3 = res3.json()
    assert data3["etiqueta"] is None

    # 3. Testar filtro por etiqueta
    res_ofertas = client.get("/mensagens/?etiqueta=Oferta")
    assert res_ofertas.status_code == 200
    items_oferta = res_ofertas.json()["items"]
    assert len(items_oferta) == 1
    assert items_oferta[0]["mensagem"] == "Super Oferta de Lançamento!"

    res_lembretes = client.get("/mensagens/?etiqueta=Lembrete")
    assert res_lembretes.status_code == 200
    items_lembrete = res_lembretes.json()["items"]
    assert len(items_lembrete) == 1
    assert items_lembrete[0]["mensagem"] == "Lembrete da live de hoje!"

    # 4. Testar exportação e importação preservando etiqueta
    exp_resp = client.get("/mensagens/export")
    assert exp_resp.status_code == 200
    exp_data = exp_resp.json()
    tags_exported = [item.get("etiqueta") for item in exp_data["items"]]
    assert "Oferta" in tags_exported
    assert "Lembrete" in tags_exported

    # Criar Cliente 2 e importar
    c2 = models.Cliente(id=uuid.uuid4(), nome="Cliente 2 Etiqueta", ativo=True)
    db_session.add(c2)
    db_session.commit()
    client.post(f"/clientes/{c2.id}/selecionar")

    imp_resp = client.post("/mensagens/import", json=exp_data)
    assert imp_resp.status_code == 200

    list_c2 = client.get("/mensagens/?etiqueta=Oferta")
    assert list_c2.status_code == 200
    assert len(list_c2.json()["items"]) == 1
