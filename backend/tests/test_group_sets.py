import pytest
import uuid
import os

def test_crud_conjuntos(client):
    # 1. Criar um conjunto (sem grupos por enquanto)
    slug = f"test-slug-{uuid.uuid4().hex[:8]}"
    payload = {
        "nome": "Conjunto Teste",
        "slug": slug,
        "ativo": True,
        "grupos": []
    }
    response = client.post("/conjuntos/", json=payload, headers={"x-api-key": "test-secret"})
    assert response.status_code == 200
    data = response.json()
    assert data["nome"] == "Conjunto Teste"
    assert data["slug"] == slug
    conjunto_id = data["id"]

    # 2. Listar conjuntos
    response = client.get("/conjuntos/", headers={"x-api-key": "test-secret"})
    assert response.status_code == 200
    assert any(c["id"] == conjunto_id for c in response.json())

    # 3. Atualizar conjunto
    payload["nome"] = "Conjunto Teste Atualizado"
    response = client.put(f"/conjuntos/{conjunto_id}", json=payload, headers={"x-api-key": "test-secret"})
    assert response.status_code == 200
    assert response.json()["nome"] == "Conjunto Teste Atualizado"

    # 4. Deletar conjunto
    response = client.delete(f"/conjuntos/{conjunto_id}", headers={"x-api-key": "test-secret"})
    assert response.status_code == 200

def test_redirecionamento_logica(client):
    # Teste de 404 para slug inexistente
    response = client.get("/join/slug-inexistente")
    assert response.status_code == 404

    # Teste de slug duplicado
    slug = f"dup-{uuid.uuid4().hex[:8]}"
    payload = {"nome": "D1", "slug": slug, "ativo": True, "grupos": []}
    client.post("/conjuntos/", json=payload, headers={"x-api-key": "test-secret"})
    response = client.post("/conjuntos/", json=payload, headers={"x-api-key": "test-secret"})
    assert response.status_code == 400 # Bad request por slug duplicado
