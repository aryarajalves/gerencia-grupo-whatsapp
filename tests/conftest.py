import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import Base
from main import app
from routers.auth import get_current_user

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def override_get_current_user():
    return models.User(id=1, email="test@example.com", name="Test User", is_admin=True, client_id=None)

app.dependency_overrides[models.get_db if hasattr(models, 'get_db') else main.get_db if hasattr(main, 'get_db') else None] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    from database import get_db
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
