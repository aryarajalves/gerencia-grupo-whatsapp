import os
from sqlalchemy import create_engine

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Usando as credenciais de referência do usuário
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:35cb19b8-13cd-4f02-af3e-abdcdd373ae5@localhost:5432/n8n_queue")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
