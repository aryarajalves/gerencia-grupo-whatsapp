import pytest
import uuid
import models

def test_client_selection_updates_config_and_syncs_changes(client, db_session):
    # 1. Cria dois clientes
    c1 = models.Cliente(id=uuid.uuid4(), nome="Cliente A Original", logo_url="https://logo.com/a.png", wapi_instance_id="INST_A", wapi_token="TOK_A", ativo=True)
    c2 = models.Cliente(id=uuid.uuid4(), nome="Clinte 002", logo_url="", wapi_instance_id="INST_B", wapi_token="TOK_B", ativo=True)
    db_session.add_all([c1, c2])
    db_session.commit()

    # 2. Seleciona o Cliente 002
    resp_sel = client.post(f"/clientes/{c2.id}/selecionar")
    assert resp_sel.status_code == 200

    # 3. Verifica se GET /config/ retornou as configs do Clinte 002 (incluindo ACTIVE_CLIENT_ID e WAPI_INSTANCE_ID)
    cfg_resp = client.get("/config/")
    assert cfg_resp.status_code == 200
    cfgs = cfg_resp.json()
    assert cfgs["ACTIVE_CLIENT_ID"] == str(c2.id)
    assert cfgs["COMPANY_NAME"] == "Clinte 002"
    assert cfgs["WAPI_INSTANCE_ID"] == "INST_B"

    # 4. Edita a configuração enquanto o Clinte 002 está ativo
    update_resp = client.post("/config/", json={
        "COMPANY_NAME": "Clinte 002 Editado",
        "WAPI_INSTANCE_ID": "INST_B_EDITADA"
    })
    assert update_resp.status_code == 200

    # 5. Verifica se a alteração foi sincronizada de volta no registro do Clinte 002 na tabela Cliente
    db_session.refresh(c2)
    assert c2.nome == "Clinte 002 Editado"
    assert c2.wapi_instance_id == "INST_B_EDITADA"
