import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Core imports
import models, database, scheduler, migrations, security
from core.logger import logger, setup_uvicorn_logging
from database import SessionLocal

# Router imports
from routers import users, groups, messages, logs, webhooks, dashboard, media, config, contacts, group_sets, redirect, capture, clients, backup

# Configuração Rate Limiting (Redis)
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
limiter = Limiter(key_func=get_remote_address, storage_uri=REDIS_URL)

app = FastAPI(title="Gerenciador de Grupos WhatsApp", version="1.5.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro inesperado em {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Tente novamente mais tarde."}
    )

# Middlewares
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5176").split(",")
allowed_origins = [o.strip() for o in raw_origins if o.strip() and o.strip() != "*"]

# Adiciona variações comuns de localhost para desenvolvimento
extra_origins = [
    "http://localhost:5173", "http://127.0.0.1:5173", 
    "http://localhost:5176", "http://127.0.0.1:5176", 
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:8000", "http://127.0.0.1:8000"
]
for origin in extra_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

allowed_hosts = os.getenv("ALLOWED_HOSTS", "*").split(",")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Cabeçalhos padrão
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # IMPORTANTE: Para permitir que o navegador renderize imagens via proxy
    if "/media-proxy" in request.url.path or "/media" in request.url.path:
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"
        response.headers["Access-Control-Allow-Origin"] = "*"
    
    try:
        del response.headers["X-Powered-By"]
    except KeyError: pass
    return response

# Startup Events
@app.on_event("startup")
def startup_event():
    setup_uvicorn_logging()
    api_secret = os.getenv("API_SECRET", "")
    if len(api_secret) < 32:
        raise RuntimeError("API_SECRET deve ter no mínimo 32 caracteres.")

    migrations.sync_database()

    admin_email = os.getenv("SUPER_ADMIN_EMAIL")
    admin_password = os.getenv("SUPER_ADMIN_PASSWORD")
    
    if admin_email and admin_password:
        db = SessionLocal()
        try:
            admin = db.query(models.Usuario).filter(models.Usuario.email == admin_email).first()
            hashed_pw = security.get_password_hash(admin_password)
            if not admin:
                novo_admin = models.Usuario(nome="Super Admin", email=admin_email, senha_hash=hashed_pw, cargo="SUPER_ADMIN", ativo=True)
                db.add(novo_admin)
            else:
                admin.senha_hash = hashed_pw
                admin.cargo = "SUPER_ADMIN"
                admin.ativo = True
            db.commit()
        except Exception as e:
            print(f"Erro ao criar super admin: {e}")
            db.rollback()
        finally:
            db.close()

    disable_scheduler = os.getenv("DISABLE_SCHEDULER", "false").lower() in ("true", "1", "yes")
    if not disable_scheduler:
        app.state.scheduler = scheduler.iniciar_agendador()
        logger.info("Agendador embutido iniciado na API Backend.")
    else:
        logger.info("Agendador embutido desativado na API Backend (Worker dedicado em execução).")

# Home / Health Check
@app.get("/")
@limiter.limit("5/minute")
def home(request: Request):
    return {"message": "API Gerenciador de Grupos WhatsApp Ativa"}

# Register Routers
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(messages.router)
app.include_router(logs.router)
app.include_router(webhooks.router)
app.include_router(dashboard.router)
app.include_router(media.router)
app.include_router(config.router)
app.include_router(contacts.router)
app.include_router(group_sets.router)
app.include_router(redirect.router)
app.include_router(capture.router)
app.include_router(clients.router)
app.include_router(backup.router, prefix="/backup", tags=["backup"])
