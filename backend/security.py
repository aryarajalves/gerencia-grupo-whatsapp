from fastapi import Security, HTTPException, status, Depends
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import uuid

# Configurações de Senha
# Monkeypatch para corrigir bug do bcrypt com passlib
import bcrypt
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type('about', (object,), {'__version__': getattr(bcrypt, '__version__', '4.0.1')})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configurações de JWT
# Em produção, essa chave DEVE vir da variável de ambiente JWT_SECRET no .env
SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("API_SECRET") or "super-secret-jwt-key-desenvolvimento-zapgroup-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 60 * 24)) # 24 horas padrão

API_KEY_HEADER = APIKeyHeader(name="x-api-key", auto_error=False)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

def verify_password(plain_password, hashed_password):
    if not hashed_password: return False
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_api_key(
    api_key_header: str = Security(API_KEY_HEADER),
    token: str = Depends(oauth2_scheme)
):
    """
    Valida a API Key para integrações (ex: n8n) OU um JWT válido para o frontend.
    """
    api_secret = os.getenv("API_SECRET") or os.getenv("JWT_SECRET")

    # 1. Valida API Key no header x-api-key
    if api_key_header and api_secret and api_key_header == api_secret:
        return {"sub": "api_key_system", "cargo": "SUPER_ADMIN"}

    # 2. Valida JWT Bearer token enviado no header Authorization: Bearer <token>
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("sub"):
                return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token JWT inválido ou expirado. Faça login novamente.",
                headers={"WWW-Authenticate": "Bearer"}
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Acesso negado. Token JWT ou API Key ausente.",
        headers={"WWW-Authenticate": "Bearer"}
    )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency para validar o JWT e retornar os dados do usuário.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão expirada ou inválida. Por favor, faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload # Retorna o dicionário com id, nome, cargo
    except JWTError:
        raise credentials_exception

def check_super_admin(user = Depends(get_current_user)):
    """
    Garante que o usuário atual é um SUPER_ADMIN.
    """
    cargo = str(user.get("cargo")).upper()
    print(f"--- DEBUG PERMISSÃO --- Usuário: {user.get('sub')} | Cargo no Token: {cargo}")
    if cargo != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito apenas para Super Administradores"
        )
    return user
