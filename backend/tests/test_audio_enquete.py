import uuid

def test_criar_mensagem_audio(client):
    """Testa a criação de uma mensagem do tipo áudio."""
    headers = {"x-api-key": "test-secret"}
    payload = {
        "mensagem": "Áudio de Boas Vindas",
        "numero_da_mensagem": 1,
        "dia_do_lancamento": 1,
        "horario_do_disparo": "09:00:00",
        "tipo_de_mensagem": "audio",
        "link_midia": "http://s3.amazonn.com/audio.mp3"
    }
    response = client.post("/mensagens/", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["tipo_de_mensagem"] == "audio"
    assert response.json()["link_midia"] == "http://s3.amazonn.com/audio.mp3"

def test_criar_mensagem_enquete(client):
    """Testa a criação de uma mensagem do tipo enquete."""
    headers = {"x-api-key": "test-secret"}
    payload = {
        "mensagem": "Qual sua cor favorita?",
        "numero_da_mensagem": 2,
        "dia_do_lancamento": 1,
        "horario_do_disparo": "10:00:00",
        "tipo_de_mensagem": "enquete",
        "opcoes_enquete": "Azul\nVermelho\nVerde"
    }
    response = client.post("/mensagens/", json=payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["tipo_de_mensagem"] == "enquete"
    assert response.json()["opcoes_enquete"] == "Azul\nVermelho\nVerde"

def test_update_enquete(client):
    """Testa a atualização de opções de uma enquete."""
    headers = {"x-api-key": "test-secret"}
    
    # 1. Criar
    create_payload = {
        "mensagem": "Pergunta?",
        "numero_da_mensagem": 3,
        "dia_do_lancamento": 1,
        "horario_do_disparo": "11:00:00",
        "tipo_de_mensagem": "enquete",
        "opcoes_enquete": "A\nB"
    }
    create_res = client.post("/mensagens/", json=create_payload, headers=headers)
    msg_id = create_res.json()["id"]
    
    # 2. Atualizar
    update_payload = create_payload.copy()
    update_payload["opcoes_enquete"] = "Sim\nNão"
    response = client.put(f"/mensagens/{msg_id}", json=update_payload, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["opcoes_enquete"] == "Sim\nNão"
