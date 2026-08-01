import pytest
import uuid
import models

def test_delete_single_contact(client, db):
    # Cria contato de teste
    c = models.ContatoGrupo(
        id=uuid.uuid4(),
        nome="Contato Teste",
        numero="551199999999",
        nome_grupo="Grupo Teste",
        jid_grupo="123456@g.us",
        no_grupo=True
    )
    db.add(c)
    db.commit()

    cid = str(c.id)

    # Exclui via API
    resp = client.delete(f"/contatos/{cid}")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Contato excluído com sucesso"

    # Confirma que foi removido do banco
    deleted = db.query(models.ContatoGrupo).filter(models.ContatoGrupo.id == c.id).first()
    assert deleted is None

def test_delete_batch_contacts(client, db):
    c1 = models.ContatoGrupo(id=uuid.uuid4(), nome="Lote 1", numero="551111111", nome_grupo="Grupo", jid_grupo="1@g.us", no_grupo=True)
    c2 = models.ContatoGrupo(id=uuid.uuid4(), nome="Lote 2", numero="552222222", nome_grupo="Grupo", jid_grupo="1@g.us", no_grupo=True)
    db.add_all([c1, c2])
    db.commit()

    ids = [str(c1.id), str(c2.id)]

    resp = client.post("/contatos/batch-delete", json={"ids": ids})
    assert resp.status_code == 200
    assert resp.json()["deleted_count"] == 2

    cnt = db.query(models.ContatoGrupo).filter(models.ContatoGrupo.id.in_([c1.id, c2.id])).count()
    assert cnt == 0
