import pytest
import models
import security

def test_get_and_update_numero_fantasma_config(client, db_session):
    """
    Testa a persistência e recuperação das credenciais e plano do Número Fantasma nas rotas /config/.
    """
    email = "fantasma_admin2@exemplo.com"
    password = "adminpassword123"
    hashed_pw = security.get_password_hash(password)
    
    admin_user = models.Usuario(
        nome="Admin Fantasma 2",
        email=email,
        senha_hash=hashed_pw,
        cargo="SUPER_ADMIN",
        ativo=True
    )
    db_session.add(admin_user)
    db_session.commit()
    
    login_resp = client.post("/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Salva dados do número fantasma (token, instance_id, plano e ativo)
    fantasma_payload = {
        "WAPI_FANTASMA_INSTANCE_ID": "GHOST-INST-9988",
        "WAPI_FANTASMA_TOKEN": "secret_ghost_token_12345",
        "WAPI_FANTASMA_PLAN_TYPE": "PRO",
        "WAPI_FANTASMA_ATIVO": "true"
    }
    post_resp = client.post("/config/", json=fantasma_payload, headers=headers)
    assert post_resp.status_code == 200
    assert post_resp.json()["message"] == "Configurações atualizadas"

    # Confirma que foram persistidas e retornadas corretamente
    get_resp = client.get("/config/", headers=headers)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data.get("WAPI_FANTASMA_INSTANCE_ID") == "GHOST-INST-9988"
    assert data.get("WAPI_FANTASMA_TOKEN") == "secret_ghost_token_12345"
    assert data.get("WAPI_FANTASMA_PLAN_TYPE") == "PRO"
    assert data.get("WAPI_FANTASMA_ATIVO") == "true"
