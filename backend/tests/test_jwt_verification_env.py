import pytest
import os
from jose import jwt
import security

def test_jwt_creation_and_verification_with_env_secret(monkeypatch):
    """
    Testa se o token JWT é gerado e validado corretamente usando o JWT_SECRET das variáveis de ambiente.
    """
    test_secret = "secret_jwt_teste_super_seguro_2026"
    monkeypatch.setenv("JWT_SECRET", test_secret)
    
    # Recarrega a SECRET_KEY de security
    security.SECRET_KEY = test_secret
    security.ACCESS_TOKEN_EXPIRE_MINUTES = 60

    # 1. Cria um token de teste
    user_payload = {"sub": "user-uuid-12345", "nome": "Test Admin", "cargo": "SUPER_ADMIN"}
    token = security.create_access_token(data=user_payload)
    assert token is not None

    # 2. Decodifica e valida com o segredo correto
    decoded = jwt.decode(token, test_secret, algorithms=[security.ALGORITHM])
    assert decoded["sub"] == "user-uuid-12345"
    assert decoded["nome"] == "Test Admin"
    assert decoded["cargo"] == "SUPER_ADMIN"
    assert "exp" in decoded

def test_get_api_key_validates_bearer_token(monkeypatch):
    """
    Testa a função get_api_key validando token JWT válido e rejeitando token inválido/ausente.
    """
    test_secret = "segredo_jwt_teste_98765"
    security.SECRET_KEY = test_secret

    token = security.create_access_token(data={"sub": "usuario-autenticado", "cargo": "SUPER_ADMIN"})
    
    # 1. Token JWT válido
    result = security.get_api_key(api_key_header=None, token=token)
    assert result["sub"] == "usuario-autenticado"

    # 2. Token JWT inválido -> dispara HTTPException(401)
    with pytest.raises(Exception) as exc_info:
        security.get_api_key(api_key_header=None, token="token_invalido_123")
    assert "401" in str(exc_info.value) or "Token JWT inválido" in str(exc_info.value)
