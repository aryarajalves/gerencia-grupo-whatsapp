import pytest
import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Importar app e models
# Precisamos adicionar o diretório pai ao path se não estiver
import sys
import os
os.environ["ALLOWED_HOSTS"] = "*" # Permitir qualquer host nos testes
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
from main import app
from database import Base, get_db

from sqlalchemy.pool import StaticPool

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fixture para criar as tabelas antes dos testes e destruir depois
@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

# Fixture para override da dependência get_db
@pytest.fixture(scope="function")
def db_session(setup_db):
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Fixture do cliente de teste
@pytest.fixture(scope="module")
def client(setup_db):
    # Override da dependência do banco
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    import security
    
    # Override da segurança
    def override_get_api_key():
        return "test-secret"

    def override_current_user():
        return {"sub": "test-id", "nome": "Test User", "cargo": "SUPER_ADMIN"}

    app.dependency_overrides[security.get_api_key] = override_get_api_key
    app.dependency_overrides[security.get_current_user] = override_current_user
    app.dependency_overrides[security.check_super_admin] = override_current_user
    
    # Desabilitar Scheduler para não rodar jobs em background
    import scheduler
    scheduler.iniciar_agendador = lambda: None
    
    with TestClient(app) as c:
        yield c
