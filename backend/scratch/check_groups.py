from database import SessionLocal
import models

db = SessionLocal()
try:
    print("--- Grupos em grupos_whatsapp ---")
    grupos = db.query(models.GrupoWhatsApp).all()
    for g in grupos:
        print(f"ID: {g.id}, JID: {g.id_do_grupo}, Nome: {g.nome}")

    print("\n--- Grupos em contatos_grupos (únicos) ---")
    grupos_contatos = db.query(models.ContatoGrupo.jid_grupo, models.ContatoGrupo.nome_grupo).distinct().all()
    for g in grupos_contatos:
        print(f"JID: {g.jid_grupo}, Nome: {g.nome_grupo}")
finally:
    db.close()
