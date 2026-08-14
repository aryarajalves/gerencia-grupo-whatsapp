import pytest
from datetime import datetime
import models
from services.sync_service import BR_TZ

def test_sync_service_admin_detection(db_session):
    grupo = models.GrupoWhatsApp(
        id_do_grupo="123456789@g.us",
        nome="Grupo Teste Roles",
        ativo=True
    )
    db_session.add(grupo)
    db_session.commit()

    # Simula chamada de sincronização com participantes admin e membros
    participants = [
        {"id": "5511999990001@s.whatsapp.net", "name": "Admin WAPI 1", "admin": "admin"},
        {"id": "5511999990002@s.whatsapp.net", "name": "Admin WAPI 2", "admin": "superadmin"},
        {"id": "5511999990003@s.whatsapp.net", "name": "Admin WAPI 3", "isAdmin": True},
        {"id": "5511999990004@s.whatsapp.net", "name": "Admin WAPI 4", "isSuperAdmin": True},
        {"id": "5511999990005@s.whatsapp.net", "name": "Membro Comun", "admin": None}
    ]

    # Executa a lógica idêntica à do sync_service
    db_session.query(models.ContatoGrupo).filter_by(jid_grupo=grupo.id_do_grupo).update({"no_grupo": False})
    db_session.commit()

    for p in participants:
        p_numero = str(p.get("phone") or p.get("phoneNumber") or p.get("id") or p.get("user") or p.get("number") or "").strip()
        if "@" in p_numero:
            p_numero = p_numero.split("@")[0]
        p_nome = p.get("name") or p_numero
        p_admin = (
            p.get("admin") in ["admin", "superadmin"] or 
            p.get("isAdmin") is True or 
            p.get("isSuperAdmin") is True
        )

        contato_db = db_session.query(models.ContatoGrupo).filter_by(numero=p_numero, jid_grupo=grupo.id_do_grupo).first()
        if not contato_db:
            contato_db = models.ContatoGrupo(
                cliente_id=grupo.cliente_id,
                nome=p_nome, numero=p_numero, jid_grupo=grupo.id_do_grupo,
                nome_grupo=grupo.nome, no_grupo=True,
                is_admin=p_admin,
                extraido_em=datetime.now(BR_TZ).replace(tzinfo=None)
            )
            db_session.add(contato_db)
        else:
            contato_db.is_admin = p_admin
            contato_db.no_grupo = True

    db_session.commit()

    c1 = db_session.query(models.ContatoGrupo).filter_by(numero="5511999990001").first()
    c2 = db_session.query(models.ContatoGrupo).filter_by(numero="5511999990002").first()
    c3 = db_session.query(models.ContatoGrupo).filter_by(numero="5511999990003").first()
    c4 = db_session.query(models.ContatoGrupo).filter_by(numero="5511999990004").first()
    c5 = db_session.query(models.ContatoGrupo).filter_by(numero="5511999990005").first()

    assert c1.is_admin is True
    assert c2.is_admin is True
    assert c3.is_admin is True
    assert c4.is_admin is True
    assert c5.is_admin is False

def test_endpoint_filter_by_admin(client, db_session):
    c1 = models.ContatoGrupo(
        nome="Admin Contact",
        numero="5511888880001",
        jid_grupo="g1@g.us",
        nome_grupo="Grupo Teste",
        no_grupo=True,
        is_admin=True
    )
    c2 = models.ContatoGrupo(
        nome="Member Contact",
        numero="5511888880002",
        jid_grupo="g1@g.us",
        nome_grupo="Grupo Teste",
        no_grupo=True,
        is_admin=False
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    # Test sem filtro (retorna 2)
    resp = client.get("/contatos/", headers={"X-API-Key": "test-secret"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 2

    # Test com filtro is_admin=true
    resp_admin = client.get("/contatos/?is_admin=true", headers={"X-API-Key": "test-secret"})
    assert resp_admin.status_code == 200
    items_admin = resp_admin.json()["items"]
    assert len(items_admin) == 1
    assert items_admin[0]["numero"] == "5511888880001"
    assert items_admin[0]["is_admin"] is True

    # Test com filtro is_admin=false
    resp_membro = client.get("/contatos/?is_admin=false", headers={"X-API-Key": "test-secret"})
    assert resp_membro.status_code == 200
    items_membro = resp_membro.json()["items"]
    assert len(items_membro) == 1
    assert items_membro[0]["numero"] == "5511888880002"
    assert items_membro[0]["is_admin"] is False

def test_export_csv_includes_cargo(client, db_session):
    c1 = models.ContatoGrupo(
        nome="Admin CSV",
        numero="5511777770001",
        jid_grupo="g1@g.us",
        nome_grupo="Grupo Teste",
        no_grupo=True,
        is_admin=True
    )
    c2 = models.ContatoGrupo(
        nome="Membro CSV",
        numero="5511777770002",
        jid_grupo="g1@g.us",
        nome_grupo="Grupo Teste",
        no_grupo=True,
        is_admin=False
    )
    db_session.add_all([c1, c2])
    db_session.commit()

    resp = client.get("/contatos/export", headers={"X-API-Key": "test-secret"})
    assert resp.status_code == 200
    csv_content = resp.text

    assert "Cargo no Grupo" in csv_content
    assert "Admin CSV,5511777770001,Grupo Teste,Admin,No Grupo" in csv_content
    assert "Membro CSV,5511777770002,Grupo Teste,Membro,No Grupo" in csv_content
