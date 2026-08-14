import pytest
import models
import uuid

def test_criar_e_atualizar_grupo_com_numero_fantasma(client, db_session):
    """
    Testa a criação e atualização de um grupo com a flag numero_fantasma_ativo.
    """
    # 1. Cria cliente ativo
    cliente = models.Cliente(nome="Cliente Teste Fantasma", ativo=True)
    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)

    cfg = models.Configuracao(chave="ACTIVE_CLIENT_ID", valor=str(cliente.id))
    db_session.add(cfg)
    db_session.commit()

    # 2. Cria grupo com numero_fantasma_ativo=True
    grupo_payload = {
        "nome": "Grupo com Fantasma",
        "id_do_grupo": f"ghost_{uuid.uuid4().hex[:8]}@g.us",
        "numero_do_disparo": "5511999998888",
        "ativo": True,
        "dia_inicio_semana": 0,
        "dia_fim_semana": 4,
        "numero_fantasma_ativo": True
    }

    resp = client.post("/grupos/", json=grupo_payload)
    assert resp.status_code == 200, resp.text
    created_data = resp.json()
    assert created_data["numero_fantasma_ativo"] is True
    grupo_id = created_data["id"]

    # 3. Atualiza grupo para numero_fantasma_ativo=False
    grupo_payload["numero_fantasma_ativo"] = False
    put_resp = client.put(f"/grupos/{grupo_id}", json=grupo_payload)
    assert put_resp.status_code == 200
    updated_data = put_resp.json()
    assert updated_data["numero_fantasma_ativo"] is False

    # 4. Busca lista de grupos e valida persistência
    get_resp = client.get("/grupos/")
    assert get_resp.status_code == 200
    grupos = get_resp.json()
    target = next((g for g in grupos if g["id"] == grupo_id), None)
    assert target is not None
    assert target["numero_fantasma_ativo"] is False
