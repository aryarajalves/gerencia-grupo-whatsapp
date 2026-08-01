import sys
import os
from datetime import timedelta

# Adiciona o diretório pai ao path para importar os módulos do backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import SessionLocal
import models

def fix_timezone():
    db = SessionLocal()
    try:
        contatos = db.query(models.ContatoGrupo).all()
        print(f"Corrigindo timezone de {len(contatos)} contatos...")
        
        for c in contatos:
            # Se o horário for maior que o atual (UTC vs BRT), subtrai 3 horas
            # Como o banco armazena naive datetime, vamos apenas subtrair 3 horas
            # para os que foram criados antes desta correção.
            # Verificamos se o horário parece ser UTC (ex: > 14:00 quando agora é 12:00)
            if c.extraido_em.hour >= 3:
                c.extraido_em = c.extraido_em - timedelta(hours=3)
        
        db.commit()
        print("Timezone corrigido com sucesso!")
        
        # Também corrige Mensagens Capturadas se houver
        capturas = db.query(models.MensagemCapturada).all()
        print(f"Corrigindo timezone de {len(capturas)} capturas...")
        for m in capturas:
            if m.timestamp.hour >= 3:
                m.timestamp = m.timestamp - timedelta(hours=3)
        db.commit()
        print("Capturas corrigidas!")

    except Exception as e:
        print(f"Erro ao corrigir timezone: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_timezone()
