import pytest
import uuid
import models

def test_export_and_import_messages(client, db):
    # 1. Cria Cliente A e insere mensagens
    c1 = models.Cliente(id=uuid.uuid4(), nome="Cliente A Exportador", ativo=True)
    c2 = models.Cliente(id=uuid.uuid4(), nome="Cliente B Importador", ativo=True)
    db.add_all([c1, c2])
    db.commit()

    m1 = models.MensagemDisparada(
        id=uuid.uuid4(),
        cliente_id=c1.id,
        mensagem="Mensagem 1 do Roteiro",
        numero_da_mensagem=1,
        dia_do_lancamento=1,
        tipo_de_mensagem="texto"
    )
    m2 = models.MensagemDisparada(
        id=uuid.uuid4(),
        cliente_id=c1.id,
        mensagem="Mensagem 2 do Roteiro",
        numero_da_mensagem=2,
        dia_do_lancamento=2,
        tipo_de_mensagem="imagem",
        link_midia="https://example.com/foto.png"
    )
    db.add_all([m1, m2])
    db.commit()

    # 2. Seleciona Cliente A e exporta
    client.post(f"/clientes/{c1.id}/selecionar")
    exp_resp = client.get("/mensagens/export")
    assert exp_resp.status_code == 200
    exp_data = exp_resp.json()
    assert exp_data["total_messages"] == 2
    assert len(exp_data["items"]) == 2

    # 3. Seleciona Cliente B
    client.post(f"/clientes/{c2.id}/selecionar")

    # Confirma que Cliente B não possui mensagens
    list_b_before = client.get("/mensagens/")
    assert list_b_before.status_code == 200
    assert list_b_before.json()["total"] == 0

    # 4. Importa as mensagens exportadas do Cliente A para o Cliente B
    imp_resp = client.post("/mensagens/import", json=exp_data)
    assert imp_resp.status_code == 200
    assert imp_resp.json()["imported_count"] == 2

    # 5. Confirma que Cliente B agora possui as 2 mensagens importadas
    list_b_after = client.get("/mensagens/")
    assert list_b_after.status_code == 200
    items_b = list_b_after.json()["items"]
    assert len(items_b) == 2
    msgs_texts = [item["mensagem"] for item in items_b]
    assert "Mensagem 1 do Roteiro" in msgs_texts
    assert "Mensagem 2 do Roteiro" in msgs_texts
