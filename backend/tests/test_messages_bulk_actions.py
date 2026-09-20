import pytest
import uuid
from datetime import time
import models

def test_bulk_delete_messages(client, db_session):
    c = models.Cliente(id=uuid.uuid4(), nome="Cliente Test Bulk Delete", ativo=True)
    db_session.add(c)
    db_session.commit()
    client.post(f"/clientes/{c.id}/selecionar")

    m1 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c.id, mensagem="Msg 1", dia_do_lancamento=1, horario_do_disparo=time(12, 0, 0), tipo_de_mensagem="texto")
    m2 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c.id, mensagem="Msg 2", dia_do_lancamento=1, horario_do_disparo=time(12, 0, 0), tipo_de_mensagem="texto")
    m3 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c.id, mensagem="Msg 3", dia_do_lancamento=2, horario_do_disparo=time(12, 0, 0), tipo_de_mensagem="texto")
    db_session.add_all([m1, m2, m3])
    db_session.commit()

    # Deletar m1 e m2 em lote
    resp = client.request("DELETE", "/mensagens/bulk", json={"ids": [str(m1.id), str(m2.id)]})
    assert resp.status_code == 200
    assert resp.json()["deleted_count"] == 2

    # Verificar que sobrou apenas m3
    list_resp = client.get("/mensagens/")
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    assert len(items) == 1
    assert items[0]["id"] == str(m3.id)

    # Testar também endpoint POST /mensagens/bulk-delete
    m4 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c.id, mensagem="Msg 4", dia_do_lancamento=2, horario_do_disparo=time(12, 0, 0), tipo_de_mensagem="texto")
    db_session.add(m4)
    db_session.commit()

    resp_post = client.post("/mensagens/bulk-delete", json={"ids": [str(m4.id)]})
    assert resp_post.status_code == 200
    assert resp_post.json()["deleted_count"] == 1

def test_bulk_assign_groups(client, db_session):
    c = models.Cliente(id=uuid.uuid4(), nome="Cliente Test Bulk Groups", ativo=True)
    db_session.add(c)
    db_session.commit()
    client.post(f"/clientes/{c.id}/selecionar")

    g1 = models.GrupoWhatsApp(id=uuid.uuid4(), nome="Grupo 1", id_do_grupo="grp1@g.us", cliente_id=c.id)
    g2 = models.GrupoWhatsApp(id=uuid.uuid4(), nome="Grupo 2", id_do_grupo="grp2@g.us", cliente_id=c.id)
    db_session.add_all([g1, g2])

    m1 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c.id, mensagem="Msg 1", dia_do_lancamento=1, horario_do_disparo=time(12, 0, 0), tipo_de_mensagem="texto")
    m2 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c.id, mensagem="Msg 2", dia_do_lancamento=1, horario_do_disparo=time(12, 0, 0), tipo_de_mensagem="texto")
    db_session.add_all([m1, m2])
    db_session.commit()

    # Atribuir g1 e g2 a m1 e m2 em lote
    resp = client.patch("/mensagens/bulk-grupos", json={
        "ids": [str(m1.id), str(m2.id)],
        "grupo_ids": [str(g1.id), str(g2.id)]
    })
    assert resp.status_code == 200
    assert resp.json()["updated_count"] == 2

    # Verificar relacao de grupos
    list_resp = client.get("/mensagens/")
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    for item in items:
        assert set(item["grupo_ids"]) == {str(g1.id), str(g2.id)}
