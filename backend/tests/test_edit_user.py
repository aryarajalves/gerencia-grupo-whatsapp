import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
import security
from database import Base, get_db
from main import app

# Setup SQLite in-memory para testes
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


def override_check_super_admin():
    return {"sub": "super-admin-id", "cargo": "SUPER_ADMIN", "nome": "Super Admin"}


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[security.check_super_admin] = override_check_super_admin
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


client = TestClient(app)


def test_edit_regular_user_success():
    """Valida a edição bem-sucedida de um usuário comum (Nome, E-mail, Cargo)."""
    db = TestingSessionLocal()

    user = models.Usuario(
        nome="Hokage Antigo",
        email="hokage@empresa.com",
        cargo="ADMIN",
        senha_hash=security.get_password_hash("SenhaAntiga@123"),
        ativo=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_id = str(user.id)

    # Edição de dados
    res = client.put(f"/usuarios/{user_id}", json={
        "nome": "Hokage Novo",
        "email": "hokage.novo@empresa.com",
        "cargo": "ADMIN",
        "password": "NovaSenhaForte@2026!"
    })

    assert res.status_code == 200
    data = res.json()
    assert data["nome"] == "Hokage Novo"
    assert data["email"] == "hokage.novo@empresa.com"

    # Valida no banco
    db.refresh(user)
    assert user.nome == "Hokage Novo"
    assert user.email == "hokage.novo@empresa.com"
    assert security.verify_password("NovaSenhaForte@2026!", user.senha_hash) is True
    db.close()


def test_cannot_edit_super_admin():
    """Valida que o Super Admin não pode ser editado pelo endpoint."""
    db = TestingSessionLocal()

    super_admin = models.Usuario(
        nome="Super Administrador",
        email="aryarajmarketing@gmail.com",
        cargo="SUPER_ADMIN",
        senha_hash=security.get_password_hash("SuperSenha@123"),
        ativo=True
    )
    db.add(super_admin)
    db.commit()
    db.refresh(super_admin)

    res = client.put(f"/usuarios/{super_admin.id}", json={
        "nome": "Tentativa de Mudanca",
        "email": "hacked@empresa.com"
    })

    assert res.status_code == 400
    assert "Super Administrador" in res.json()["detail"]
    db.close()


def test_edit_user_duplicate_email_conflict():
    """Valida rejeição ao tentar alterar o e-mail para um já existente."""
    db = TestingSessionLocal()

    user1 = models.Usuario(nome="User Um", email="user1@empresa.com", cargo="ADMIN", senha_hash="hash")
    user2 = models.Usuario(nome="User Dois", email="user2@empresa.com", cargo="ADMIN", senha_hash="hash")
    db.add_all([user1, user2])
    db.commit()

    res = client.put(f"/usuarios/{user2.id}", json={
        "email": "user1@empresa.com"
    })

    assert res.status_code == 400
    assert "já está em uso" in res.json()["detail"]
    db.close()
