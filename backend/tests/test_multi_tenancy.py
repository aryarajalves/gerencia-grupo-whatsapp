import pytest
import uuid
import models

def test_client_data_isolation(client, db_session):
    # 1. Cria dois clientes distintos
    c1 = models.Cliente(id=uuid.uuid4(), nome="Cliente Alpha Isolation", ativo=True)
    c2 = models.Cliente(id=uuid.uuid4(), nome="Cliente Beta Isolation", ativo=True)
    db_session.add_all([c1, c2])
    db_session.commit()

    # 2. Cria grupo e mensagem para o Cliente Alpha
    g1 = models.GrupoWhatsApp(id=uuid.uuid4(), cliente_id=c1.id, nome="Grupo Alpha", id_do_grupo="alpha@g.us", numero_do_disparo="5511111", ativo=True)
    m1 = models.MensagemDisparada(id=uuid.uuid4(), cliente_id=c1.id, mensagem="Msg Alpha", numero_da_mensagem=1, dia_do_lancamento=1, tipo_de_mensagem="texto")
    cap1 = models.MensagemCapturada(id=uuid.uuid4(), cliente_id=c1.id, sender_name="Lead Alpha", sender_number="5511111", message_content="Captura Alpha", group_jid="alpha@g.us")
    
    # 3. Cria grupo para o Cliente Beta
    g2 = models.GrupoWhatsApp(id=uuid.uuid4(), cliente_id=c2.id, nome="Grupo Beta", id_do_grupo="beta@g.us", numero_do_disparo="5522222", ativo=True)
    cap2 = models.MensagemCapturada(id=uuid.uuid4(), cliente_id=c2.id, sender_name="Lead Beta", sender_number="5522222", message_content="Captura Beta", group_jid="beta@g.us")

    db_session.add_all([g1, m1, cap1, g2, cap2])
    db_session.commit()

    # 4. Seleciona o Cliente Alpha como ativo
    client.post(f"/clientes/{c1.id}/selecionar")

    # Verifica se rotas retornam apenas dados do Cliente Alpha
    resp_grupos = client.get("/grupos/")
    assert resp_grupos.status_code == 200
    g_names = [g["nome"] for g in resp_grupos.json()]
    assert "Grupo Alpha" in g_names
    assert "Grupo Beta" not in g_names

    resp_capturas = client.get("/captura/mensagens/")
    assert resp_capturas.status_code == 200
    c_texts = [m["message_content"] for m in resp_capturas.json()["items"]]
    assert "Captura Alpha" in c_texts
    assert "Captura Beta" not in c_texts

    # 5. Seleciona o Cliente Beta como ativo
    client.post(f"/clientes/{c2.id}/selecionar")

    resp_grupos_b = client.get("/grupos/")
    assert resp_grupos_b.status_code == 200
    g_names_b = [g["nome"] for g in resp_grupos_b.json()]
    assert "Grupo Beta" in g_names_b
    assert "Grupo Alpha" not in g_names_b

    resp_capturas_b = client.get("/captura/mensagens/")
    assert resp_capturas_b.status_code == 200
    c_texts_b = [m["message_content"] for m in resp_capturas_b.json()["items"]]
    assert "Captura Beta" in c_texts_b
    assert "Captura Alpha" not in c_texts_b
