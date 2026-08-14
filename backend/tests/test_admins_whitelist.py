import pytest
from datetime import datetime
import models
from services.sync_service import processar_participantes_grupo

def test_whitelist_admins_detects_impostor_when_active_and_closed(db_session):
    # 1. Cria grupo com Lista de Segurança ATIVA e Status FECHADO
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste Fechado",
        id_do_grupo="123456789@g.us",
        numero_do_disparo="5511999999999",
        adms_permitidos="5511999998888, 5511977776666",
        seguranca_adms_ativa=True,
        status_grupo_fechado=True
    )
    db_session.add(grupo)
    db_session.commit()
    db_session.refresh(grupo)

    participants = [
        {"id": "5511999998888@s.whatsapp.net", "name": "Admin Legítimo", "admin": "admin"},
        {"id": "5511900001111@s.whatsapp.net", "name": "Admin Impostor", "admin": "admin"}
    ]

    agora = datetime.now()
    processar_participantes_grupo(db_session, None, "test-instance", {}, grupo, participants, agora, group_is_closed=True)
    
    log_alerta = db_session.query(models.LogDisparo).filter(
        models.LogDisparo.grupo_nome == grupo.nome,
        models.LogDisparo.tipo == "seguranca_adm"
    ).first()

    assert log_alerta is not None
    assert "5511900001111" in log_alerta.mensagem_corpo


def test_whitelist_admins_omits_alert_when_open(db_session):
    # 2. Cria grupo com Lista de Segurança ATIVA mas Status ABERTO
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste Aberto",
        id_do_grupo="987654321@g.us",
        numero_do_disparo="5511999999999",
        adms_permitidos="5511999998888",
        seguranca_adms_ativa=True,
        status_grupo_fechado=False
    )
    db_session.add(grupo)
    db_session.commit()

    participants = [
        {"id": "5511900001111@s.whatsapp.net", "name": "Admin Impostor", "admin": "admin"}
    ]

    agora = datetime.now()
    processar_participantes_grupo(db_session, None, "test-instance", {}, grupo, participants, agora, group_is_closed=False)
    
    log_alerta = db_session.query(models.LogDisparo).filter(
        models.LogDisparo.grupo_nome == grupo.nome,
        models.LogDisparo.tipo == "seguranca_adm"
    ).first()

    # Como o grupo está aberto, não deve gerar alerta
    assert log_alerta is None
