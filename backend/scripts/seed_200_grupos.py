"""
Script de Seed: Cadastra 200 grupos de exemplo para o cliente ativo para testes de visualização, layout e paginação.
Nenhum grupo criado terá mensagens ativadas/vinculadas.

Execute com: python backend/scripts/seed_200_grupos.py
"""
import os
import sys
import uuid
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
import database
import client_context

def seed():
    db = database.SessionLocal()
    try:
        cid = client_context.get_active_client_id(db)
        print(f"[SEED] Cliente ativo obtido: {cid}")

        # Limpa grupos de seed anteriores com o mesmo prefixo se existirem
        existentes_seed = db.query(models.GrupoWhatsApp).filter(
            models.GrupoWhatsApp.cliente_id == cid,
            models.GrupoWhatsApp.nome.like("Grupo Lançamento VIP %")
        ).all()

        if existentes_seed:
            for g in existentes_seed:
                # Remove vinculações de mensagens se houver
                db.query(models.GrupoMensagem).filter_by(grupo_id=g.id).delete()
                db.delete(g)
            db.commit()
            print(f"[SEED] Removidos {len(existentes_seed)} grupos de testes anteriores.")

        agora = datetime.now()
        novos_grupos = []

        for i in range(1, 201):
            idx_str = f"{i:03d}"
            jid = f"12036340567{i:05d}@g.us"
            qtd_membros = ((i * 7 + 13) % 190) + 10
            dia_atual = (i % 7) + 1
            tipo_ciclo = "semanal" if i % 2 == 0 else "unico"

            g = models.GrupoWhatsApp(
                id=uuid.uuid4(),
                cliente_id=cid,
                nome=f"Grupo Lançamento VIP {idx_str}",
                id_do_grupo=jid,
                numero_do_disparo="",
                ativo=True,
                dia_inicio_semana=0, # Sexta
                dia_fim_semana=4,    # Domingo
                dia_lancamento_atual=dia_atual,
                quantidade_contatos=qtd_membros,
                tipo_ciclo=tipo_ciclo,
                extrair_contatos=True,
                intervalo_extracao_minutos=30,
                webhook_extracao_url="https://api.aryaraj.shop/api/webhooks/zapgroup",
                link_convite=f"https://chat.whatsapp.com/LancerVip{idx_str}"
            )

            novos_grupos.append(g)

        db.add_all(novos_grupos)
        db.commit()

        print(f"[OK] 200 grupos cadastrados com sucesso para o cliente '{cid}' sem nenhuma mensagem ativada.")
    except Exception as e:
        db.rollback()
        print(f"[ERRO] Falha ao cadastrar os 200 grupos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
