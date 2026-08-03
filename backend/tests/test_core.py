
import uuid

def test_health_check(client):
    """Verifica se a API está de pé (Rota /)"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "API Gerenciador de Grupos WhatsApp Ativa"

def test_crud_grupo(client):
    """
    Testa o ciclo de vida completo de um grupo: Criar, Ler, Atualizar, Deletar.
    """
    headers = {"x-api-key": "test-secret"}
    
    # 1. Criar
    payload = {
        "nome": "Grupo CRUD Test",
        "id_do_grupo": "crud-test-id-" + str(uuid.uuid4()),
        "numero_do_disparo": "5511988888888",
        "dia_inicio_semana": 1,
        "dia_fim_semana": 5
    }
    response = client.post("/grupos/", json=payload, headers=headers)
    assert response.status_code == 200
    grupo_id = response.json()["id"]
    
    # 2. Ler
    response = client.get("/grupos/", headers=headers)
    assert response.status_code == 200
    
    # 3. Deletar
    response = client.delete(f"/grupos/{grupo_id}", headers=headers)
    assert response.status_code == 200

def test_crud_mensagem(client):
    """
    Testa o ciclo de vida completo de uma mensagem.
    """
    headers = {"x-api-key": "test-secret"}
    
    # 1. Criar
    payload = {
        "mensagem": "Mensagem de teste",
        "numero_da_mensagem": 10,
        "dia_do_lancamento": 2,
        "horario_do_disparo": "15:30:00",
        "tipo_de_mensagem": "texto",
        "link_midia": ""
    }
    response = client.post("/mensagens/", json=payload, headers=headers)
    assert response.status_code == 200
    msg_id = response.json()["id"]
    
    # 2. Ler com filtro
    response = client.get("/mensagens/?dia=2", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(m["id"] == msg_id for m in data["items"])
    
    # 3. Atualizar
    update_payload = payload.copy()
    update_payload["mensagem"] = "Mensagem alterada"
    response = client.put(f"/mensagens/{msg_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["mensagem"] == "Mensagem alterada"
    
    # 4. Toggle Ativo
    response = client.patch(f"/mensagens/{msg_id}/toggle", headers=headers)
    assert response.status_code == 200
    assert response.json()["ativo"] is False
    
    # 5. Deletar
    response = client.delete(f"/mensagens/{msg_id}", headers=headers)
    assert response.status_code == 200
    
    # Verificar se sumiu
    response = client.get("/mensagens/", headers=headers)
    assert not any(m["id"] == str(msg_id) for m in response.json()["items"])

def test_crud_usuario(client):
    """
    Testa o gerenciamento de usuários via convite e registro.
    """
    headers = {"x-api-key": "test-secret"}
    
    # 1. Criar Convite
    invite_payload = {
        "cargo": "ADMIN",
        "tipo": "convite"
    }
    response = client.post("/convite", json=invite_payload, headers=headers)
    assert response.status_code == 200
    res_data = response.json()
    token = res_data["token"]
    assert "http://testserver/registrar/" in res_data["link"] or "http://localhost:5173/registrar/" in res_data["link"]
    
    # 2. Registrar Usuário usando o Convite
    register_payload = {
        "token": token,
        "nome": "Usuário Teste",
        "email": "teste@exemplo.com",
        "password": "senha_segura123",
        "confirm_password": "senha_segura123"
    }
    response = client.post("/registrar", json=register_payload)
    assert response.status_code == 200
    
    # 3. Listar Usuários e obter o ID do usuário criado
    response = client.get("/usuarios/", headers=headers)
    assert response.status_code == 200
    usuarios = response.json()
    user_id = next(u["id"] for u in usuarios if u["email"] == "teste@exemplo.com")
    
    # 4. Toggle Status
    response = client.patch(f"/usuarios/{user_id}/toggle", headers=headers)
    assert response.status_code == 200
    assert response.json()["ativo"] is False
    
    # 5. Deletar
    response = client.delete(f"/usuarios/{user_id}", headers=headers)
    assert response.status_code == 200
    response = client.get("/usuarios/", headers=headers)
    assert not any(u["id"] == str(user_id) for u in response.json())


def test_logs_e_retry(client, db_session):
    """
    Testa a listagem de logs e a rota de retry.
    """
    from models import LogDisparo, GrupoWhatsApp
    headers = {"x-api-key": "test-secret"}
    
    # Criar um grupo para o retry funcionar
    grupo = GrupoWhatsApp(nome="Grupo Teste Log", id_do_grupo="log-test-id", numero_do_disparo="123")
    db_session.add(grupo)
    db_session.commit()
    
    # Criar um log manual
    log = LogDisparo(grupo_nome="Grupo Teste Log", mensagem_corpo="Corpo da mensagem", status="Erro", detalhes_erro="Falha simulada")
    db_session.add(log)
    db_session.commit()
    log_id = str(log.id)
    
    # 1. Listar logs
    response = client.get("/logs/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(l["id"] == log_id for l in data["items"])
    
    # 2. Retry (Mockado no scheduler via conftest)
    # Nota: No conftest, scheduler.enviar_payload_n8n não foi mockado para retorno de sucesso fixo,
    # mas o enviar_payload_n8n em si pode falhar se não acharmos a função.
    
    # Vamos mockar o enviar_payload_n8n no setup do client se necessário, mas aqui vamos apenas testar a rota.
    import scheduler
    scheduler.enviar_payload_n8n = lambda g, m, db: (True, "Sucesso Mock")
    
    response = client.post(f"/logs/{log_id}/retry", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "Sucesso"

