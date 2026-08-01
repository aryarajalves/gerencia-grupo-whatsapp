import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from scheduler import verificar_e_disparar_mensagens
from datetime import datetime, time
import pytz

# Setup de banco de dados em memória para teste
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    models.Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    models.Base.metadata.drop_all(bind=engine)

def test_scheduler_ignores_poll_on_lite_plan(db, monkeypatch):
    # 1. Configurar plano como LITE
    db.add(models.Configuracao(chave="WHATSAPP_PLAN_TYPE", valor="LITE"))
    db.add(models.Configuracao(chave="WAPI_INSTANCE_ID", valor="test_instance"))
    
    # 2. Criar um grupo ativo no dia 1
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste",
        id_do_grupo="12345@g.us",
        ativo=True,
        dia_lancamento_atual=1
    )
    db.add(grupo)
    db.flush()

    # 3. Criar uma mensagem de enquete para o dia 1
    # Usar o horário atual do fuso para bater com a janela
    br_tz = pytz.timezone('America/Sao_Paulo')
    agora = datetime.now(br_tz)
    
    msg = models.MensagemDisparada(
        mensagem="Título Enquete",
        dia_do_lancamento=1,
        horario_do_disparo=agora.time(),
        tipo_de_mensagem="enquete",
        opcoes_enquete="Op1\nOp2",
        ativo=True
    )
    db.add(msg)
    db.flush()

    # Associar mensagem ao grupo
    db.add(models.GrupoMensagem(grupo_id=grupo.id, mensagem_id=msg.id))
    db.commit()

    # Mock SessionLocal in scheduler.py
    import scheduler
    monkeypatch.setattr(scheduler, "SessionLocal", lambda: db)
    
    # Mock enviar_wapi to track calls
    calls = []
    def mock_enviar_wapi(g, m, d):
        calls.append((g, m))
    monkeypatch.setattr(scheduler, "enviar_wapi", mock_enviar_wapi)

    # 4. Executar verificação
    verificar_e_disparar_mensagens()

    # 5. Validar que NÃO houve disparo
    assert len(calls) == 0, "Deveria ter ignorado o disparo da enquete no plano LITE"
    
    # 6. Validar que um log de erro foi registrado
    log = db.query(models.LogDisparo).filter(models.LogDisparo.status == "Erro").first()
    assert log is not None
    assert "exclusivo do plano PRO" in log.detalhes_erro

def test_scheduler_sends_poll_on_pro_plan(db, monkeypatch):
    # 1. Configurar plano como PRO
    db.add(models.Configuracao(chave="WHATSAPP_PLAN_TYPE", valor="PRO"))
    db.add(models.Configuracao(chave="WAPI_INSTANCE_ID", valor="test_instance"))
    
    grupo = models.GrupoWhatsApp(
        nome="Grupo Teste PRO",
        id_do_grupo="54321@g.us",
        ativo=True,
        dia_lancamento_atual=1
    )
    db.add(grupo)
    db.flush()

    br_tz = pytz.timezone('America/Sao_Paulo')
    agora = datetime.now(br_tz)

    msg = models.MensagemDisparada(
        mensagem="Título Enquete PRO",
        dia_do_lancamento=1,
        horario_do_disparo=agora.time(),
        tipo_de_mensagem="enquete",
        opcoes_enquete="Sim\nNão",
        ativo=True
    )
    db.add(msg)
    db.flush()

    db.add(models.GrupoMensagem(grupo_id=grupo.id, mensagem_id=msg.id))
    db.commit()

    import scheduler
    monkeypatch.setattr(scheduler, "SessionLocal", lambda: db)
    
    calls = []
    def mock_enviar_wapi(g, m, d):
        calls.append((g, m))
    monkeypatch.setattr(scheduler, "enviar_wapi", mock_enviar_wapi)

    # 4. Executar verificação
    verificar_e_disparar_mensagens()

    # 5. Validar que HOUVE disparo
    assert len(calls) > 0, "Deveria ter disparado a enquete no plano PRO"
    assert calls[0][1].tipo_de_mensagem == "enquete"
