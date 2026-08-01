import pytest

HEADERS = {"X-API-Key": "test-secret"}

def test_list_clients(client):
    response = client.get("/clientes/", headers=HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_create_client(client):
    payload = {
        "nome": "Empresa Teste Unitario",
        "subtitulo": "PAINEL SECUNDARIO",
        "wapi_instance_id": "INSTANCE_TEST_123",
        "wapi_token": "TOKEN_TEST_123",
        "wapi_plan_type": "PRO"
    }
    response = client.post("/clientes/", json=payload, headers=HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["nome"] == "Empresa Teste Unitario"
    assert "id" in data

    # Selecionar o cliente recém-criado
    client_id = data["id"]
    select_res = client.post(f"/clientes/{client_id}/selecionar", headers=HEADERS)
    assert select_res.status_code == 200
    assert select_res.json()["status"] == "success"

    # Deletar o cliente recém-criado
    del_res = client.delete(f"/clientes/{client_id}", headers=HEADERS)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"
