import os
import time
from fastapi import Request
from fastapi.responses import JSONResponse
from core.logger import logger

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

# In-memory fallback dictionary if Redis is unavailable
_memory_store = {}

def get_redis_client():
    try:
        import redis
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        client.ping()
        return client
    except Exception:
        return None

redis_client = get_redis_client()

def check_rate_limit(client_ip: str, route_group: str, max_requests: int, window: int = 60) -> bool:
    """
    Retorna True se a requisição é PERMITIDA, ou False se EXCEDEU o limite.
    """
    key = f"rl:{client_ip}:{route_group}"
    
    if redis_client:
        try:
            current = redis_client.incr(key)
            if current == 1:
                redis_client.expire(key, window)
            return current <= max_requests
        except Exception as e:
            logger.error(f"Erro no Redis Rate Limiter: {e}")

    # Fallback em memória se Redis não responder
    now = time.time()
    if key not in _memory_store:
        _memory_store[key] = []
    
    # Mantém apenas timestamps dentro da janela atual
    _memory_store[key] = [t for t in _memory_store[key] if now - t < window]
    
    if len(_memory_store[key]) >= max_requests:
        return False
        
    _memory_store[key].append(now)
    return True

EXEMPT_PREFIXES = ("/webhook/", "/join/", "/info/", "/config/public", "/docs", "/openapi.json", "/redoc")
SENSITIVE_PREFIXES = ("/users/login", "/mensagens/enviar", "/mensagens/dispatch", "/backup/create", "/backup/upload", "/backup/restore")

async def rate_limit_middleware(request: Request, call_next):
    path = request.url.path
    
    # 1. Rotas 100% Liberadas (Exempt)
    if path == "/" or any(path.startswith(prefix) for prefix in EXEMPT_PREFIXES):
        return await call_next(request)
        
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # 2. Rotas Sensíveis (50 requisições/minuto)
    if any(path.startswith(prefix) for prefix in SENSITIVE_PREFIXES):
        max_requests = 50
        route_group = "sensitive"
    else:
        # 3. Rotas Padrão do Sistema (120 requisições/minuto)
        max_requests = 120
        route_group = "general"
        
    is_allowed = check_rate_limit(client_ip, route_group, max_requests, window=60)
    
    if not is_allowed:
        logger.warning(f"Rate limit excedido para IP {client_ip} em {path}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Limite de requisições excedido. Aguarde um momento e tente novamente."}
        )
        
    return await call_next(request)
