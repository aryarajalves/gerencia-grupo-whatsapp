import models, database, security
import os

db = database.SessionLocal()
email = "aryarajmarketing@gmail.com"
password = "123456"

user = db.query(models.Usuario).filter_by(email=email).first()
if not user:
    print(f"Usuário {email} não encontrado!")
else:
    print(f"Usuário encontrado: {user.email}")
    print(f"Hash no banco: {user.senha_hash}")
    
    # Testar verificação
    is_valid = security.verify_password(password, user.senha_hash)
    print(f"Verificação de '{password}': {is_valid}")
    
    # Gerar novo hash e testar
    new_hash = security.get_password_hash(password)
    print(f"Novo hash gerado: {new_hash}")
    is_valid_new = security.verify_password(password, new_hash)
    print(f"Verificação do novo hash: {is_valid_new}")

db.close()
