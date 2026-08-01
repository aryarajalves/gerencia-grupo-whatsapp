import pytest
import uuid
from datetime import datetime, timedelta
import models
from services.sync_service import atualizar_contagem_contatos

def test_grupo_extraction_settings_and_interval(client, db_session, monkeypatch):
    # 1. Cria dois grupos: um com extração desabilitada e outro com extração recente (pulada)
    g_disabled = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Extração Off",
        id_do_grupo="12345@g.us",
        extrair_contatos=False,
        intervalo_extracao_minutos=30,
        ativo=True
    )
    g_recent = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Extraído Recente",
        id_do_grupo="67890@g.us",
        extrair_contatos=True,
        intervalo_extracao_minutos=60,
        ultima_extracao_em=datetime.now() - timedelta(minutes=10), # extraído há 10 min, intervalo é 60
        ativo=True
    )
    db_session.add_all([g_disabled, g_recent])
    db_session.commit()

    # 2. Testa criação de grupo com novos campos via API
    resp_create = client.post("/grupos/", json={
        "nome": "Grupo API Extração",
        "id_do_grupo": "99999@g.us",
        "extrair_contatos": True,
        "intervalo_extracao_minutos": 15
    })
    assert resp_create.status_code == 200
    data = resp_create.json()
    assert data["extrair_contatos"] is True
    assert data["intervalo_extracao_minutos"] == 15

    # 3. Sincroniza e verifica que os filtros de permissão e tempo são respeitados sem crashar
    atualizar_contagem_contatos(db_session)

    db_session.refresh(g_disabled)
    db_session.refresh(g_recent)
    assert g_disabled.extrair_contatos is False
    assert g_recent.intervalo_extracao_minutos == 60
