import models, database
from sqlalchemy.orm import Session

def check_media():
    db = database.SessionLocal()
    try:
        # Busca a última mensagem com mídia
        msg = db.query(models.MensagemCapturada).filter(models.MensagemCapturada.media_url != None).order_by(models.MensagemCapturada.timestamp.desc()).first()
        if msg:
            print(f"ID: {msg.id}")
            print(f"Content: {msg.message_content}")
            print(f"Media URL: {msg.media_url}")
            print(f"Media Type: {msg.media_type}")
            print(f"Timestamp: {msg.timestamp}")
        else:
            print("Nenhuma mensagem com mídia encontrada.")
    finally:
        db.close()

if __name__ == "__main__":
    check_media()
