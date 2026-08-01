from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import uuid
import os
import secrets
from datetime import timedelta, datetime

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
def criar_convite(invite: schemas.InvitationCreate, db: Session = Depends(get_db)):
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
    
    # URL do Frontend (usar variável de ambiente se disponível)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    if db_invite.tipo == "reset":
        link = f"{frontend_url}/setup/{token}"
    else:
        link = f"{frontend_url}/registrar/{token}"
        
    # Converter para schema e adicionar o link
    response_data = schemas.Invitation.model_validate(db_invite)
    response_data.link = link
    return response_data

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

