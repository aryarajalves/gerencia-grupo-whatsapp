import uuid
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import respx
import httpx

import models
from database import Base, get_db
from main import app
import security
from services.ai_service import parse_roteiro_com_ia

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[security.get_api_key] = lambda: "test-api-key"
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_parse_roteiro_sem_api_key(monkeypatch):
    """Deve lançar ValueError amigável quando a OPENAI_API_KEY não estiver configurada."""
    monkeypatch.setenv("OPENAI_API_KEY", "")
    with pytest.raises(ValueError, match="OPENAI_API_KEY não configurada"):
        parse_roteiro_com_ia("Dia 1 10:00 Bom dia!")


@respx.mock
def test_parse_roteiro_mock_openai(monkeypatch):
    """Deve enviar prompt para a OpenAI e retornar mensagens estruturadas com diferentes tipos."""
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test-fake-key-12345")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4o-mini")

    mock_llm_response = {
        "choices": [
            {
                "message": {
                    "content": """{
                        "mensagens": [
                            {
                                "dia_do_lancamento": 1,
                                "horario_do_disparo": "09:00",
                                "tipo_de_mensagem": "texto",
                                "mensagem": "Bom dia a todos!",
                                "link_midia": "",
                                "opcoes_enquete": [],
                                "etiqueta": "boas-vindas"
                            },
                            {
                                "dia_do_lancamento": 1,
                                "horario_do_disparo": "14:00",
                                "tipo_de_mensagem": "imagem",
                                "mensagem": "Olhem essa imagem incrível",
                                "link_midia": "https://meusite.com/banner.png",
                                "opcoes_enquete": [],
                                "etiqueta": "aviso"
                            },
                            {
                                "dia_do_lancamento": 2,
                                "horario_do_disparo": "18:00",
                                "tipo_de_mensagem": "enquete",
                                "mensagem": "Qual seu horário preferido?",
                                "link_midia": "",
                                "opcoes_enquete": ["Manhã", "Tarde", "Noite"],
                                "enquete_multipla": false,
                                "etiqueta": "pesquisa"
                            }
                        ]
                    }"""
                }
            }
        ]
    }

    respx.post("https://api.openai.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json=mock_llm_response)
    )

    texto_bruto = "Dia 1 às 9h: Bom dia a todos! Às 14h: Foto do banner https://meusite.com/banner.png. Dia 2 18h: Enquete Qual seu horário preferido? Opções: Manhã, Tarde, Noite."
    resultado = parse_roteiro_com_ia(texto_bruto)

    assert len(resultado) == 3
    assert resultado[0]["tipo_de_mensagem"] == "texto"
    assert resultado[0]["dia_do_lancamento"] == 1
    assert resultado[0]["horario_do_disparo"] == "09:00"

    assert resultado[1]["tipo_de_mensagem"] == "imagem"
    assert resultado[1]["link_midia"] == "https://meusite.com/banner.png"

    assert resultado[2]["tipo_de_mensagem"] == "enquete"
    assert resultado[2]["dia_do_lancamento"] == 2
    assert resultado[2]["opcoes_enquete"] == ["Manhã", "Tarde", "Noite"]


def test_endpoint_parse_roteiro_ia():
    """Testa a rota POST /mensagens/parse-roteiro-ia com mock do serviço de IA."""
    mock_retorno = [
        {
            "numero_da_mensagem": 1,
            "dia_do_lancamento": 1,
            "horario_do_disparo": "10:30",
            "tipo_de_mensagem": "texto",
            "mensagem": "Texto mockado",
            "link_midia": "",
            "opcoes_enquete": [],
            "enquete_multipla": False,
            "etiqueta": "teste"
        }
    ]

    with patch("routers.messages.parse_roteiro_com_ia", return_value=mock_retorno):
        res = client.post("/mensagens/parse-roteiro-ia", json={"texto": "Texto do roteiro"})
        assert res.status_code == 200
        dados = res.json()
        assert dados["total"] == 1
        assert dados["mensagens"][0]["mensagem"] == "Texto mockado"


def test_import_mensagens_com_associacao_grupos():
    """Testa se a rota /mensagens/import persiste as associações em grupo_mensagens."""
    db = TestingSessionLocal()
    grupo1 = models.GrupoWhatsApp(
        id=uuid.uuid4(),
        nome="Grupo Teste 1",
        id_do_grupo="12345@g.us",
        numero_do_disparo="5511999999999",
        ativo=True
    )
    db.add(grupo1)
    db.commit()

    payload = {
        "grupo_ids": [str(grupo1.id)],
        "items": [
            {
                "mensagem": "Mensagem de teste importada com grupo",
                "numero_da_mensagem": 1,
                "dia_do_lancamento": 1,
                "horario_do_disparo": "15:00:00",
                "tipo_de_mensagem": "texto",
                "etiqueta": "teste_grupo"
            }
        ]
    }

    res = client.post("/mensagens/import", json=payload)
    assert res.status_code == 200
    assert res.json()["imported_count"] == 1

    # Verifica persistência no banco
    msg = db.query(models.MensagemDisparada).filter(
        models.MensagemDisparada.etiqueta == "teste_grupo"
    ).first()
    assert msg is not None
    assert msg.mensagem == "Mensagem de teste importada com grupo"

    # Verifica associação na tabela grupo_mensagens
    vinculo = db.query(models.GrupoMensagem).filter(
        models.GrupoMensagem.grupo_id == grupo1.id,
        models.GrupoMensagem.mensagem_id == msg.id
    ).first()
    assert vinculo is not None
