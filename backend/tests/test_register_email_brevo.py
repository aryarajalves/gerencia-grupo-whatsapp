import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
import schemas
import security
from database import Base, get_db
from main import app
from services.email_service import enviar_email_codigo_verificacao

# Setup SQLite in-memory para testes isolados
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
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
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_password_strength_validation_schema():
    """Valida rejeição e aceitação de senhas conforme a política de 12+ caracteres."""
    # Menos de 12 caracteres -> Deve falhar
    with pytest.raises(ValueError, match="no mínimo 12 caracteres"):
        schemas.validate_strong_password("Curta1@")

    # Sem números -> Deve falhar
    with pytest.raises(ValueError, match="pelo menos 1 número"):
        schemas.validate_strong_password("SenhaSemNumero!")

    # Sem letras -> Deve falhar
    with pytest.raises(ValueError, match="pelo menos 1 letra"):
        schemas.validate_strong_password("123456789012!@#")

    # Sem caracteres especiais -> Deve falhar
    with pytest.raises(ValueError, match="pelo menos 1 caractere especial"):
        schemas.validate_strong_password("SenhaForte123456")

    # Senha válida (12+ caracteres, com maiúscula/minúscula, número e símbolo) -> Deve passar
    valid_pass = "Senha@Forte2026!#"
    assert schemas.validate_strong_password(valid_pass) == valid_pass


def test_email_service_fallback_simulation():
    """Valida que o serviço de e-mail funciona em modo simulação sem API Key."""
    sucesso = enviar_email_codigo_verificacao(
        destinatario_email="teste@empresa.com",
        destinatario_nome="Usuário Teste",
        codigo="123456",
        tempo_expiracao_minutos=15
    )
    assert sucesso is True


def test_full_registration_flow_with_email_code():
    """Testa o fluxo completo: Criar convite -> Solicitar código -> Validar código -> Criar usuário Argon2id."""
    db = TestingSessionLocal()

    # 1. Cria um convite válido
    invite = models.Invitation(
        token="token-teste-convite-123",
        cargo="ADMIN",
        tipo="convite",
        usado=False
    )
    db.add(invite)
    db.commit()

    # 2. Solicita código com senha forte
    res_solicitar = client.post("/registrar/solicitar-codigo", json={
        "token": "token-teste-convite-123",
        "nome": "Carlos Silva",
        "email": "carlos@empresa.com",
        "password": "MinhaSenha@2026!",
        "confirm_password": "MinhaSenha@2026!"
    })

    assert res_solicitar.status_code == 200
    data_solicitacao = res_solicitar.json()
    assert "Código de confirmação enviado" in data_solicitacao["message"]
    assert "carlos@empresa.com" in data_solicitacao["email_masked"] or "ca***@empresa.com" in data_solicitacao["email_masked"]

    # 3. Busca o código gerado no banco de testes
    verificacao = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == "carlos@empresa.com"
    ).first()
    assert verificacao is not None
    assert len(verificacao.codigo) == 6
    codigo_gerado = verificacao.codigo

    # 4. Tenta confirmar com código errado -> Deve falhar com 400
    res_errado = client.post("/registrar/confirmar-codigo", json={
        "token": "token-teste-convite-123",
        "email": "carlos@empresa.com",
        "codigo": "999999"
    })
    assert res_errado.status_code == 400
    assert "Código de verificação incorreto" in res_errado.json()["detail"]

    # 5. Confirma com o código correto
    res_confirmar = client.post("/registrar/confirmar-codigo", json={
        "token": "token-teste-convite-123",
        "email": "carlos@empresa.com",
        "codigo": codigo_gerado
    })
    assert res_confirmar.status_code == 200
    assert "Conta ativada com sucesso" in res_confirmar.json()["message"]

    # 6. Valida que o usuário foi criado com hash Argon2id e convite foi consumido
    usuario_criado = db.query(models.Usuario).filter(models.Usuario.email == "carlos@empresa.com").first()
    assert usuario_criado is not None
    assert usuario_criado.nome == "Carlos Silva"
    assert usuario_criado.cargo == "ADMIN"
    assert usuario_criado.senha_hash.startswith("$argon2id$")
    assert security.verify_password("MinhaSenha@2026!", usuario_criado.senha_hash) is True

    # Valida que o convite foi marcado como usado
    db.refresh(invite)
    assert invite.usado is True
    db.close()
