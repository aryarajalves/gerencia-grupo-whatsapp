import pytest
import models
import security

def test_get_and_update_config(client, db_session):
    """
    Testa a leitura e atualização de WAPI_TOKEN e WAPI_INSTANCE_ID nas rotas /config/.
    """
    # 1. Criar usuário super admin para autenticação
    email = "config_admin@exemplo.com"
    password = "adminpassword123"
    hashed_pw = security.get_password_hash(password)
    
    admin_user = models.Usuario(
        nome="Config Admin",
        email=email,
        senha_hash=hashed_pw,
        cargo="SUPER_ADMIN",
        ativo=True
    )
    db_session.add(admin_user)
    db_session.commit()
    
    # 2. Fazer login e obter token
    login_resp = client.post("/login", json={"email": email, "password": password})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. GET /config/ inicial
    get_resp = client.get("/config/", headers=headers)
    assert get_resp.status_code == 200
    initial_data = get_resp.json()
    assert "WAPI_TOKEN" in initial_data
    assert "WAPI_INSTANCE_ID" in initial_data

    # 4. POST /config/ salvando novas credenciais WAPI
    new_credentials = {
        "WAPI_TOKEN": "0GUqhp0x0IqBaizvvINO7ewow81MTZK1r",
        "WAPI_INSTANCE_ID": "LITE-M3SOUT-TEST"
    }
    post_resp = client.post("/config/", json=new_credentials, headers=headers)
    assert post_resp.status_code == 200
    assert post_resp.json()["message"] == "Configurações atualizadas"

    # 5. GET /config/ após salvamento confirmando persistência
    get_resp_updated = client.get("/config/", headers=headers)
    assert get_resp_updated.status_code == 200
    updated_data = get_resp_updated.json()
    assert updated_data["WAPI_TOKEN"] == "0GUqhp0x0IqBaizvvINO7ewow81MTZK1r"
    assert updated_data["WAPI_INSTANCE_ID"] == "LITE-M3SOUT-TEST"
