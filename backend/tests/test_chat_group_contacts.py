import pytest
import models

def test_chat_group_contacts_filter(client, db_session):
    """
    Testa a listagem e contagem de contatos filtrados por jid_grupo para o chat.
    """
    db_session.query(models.ContatoGrupo).delete()
    db_session.commit()

    from client_context import get_active_client_id
    cid = get_active_client_id(db_session)

    c1 = models.ContatoGrupo(
        cliente_id=cid,
        nome="Ana Maria",
        numero="5511988887777",
        jid_grupo="grupo_alfa@g.us",
        nome_grupo="Grupo Alfa",
        no_grupo=True
    )
    c2 = models.ContatoGrupo(
        cliente_id=cid,
        nome="Bruno Santos",
        numero="5511977776666",
        jid_grupo="grupo_alfa@g.us",
        nome_grupo="Grupo Alfa",
        no_grupo=True
    )
    c3 = models.ContatoGrupo(
        cliente_id=cid,
        nome="Carlos Eduardo",
        numero="5511966665555",
        jid_grupo="grupo_beta@g.us",
        nome_grupo="Grupo Beta",
        no_grupo=True
    )

    db_session.add_all([c1, c2, c3])
    db_session.commit()

    # Busca contatos do grupo_alfa
    resp = client.get("/contatos/?jid_grupo=grupo_alfa@g.us&limit=500")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    numeros = [item["numero"] for item in data["items"]]
    assert "5511988887777" in numeros
    assert "5511977776666" in numeros
    assert "5511966665555" not in numeros
