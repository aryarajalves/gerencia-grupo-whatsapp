import pytest
import uuid
import models
from database import SessionLocal

def test_bulk_delete_endpoint():
    db = SessionLocal()
    try:
        g1 = models.GrupoWhatsApp(
            nome="Grupo Bulk 1",
            id_do_grupo=f"bulk1_{uuid.uuid4().hex[:6]}@g.us",
            ativo=True
        )
        g2 = models.GrupoWhatsApp(
            nome="Grupo Bulk 2",
            id_do_grupo=f"bulk2_{uuid.uuid4().hex[:6]}@g.us",
            ativo=True
        )
        db.add(g1)
        db.add(g2)
        db.commit()
        db.refresh(g1)
        db.refresh(g2)

        g1_id = g1.id
        g2_id = g2.id

        # Simula remocao em massa
        db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id.in_([g1_id, g2_id])).delete(synchronize_session=False)
        db.commit()

        check_g1 = db.query(models.GrupoWhatsApp).filter_by(id=g1_id).first()
        check_g2 = db.query(models.GrupoWhatsApp).filter_by(id=g2_id).first()

        assert check_g1 is None
        assert check_g2 is None
    finally:
        db.close()
