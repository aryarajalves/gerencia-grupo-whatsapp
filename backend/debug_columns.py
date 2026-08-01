from database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    result = db.execute(text("SELECT * FROM mensagens_capturadas LIMIT 1"))
    print("Colunas:", result.keys())
except Exception as e:
    print("Erro:", e)
finally:
    db.close()
