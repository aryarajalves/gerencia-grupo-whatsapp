from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import uuid
import os
import secrets
from datetime import timedelta

import models, schemas, security
from database import get_db
from core.logger import logger

router = APIRouter(tags=["Usuários"])

@router.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Autenticação via Banco de Dados
    db_user = db.query(models.Usuario).filter(models.Usuario.email == login_data.email, models.Usuario.ativo == True).first()
    
    if not db_user:
        logger.warning(f"Login falhou: Usuário '{login_data.email}' não encontrado ou inativo.")
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    is_valid = security.verify_password(login_data.password, db_user.senha_hash)

    if not is_valid:
        logger.warning(f"Login falhou: Senha incorreta para '{login_data.email}'.")
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    # Atualização transparente de hashes antigos para Argon2id
    if security.needs_rehash(db_user.senha_hash):
        try:
            db_user.senha_hash = security.get_password_hash(login_data.password)
            db.commit()
            logger.info(f"Senha do usuário '{login_data.email}' atualizada com sucesso para hash Argon2id.")
        except Exception as e:
            logger.error(f"Falha ao auto-atualizar hash para Argon2id no login: {e}")

    user_data = {"id": str(db_user.id), "nome": db_user.nome, "cargo": db_user.cargo}
    access_token = security.create_access_token(
        data={"sub": user_data["id"], "nome": user_data["nome"], "cargo": user_data["cargo"]},
        expires_delta=timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@router.get("/usuarios/", response_model=list[schemas.Usuario], dependencies=[Depends(security.check_super_admin)])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).order_by(models.Usuario.nome).all()

# --- ENDPOINTS DE CONVITE E REGISTRO ---

@router.post("/convite", response_model=schemas.Invitation, dependencies=[Depends(security.check_super_admin)])
def criar_convite(invite: schemas.InvitationCreate, request: Request, db: Session = Depends(get_db)):
    token = secrets.token_urlsafe(32)
    expira_em = None
    if invite.expira_horas:
        expira_em = models.get_br_time() + timedelta(hours=invite.expira_horas)
    
    db_invite = models.Invitation(
        token=token,
        cargo=invite.cargo,
        tipo=invite.tipo,
        usuario_id=invite.usuario_id,
        expira_em=expira_em
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    
    # URL do Frontend: Prioridade: FRONTEND_URL -> Header Origin/Referer -> Primeira origem de ALLOWED_ORIGINS -> localhost
    frontend_url = os.getenv("FRONTEND_URL")
    if not frontend_url:
        origin = request.headers.get("origin") or request.headers.get("referer")
        if origin:
            frontend_url = origin.rstrip("/")
        else:
            raw_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
            valid_origins = [o.strip().rstrip("/") for o in raw_origins if o.strip() and o.strip() != "*"]
            frontend_url = valid_origins[0] if valid_origins else "http://localhost:5173"
    
    if db_invite.tipo == "reset":
        link = f"{frontend_url}/setup/{token}"
    else:
        link = f"{frontend_url}/registrar/{token}"
        
    # Converter para schema e adicionar o link
    response_data = schemas.Invitation.model_validate(db_invite)
    response_data.link = link
    return response_data

@router.get("/convites", response_model=list[schemas.Invitation], dependencies=[Depends(security.check_super_admin)])
def listar_convites(request: Request, db: Session = Depends(get_db)):
    convites = db.query(models.Invitation).order_by(models.Invitation.criado_em.desc()).all()
    
    frontend_url = os.getenv("FRONTEND_URL")
    if not frontend_url:
        origin = request.headers.get("origin") or request.headers.get("referer")
        if origin:
            frontend_url = origin.rstrip("/")
        else:
            raw_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
            valid_origins = [o.strip().rstrip("/") for o in raw_origins if o.strip() and o.strip() != "*"]
            frontend_url = valid_origins[0] if valid_origins else "http://localhost:5173"

    res = []
    for c in convites:
        link = f"{frontend_url}/setup/{c.token}" if c.tipo == "reset" else f"{frontend_url}/registrar/{c.token}"
        data = schemas.Invitation.model_validate(c)
        data.link = link
        res.append(data)
    return res

@router.delete("/convites/{convite_id}", dependencies=[Depends(security.check_super_admin)])
def deletar_convite(convite_id: uuid.UUID, db: Session = Depends(get_db)):
    c = db.query(models.Invitation).filter(models.Invitation.id == convite_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Convite não encontrado")
    db.delete(c)
    db.commit()
    return {"message": "Convite removido com sucesso"}

@router.get("/convite/{token}", response_model=schemas.Invitation)
def validar_convite(token: str, db: Session = Depends(get_db)):
    db_invite = db.query(models.Invitation).filter(models.Invitation.token == token, models.Invitation.usado == False).first()
    
    if not db_invite:
        raise HTTPException(status_code=404, detail="Convite inválido ou já utilizado")
    
    if db_invite.expira_em and db_invite.expira_em < models.get_br_time():
        raise HTTPException(status_code=400, detail="Este convite expirou")

    # Adicionar o link (mesmo que não seja usado pelo front no GET, mantemos consistência)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    link = f"{frontend_url}/registrar/{token}" if db_invite.tipo == "convite" else f"{frontend_url}/setup/{token}"
    
    response_data = schemas.Invitation.model_validate(db_invite)
    response_data.link = link

    # Se for tipo reset, incluir dados do usuário
    if db_invite.tipo == "reset" and db_invite.usuario_id:
        user = db.query(models.Usuario).filter(models.Usuario.id == db_invite.usuario_id).first()
        if user:
            # Poderíamos retornar mais dados aqui se o schema permitisse, 
            # mas o front só precisa saber que é válido por enquanto.
            pass

    return response_data

from services.email_service import enviar_email_codigo_verificacao

@router.post("/registrar/solicitar-codigo", response_model=schemas.UserRegisterResponse)
def solicitar_codigo_registro(data: schemas.UserRegisterRequestCode, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem.")
        
    db_invite = db.query(models.Invitation).filter(
        models.Invitation.token == data.token,
        models.Invitation.usado == False
    ).first()
    
    if not db_invite or db_invite.tipo != "convite":
        raise HTTPException(status_code=400, detail="Token de convite inválido ou expirado.")
    
    if db_invite.expira_em and db_invite.expira_em < models.get_br_time():
        raise HTTPException(status_code=400, detail="Este convite expirou.")

    if db.query(models.Usuario).filter(models.Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")

    # Gera código aleatório de 6 dígitos
    codigo = f"{secrets.randbelow(1000000):06d}"
    expira_em = models.get_br_time() + timedelta(minutes=15)
    senha_hash = security.get_password_hash(data.password)

    # Invalida tentativas anteriores não confirmadas para o mesmo e-mail ou convite
    db.query(models.EmailVerification).filter(
        (models.EmailVerification.email == data.email) | (models.EmailVerification.token_convite == data.token),
        models.EmailVerification.usado == False
    ).update({"usado": True})

    # Registra nova verificação pendente
    nova_verificacao = models.EmailVerification(
        email=data.email,
        codigo=codigo,
        nome=data.nome,
        senha_hash=senha_hash,
        cargo=db_invite.cargo,
        token_convite=data.token,
        expira_em=expira_em,
        usado=False
    )
    db.add(nova_verificacao)
    db.commit()

    # Envia e-mail via Brevo
    sucesso_envio = enviar_email_codigo_verificacao(
        destinatario_email=data.email,
        destinatario_nome=data.nome,
        codigo=codigo,
        tempo_expiracao_minutos=15
    )

    if not sucesso_envio:
        logger.warning(f"Falha ao enviar e-mail via Brevo para {data.email}, mas código foi persistido.")

    # Mascara e-mail para exibição segura no frontend
    partes = data.email.split("@")
    usuario_str, dominio_str = partes[0], partes[1] if len(partes) > 1 else ""
    if len(usuario_str) > 2:
        mascarado = f"{usuario_str[:2]}***@{dominio_str}"
    else:
        mascarado = f"{usuario_str[0]}***@{dominio_str}"

    return {
        "message": "Código de confirmação enviado com sucesso para o seu e-mail.",
        "email_masked": mascarado
    }

@router.post("/registrar/confirmar-codigo")
def confirmar_codigo_registro(data: schemas.UserRegisterConfirmCode, db: Session = Depends(get_db)):
    db_invite = db.query(models.Invitation).filter(
        models.Invitation.token == data.token,
        models.Invitation.usado == False
    ).first()
    
    if not db_invite or db_invite.tipo != "convite":
        raise HTTPException(status_code=400, detail="Token de convite inválido ou expirado.")

    verificacao = db.query(models.EmailVerification).filter(
        models.EmailVerification.token_convite == data.token,
        models.EmailVerification.email == data.email,
        models.EmailVerification.codigo == data.codigo.strip(),
        models.EmailVerification.usado == False
    ).order_by(models.EmailVerification.criado_em.desc()).first()

    if not verificacao:
        raise HTTPException(status_code=400, detail="Código de verificação incorreto ou inválido.")

    if verificacao.expira_em and verificacao.expira_em < models.get_br_time():
        raise HTTPException(status_code=400, detail="O código de confirmação expirou. Solicite um novo código.")

    if db.query(models.Usuario).filter(models.Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")

    # Cria o usuário efetivo com o hash Argon2id já calculado
    novo_usuario = models.Usuario(
        nome=verificacao.nome,
        email=verificacao.email,
        cargo=verificacao.cargo,
        senha_hash=verificacao.senha_hash,
        ativo=True
    )
    
    db.add(novo_usuario)
    verificacao.usado = True
    db_invite.usado = True
    db.commit()
    
    logger.info(f"Usuário verificado e registrado com sucesso: {verificacao.email} (Cargo: {verificacao.cargo})")
    return {"message": "Conta ativada com sucesso! Redirecionando para o login..."}

@router.post("/registrar")
def registrar_usuario(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")
        
    db_invite = db.query(models.Invitation).filter(models.Invitation.token == data.token, models.Invitation.usado == False).first()
    
    if not db_invite or db_invite.tipo != "convite":
        raise HTTPException(status_code=400, detail="Token de convite inválido")
    
    if db_invite.expira_em and db_invite.expira_em < models.get_br_time():
        raise HTTPException(status_code=400, detail="Este convite expirou")

    if db.query(models.Usuario).filter(models.Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado")

    novo_usuario = models.Usuario(
        nome=data.nome,
        email=data.email,
        cargo=db_invite.cargo,
        senha_hash=security.get_password_hash(data.password),
        ativo=True
    )
    
    db.add(novo_usuario)
    db_invite.usado = True
    db.commit()
    
    logger.info(f"Usuário registrado com sucesso: {data.email} (Cargo: {db_invite.cargo})")
    return {"message": "Usuário criado com sucesso"}

@router.post("/resetar-senha")
def resetar_senha(data: schemas.PasswordReset, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")
        
    db_invite = db.query(models.Invitation).filter(models.Invitation.token == data.token, models.Invitation.usado == False).first()
    
    if not db_invite or db_invite.tipo != "reset" or not db_invite.usuario_id:
        raise HTTPException(status_code=400, detail="Token de recuperação inválido")
    
    if db_invite.expira_em and db_invite.expira_em < models.get_br_time():
        raise HTTPException(status_code=400, detail="Este token expirou")

    user = db.query(models.Usuario).filter(models.Usuario.id == db_invite.usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user.senha_hash = security.get_password_hash(data.password)
    db_invite.usado = True
    db.commit()
    
    logger.info(f"Senha alterada com sucesso para: {user.email}")
    return {"message": "Senha alterada com sucesso"}

@router.delete("/usuarios/{usuario_id}")
def deletar_usuario(usuario_id: uuid.UUID, db: Session = Depends(get_db), current_user = Depends(security.check_super_admin)):
    if str(usuario_id) == current_user.get("sub"):
        raise HTTPException(status_code=400, detail="Você não pode deletar sua própria conta.")
    db_user = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    super_admin_email = os.getenv("SUPER_ADMIN_EMAIL", "")
    if db_user.email == super_admin_email:
        raise HTTPException(status_code=400, detail="O Super Admin principal não pode ser deletado.")

    db.delete(db_user)
    db.commit()
    return {"message": "Usuário removido"}

@router.patch("/usuarios/{usuario_id}/toggle", dependencies=[Depends(security.check_super_admin)])
def toggle_usuario(usuario_id: uuid.UUID, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db_user.ativo = not db_user.ativo
    db.commit()
    return {"ativo": db_user.ativo}

@router.put("/usuarios/{usuario_id}", response_model=schemas.Usuario, dependencies=[Depends(security.check_super_admin)])
def editar_usuario(usuario_id: uuid.UUID, data: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    super_admin_email = os.getenv("SUPER_ADMIN_EMAIL", "")
    if db_user.email == super_admin_email or db_user.cargo == "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="O Super Administrador do sistema não pode ser editado.")

    if data.email and data.email.strip().lower() != db_user.email.lower():
        email_novo = data.email.strip().lower()
        existente = db.query(models.Usuario).filter(
            models.Usuario.email == email_novo,
            models.Usuario.id != usuario_id
        ).first()
        if existente:
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outro usuário.")
        db_user.email = email_novo

    if data.nome is not None and len(data.nome.strip()) > 0:
        db_user.nome = data.nome.strip()

    if data.cargo is not None:
        db_user.cargo = data.cargo

    if data.ativo is not None:
        db_user.ativo = data.ativo

    if data.password and len(data.password.strip()) > 0:
        db_user.senha_hash = security.get_password_hash(data.password.strip())

    db.commit()
    db.refresh(db_user)
    logger.info(f"Usuário {db_user.email} editado com sucesso.")
    return db_user


