import pytest
from datetime import datetime, timedelta
from jose import jwt
import security

def test_login_returns_long_lived_token(client, db_session):
    """
    Verifica se o login retorna um token válido e se a expiração está correta (24h).
    """
    from models import Usuario
    import security
    
    # Criar um usuário de teste no banco
    email = "auth_test@exemplo.com"
    password = "password123"
    hashed_pw = security.get_password_hash(password)
    
    user = Usuario(
        nome="Auth Test User",
        email=email,
        senha_hash=hashed_pw,
        cargo="SUPER_ADMIN",
        ativo=True
    )
    db_session.add(user)
    db_session.commit()
    
    # Tentar logar
    login_data = {"email": email, "password": password}
    response = client.post("/login", json=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    token = data["access_token"]
    
    # Decodificar o token para verificar o campo 'exp'
    payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
    exp_timestamp = payload["exp"]
    from datetime import timezone
    exp_date = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    now = datetime.now(timezone.utc)
    
    diff = exp_date - now
    # Deve ser em torno de 1440 minutos (24h)
    assert 1430 < (diff.total_seconds() / 60) < 1450
