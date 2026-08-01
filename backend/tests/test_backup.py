import pytest
import models

def test_backup_info_and_list_endpoints(client, db_session):
    """
    Testa a consulta de informações de backup (/backup/info) e listagem (/backup/list).
    """
    resp_info = client.get("/backup/info")
    assert resp_info.status_code == 200
    data_info = resp_info.json()
    assert "retencao_count" in data_info
    assert "interval_hours" in data_info
    assert "agendamento_ativo" in data_info

    resp_list = client.get("/backup/list")
    assert resp_list.status_code == 200
    data_list = resp_list.json()
    assert "total" in data_list
    assert "items" in data_list
    assert isinstance(data_list["items"], list)

def test_backup_manual_creation(client, db_session):
    """
    Testa a rota de geração manual de backup (/backup/create).
    """
    resp = client.post("/backup/create")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert "zapgroup_backup" in data["data"]["filename"]

def test_backup_settings_update(client, db_session):
    """
    Testa a alteração de configurações de retenção e intervalo.
    """
    payload = {
        "interval_hours": 12,
        "retencao_count": 50,
        "agendamento_ativo": False
    }
    resp = client.post("/backup/settings", json=payload)
    assert resp.status_code == 200

    resp_info = client.get("/backup/info")
    data = resp_info.json()
    assert data["interval_hours"] == 12
    assert data["retencao_count"] == 50
    assert data["agendamento_ativo"] is False
