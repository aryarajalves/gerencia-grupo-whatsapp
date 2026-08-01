import models
from datetime import datetime
import pytz

BR_TZ = pytz.timezone('America/Sao_Paulo')

def avancar_dias_de_lancamento(db):
    """Executado diariamente para resetar ou avançar o dia de lançamento dos grupos."""
    agora_br = datetime.now(BR_TZ)
    hoje_semana = agora_br.weekday()

    grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.ativo == True).all()

    for grupo in grupos:
        tipo_ciclo = getattr(grupo, 'tipo_ciclo', 'semanal') or 'semanal'

        if hoje_semana == grupo.dia_inicio_semana:
            grupo.dia_lancamento_atual = 1
        elif grupo.dia_lancamento_atual > 0:
            is_in_cycle = False
            if grupo.dia_inicio_semana <= grupo.dia_fim_semana:
                if grupo.dia_inicio_semana <= hoje_semana <= grupo.dia_fim_semana:
                    is_in_cycle = True
            else:
                if hoje_semana >= grupo.dia_inicio_semana or hoje_semana <= grupo.dia_fim_semana:
                    is_in_cycle = True

            if is_in_cycle:
                if hoje_semana >= grupo.dia_inicio_semana:
                    grupo.dia_lancamento_atual = (hoje_semana - grupo.dia_inicio_semana) + 1
                else:
                    grupo.dia_lancamento_atual = (hoje_semana + 7 - grupo.dia_inicio_semana) + 1
            else:
                # Ciclo terminou
                grupo.dia_lancamento_atual = 0
                if tipo_ciclo == "unico":
                    # Encerra permanentemente — não reaparece na próxima semana
                    grupo.ativo = False

        db.commit()
