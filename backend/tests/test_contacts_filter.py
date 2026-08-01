import pytest

def test_listar_grupos_dos_contatos(client, db_session):
    import models
    
    # Adiciona contatos de grupos diferentes
    c1 = models.ContatoGrupo(
        nome="Contato 1",
        numero="123",
        jid_grupo="grupo1@g.us",
        nome_grupo="Grupo 1",
        no_grupo=True
    )
    c2 = models.ContatoGrupo(
        nome="Contato 2",
        numero="456",
        jid_grupo="grupo2@g.us",
        nome_grupo="Grupo 2",
        no_grupo=True
    )
    # Grupo repetido para testar o distinct
    c3 = models.ContatoGrupo(
        nome="Contato 3",
        numero="789",
        jid_grupo="grupo1@g.us",
        nome_grupo="Grupo 1",
        no_grupo=True
    )
    
    db_session.add_all([c1, c2, c3])
    db_session.commit()

    # Chama o endpoint (API key "test-secret" é o override no conftest)
    response = client.get("/contatos/grupos", headers={"X-API-Key": "test-secret"})
    
    assert response.status_code == 200
    data = response.json()
    
    # Deve retornar exatamente 2 grupos (Grupo 1 e Grupo 2)
    assert len(data) == 2
    
    jids = [g["jid_grupo"] for g in data]
    assert "grupo1@g.us" in jids
    assert "grupo2@g.us" in jids
    
    nomes = [g["nome_grupo"] for g in data]
    assert "Grupo 1" in nomes
    assert "Grupo 2" in nomes
