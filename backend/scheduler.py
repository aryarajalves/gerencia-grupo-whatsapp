import time
from datetime import datetime, timedelta
import pytz
from sqlalchemy import func
from apscheduler.schedulers.background import BackgroundScheduler

import models
from database import SessionLocal
from services.message_service import enviar_wapi
from services.sync_service import verificar_status_whatsapp, atualizar_contagem_contatos
from services.cycle_service import avancar_dias_de_lancamento

BR_TZ = pytz.timezone('America/Sao_Paulo')

def verificar_e_disparar_mensagens():
    db = SessionLocal()
    try:
        agora_br = datetime.now(BR_TZ)
        hoje = agora_br.date()
        hora_atual = agora_br.time()
        
        # Janela de 30 minutos para capturar atrasos
        temp_dt = datetime.combine(hoje, hora_atual)
        hora_limite = (temp_dt - timedelta(minutes=30)).time()

        # Verificação de Horário de Silêncio
        silence_enabled = db.query(models.Configuracao).filter(models.Configuracao.chave == "SILENCE_HOURS_ENABLED").first()
        if silence_enabled and silence_enabled.valor.lower() == "true":
            s_start = db.query(models.Configuracao).filter(models.Configuracao.chave == "SILENCE_HOURS_START").first()
            s_end = db.query(models.Configuracao).filter(models.Configuracao.chave == "SILENCE_HOURS_END").first()
            
            if s_start and s_end:
                try:
                    start_time = datetime.strptime(s_start.valor, "%H:%M").time()
                    end_time = datetime.strptime(s_end.valor, "%H:%M").time()
                    
                    is_silent = False
                    if start_time < end_time:
                        if start_time <= hora_atual < end_time:
                            is_silent = True
                    else: # Cruza a meia-noite
                        if hora_atual >= start_time or hora_atual < end_time:
                            is_silent = True
                    
                    if is_silent:
                        print(f"[{agora_br.strftime('%H:%M:%S')}] Janela de silêncio ativa ({s_start.valor} - {s_end.valor}). Disparos suspensos.")
                        return
                except Exception as ex:
                    print(f"Erro ao processar horário de silêncio: {ex}")
        
        print(f"[{agora_br.strftime('%H:%M:%S')}] Verificando mensagens (Janela: {hora_limite.strftime('%H:%M')} - {hora_atual.strftime('%H:%M')})")

        grupos_ativos = db.query(models.GrupoWhatsApp).filter(
            models.GrupoWhatsApp.ativo == True,
            models.GrupoWhatsApp.dia_lancamento_atual > 0
        ).all()

        if not grupos_ativos:
            return

        for grupo in grupos_ativos:
            ids_associados = db.query(models.GrupoMensagem.mensagem_id).filter(
                models.GrupoMensagem.grupo_id == grupo.id
            ).all()
            ids_associados = [str(r[0]) for r in ids_associados]

            mensagens = db.query(models.MensagemDisparada).filter(
                models.MensagemDisparada.dia_do_lancamento == grupo.dia_lancamento_atual,
                models.MensagemDisparada.horario_do_disparo >= hora_limite,
                models.MensagemDisparada.horario_do_disparo <= hora_atual,
                models.MensagemDisparada.ativo == True,
                models.MensagemDisparada.id.in_(ids_associados)
            ).all()
            
            for msg in mensagens:
                # Evita duplicidade e excesso de erros
                ja_enviado = db.query(models.LogDisparo).filter(
                    models.LogDisparo.grupo_nome == grupo.nome,
                    models.LogDisparo.status == "Sucesso",
                    models.LogDisparo.mensagem_id == msg.id,
                    func.date(models.LogDisparo.criado_em) == hoje
                ).first()

                if ja_enviado: continue

                erros = db.query(models.LogDisparo).filter(
                    models.LogDisparo.grupo_nome == grupo.nome,
                    models.LogDisparo.status == "Erro",
                    models.LogDisparo.mensagem_id == msg.id,
                    func.date(models.LogDisparo.criado_em) == hoje
                ).count()

                if erros >= 10:
                    # Verifica se já existe um log de falha definitiva hoje para esta mensagem
                    falha_definitiva = db.query(models.LogDisparo).filter(
                        models.LogDisparo.grupo_nome == grupo.nome,
                        models.LogDisparo.status == "FALHA_DEFINITIVA",
                        models.LogDisparo.mensagem_id == msg.id,
                        func.date(models.LogDisparo.criado_em) == hoje
                    ).first()

                    if not falha_definitiva:
                        from services.message_service import registrar_log
                        ultimo_erro = db.query(models.LogDisparo).filter(
                            models.LogDisparo.grupo_nome == grupo.nome,
                            models.LogDisparo.status == "Erro",
                            models.LogDisparo.mensagem_id == msg.id,
                            func.date(models.LogDisparo.criado_em) == hoje
                        ).order_by(models.LogDisparo.criado_em.desc()).first()
                        
                        detalhes = f"Limite de 10 tentativas atingido. Último erro: {ultimo_erro.detalhes_erro if ultimo_erro else 'Desconhecido'}"
                        registrar_log(db, grupo.nome, msg.mensagem or f"[{msg.tipo_de_mensagem.upper()}]", "FALHA_DEFINITIVA", detalhes, msg_id=msg.id, tipo=msg.tipo_de_mensagem)
                        print(f"!!! FALHA DEFINITIVA -> {grupo.nome} ({msg.id})")
                    
                    continue

                print(f"Disparando {msg.tipo_de_mensagem} -> {grupo.nome}")
                
                # Verificação de plano para Enquetes (PRO REQUIRED)
                if msg.tipo_de_mensagem == "enquete":
                    plan_config = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
                    plan_type = plan_config.valor if plan_config else "LITE"
                    
                    if plan_type == "LITE":
                        from services.message_service import registrar_log
                        detalhes = "Disparo de enquete ignorado: Recurso exclusivo do plano PRO da W-API."
                        registrar_log(db, grupo.nome, msg.mensagem or "[ENQUETE]", "Erro", detalhes, msg_id=msg.id, tipo=msg.tipo_de_mensagem)
                        print(f"!!! PLANO LITE -> Ignorando enquete para {grupo.nome}")
                        continue

                # Enfileiramento via RabbitMQ (Processamento Sequencial 1 por vez)
                from services.queue_service import publish_dispatch_task, is_queue_available
                if is_queue_available():
                    published = publish_dispatch_task(grupo.id, msg.id)
                    if published:
                        print(f"Disparo enfileirado no RabbitMQ (1 por vez) -> {grupo.nome} ({msg.id})")
                        continue

                # Fallback síncrono se a fila não estiver rodando
                enviar_wapi(grupo, msg, db)
                time.sleep(2)
 

    except Exception as e:
        print(f"Erro no agendador: {str(e)}")
    finally:
        db.close()

# Wrapper para manter compatibilidade com o que chama via scheduler.py
def job_avancar_dias():
    db = SessionLocal()
    try:
        avancar_dias_de_lancamento(db)
    finally:
        db.close()

def job_verificar_status():
    db = SessionLocal()
    try:
        verificar_status_whatsapp(db)
    finally:
        db.close()

def job_atualizar_contatos():
    from services.queue_service import is_queue_available, publish_extraction_task
    db = SessionLocal()
    try:
        agora = datetime.now(BR_TZ).replace(tzinfo=None)
        grupos = db.query(models.GrupoWhatsApp).filter(
            models.GrupoWhatsApp.ativo == True,
            models.GrupoWhatsApp.extrair_contatos == True
        ).all()

        if is_queue_available():
            enfileirados = 0
            for g in grupos:
                intervalo = getattr(g, 'intervalo_extracao_minutos', 30) or 30
                ultima = getattr(g, 'ultima_extracao_em', None)
                if ultima:
                    minutos_decorridos = (agora - ultima).total_seconds() / 60.0
                    if minutos_decorridos < intervalo:
                        continue  # ainda não chegou a hora deste grupo
                publish_extraction_task(g.id)
                enfileirados += 1
            if enfileirados > 0:
                print(f"[{agora.strftime('%H:%M:%S')}] {enfileirados} grupos enfileirados para extração (de {len(grupos)} ativos).")
        else:
            atualizar_contagem_contatos(db)
    except Exception as e:
        print(f"Erro no job de atualizar contatos: {e}")
    finally:
        db.close()

def job_backup_automatico():
    from services import backup_service
    db = SessionLocal()
    try:
        info = backup_service.get_backup_info(db)
        if not info["agendamento_ativo"]:
            return

        agora = datetime.now(BR_TZ)
        last_run_str = backup_service.get_config_val(db, "BACKUP_LAST_RUN", None)
        interval_hours = info["interval_hours"]

        should_run = False
        if not last_run_str:
            should_run = True
        else:
            try:
                dt_last = datetime.fromisoformat(last_run_str)
                if (agora - dt_last) >= timedelta(hours=interval_hours):
                    should_run = True
            except Exception:
                should_run = True

        if should_run:
            print(f"[{agora.strftime('%H:%M:%S')}] Executando backup automático agendado do banco de dados...")
            backup_service.execute_backup(db)
    except Exception as e:
        print(f"Erro no backup automático: {e}")
    finally:
        db.close()

def iniciar_agendador():
    scheduler = BackgroundScheduler()
    # Verificação de mensagens (máximo de paralelismo e execução pontual)
    scheduler.add_job(verificar_e_disparar_mensagens, 'interval', seconds=30, next_run_time=datetime.now(BR_TZ), max_instances=5)
    # Ciclo diário
    scheduler.add_job(job_avancar_dias, 'cron', hour=0, minute=0, next_run_time=datetime.now(BR_TZ), max_instances=2)
    # Status e Contatos
    scheduler.add_job(job_verificar_status, 'interval', minutes=20, next_run_time=datetime.now(BR_TZ), max_instances=2)
    # Polling a cada 1 min — o intervalo real por grupo é respeitado dentro do job
    scheduler.add_job(job_atualizar_contatos, 'interval', minutes=1, next_run_time=datetime.now(BR_TZ), max_instances=2)
    # Backup automático a cada 15 minutos checa se venceu o intervalo
    scheduler.add_job(job_backup_automatico, 'interval', minutes=15, next_run_time=datetime.now(BR_TZ), max_instances=2)
    
    scheduler.start()
    return scheduler


# Compatibilidade
enviar_payload_n8n = enviar_wapi
