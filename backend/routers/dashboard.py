from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import func, or_

import models, schemas, security, scheduler
from database import get_db
from client_context import get_active_client_id

router = APIRouter(tags=["Dashboard"])

@router.get("/dashboard/stats", response_model=schemas.DashboardStats, dependencies=[Depends(security.get_api_key)])
def get_dashboard_stats(db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    
    total_grupos_ativos = db.query(models.GrupoWhatsApp).filter(or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None)), models.GrupoWhatsApp.ativo == True).count()
    total_grupos_lancamento = db.query(models.GrupoWhatsApp).filter(or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None)), models.GrupoWhatsApp.ativo == True, models.GrupoWhatsApp.dia_lancamento_atual > 0).count()
    total_grupos_encerrados = db.query(models.GrupoWhatsApp).filter(or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None)), models.GrupoWhatsApp.dia_lancamento_atual == 0).count()
    total_mensagens = db.query(models.MensagemDisparada).filter(or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None))).count()

    hoje = datetime.now(scheduler.BR_TZ).date()
    disparos_hoje = db.query(models.LogDisparo).filter(
        or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None)),
        func.date(models.LogDisparo.criado_em) == hoje
    ).count()

    total_logs = db.query(models.LogDisparo).filter(or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None))).count()
    sucessos = db.query(models.LogDisparo).filter(or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None)), models.LogDisparo.status == "Sucesso").count()
    taxa_sucesso = (sucessos / total_logs * 100) if total_logs > 0 else 100.0

    ultimo_disparo = db.query(models.LogDisparo).filter(or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None)), models.LogDisparo.status == "Sucesso").order_by(models.LogDisparo.criado_em.desc()).first()

    agora_br = datetime.now(scheduler.BR_TZ)
    hora_atual = agora_br.time()
    
    proximos = []
    grupos_em_ciclo = db.query(models.GrupoWhatsApp).filter(
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None)),
        models.GrupoWhatsApp.ativo == True,
        models.GrupoWhatsApp.dia_lancamento_atual > 0
    ).all()
    
    for grupo in grupos_em_ciclo:
        ids_associados = [r[0] for r in db.query(models.GrupoMensagem.mensagem_id).filter(models.GrupoMensagem.grupo_id == grupo.id).all()]
        msg_query = db.query(models.MensagemDisparada).filter(
            or_(models.MensagemDisparada.cliente_id == cid, models.MensagemDisparada.cliente_id.is_(None)),
            models.MensagemDisparada.dia_do_lancamento == grupo.dia_lancamento_atual,
            models.MensagemDisparada.horario_do_disparo > hora_atual,
            models.MensagemDisparada.ativo == True
        ).filter(
            models.MensagemDisparada.id.in_(ids_associados)
        )
            
        mensagens_pendentes = msg_query.all()
        for m in mensagens_pendentes:
            proximos.append({
                "horario": m.horario_do_disparo.strftime("%H:%M"),
                "grupo": grupo.nome,
                "mensagem": (m.mensagem[:50] + "...") if m.mensagem and len(m.mensagem) > 50 else (m.mensagem or f"[{m.tipo_de_mensagem.upper()}]"),
                "tipo": m.tipo_de_mensagem or "texto"
            })
            
    proximos.sort(key=lambda x: x["horario"])
    proximos = proximos[:5]

    grupos_por_dia_map = {}
    todos_grupos_ciclo = db.query(models.GrupoWhatsApp).filter(
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None)),
        models.GrupoWhatsApp.dia_lancamento_atual > 0
    ).all()
    for g in todos_grupos_ciclo:
        dia = g.dia_lancamento_atual
        if dia not in grupos_por_dia_map:
            grupos_por_dia_map[dia] = []
        grupos_por_dia_map[dia].append(g.nome)
        
    grupos_por_dia = [
        {"dia": dia, "grupos": nomes}
        for dia, nomes in sorted(grupos_por_dia_map.items())
    ]

    falhas_definitivas = db.query(models.LogDisparo).filter(
        or_(models.LogDisparo.cliente_id == cid, models.LogDisparo.cliente_id.is_(None)),
        models.LogDisparo.status == "FALHA_DEFINITIVA",
        models.LogDisparo.dispensado == False
    ).order_by(models.LogDisparo.criado_em.desc()).all()

    conjuntos_quase_cheios = []
    conjuntos = db.query(models.ConjuntoGrupo).filter(
        or_(models.ConjuntoGrupo.cliente_id == cid, models.ConjuntoGrupo.cliente_id.is_(None)),
        models.ConjuntoGrupo.ativo == True
    ).all()
    for conj in conjuntos:
        assoc_list = db.query(models.GrupoConjuntoAssociacao).filter_by(conjunto_id=conj.id).all()
        total_leads = 0
        max_total = 0
        for assoc in assoc_list:
            g = db.query(models.GrupoWhatsApp).filter_by(id=assoc.grupo_id).first()
            if g:
                total_leads += g.quantidade_contatos or 0
                max_total += assoc.max_leads
        
        if max_total > 0:
            porcentagem = (total_leads / max_total) * 100
            if porcentagem >= 80: # Alerta a partir de 80%
                conjuntos_quase_cheios.append({
                    "nome": conj.nome,
                    "leads": total_leads,
                    "max": max_total,
                    "porcentagem": round(porcentagem, 1)
                })

    grupos_sem_mensagens = []
    ativos = db.query(models.GrupoWhatsApp).filter(
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None)),
        models.GrupoWhatsApp.ativo == True
    ).all()
    for g in ativos:
        msg_count = db.query(models.GrupoMensagem).filter_by(grupo_id=g.id).count()
        if msg_count == 0:
            grupos_sem_mensagens.append(g.nome)

    return {
        "total_grupos_ativos": total_grupos_ativos,
        "total_grupos_lancamento": total_grupos_lancamento,
        "total_grupos_encerrados": total_grupos_encerrados,
        "total_mensagens": total_mensagens,
        "disparos_hoje": disparos_hoje,
        "taxa_sucesso": round(taxa_sucesso, 1),
        "ultimo_disparo": ultimo_disparo,
        "proximos_disparos": proximos,
        "grupos_por_dia": grupos_por_dia,
        "falhas_definitivas": falhas_definitivas,
        "grupos_sem_mensagens": grupos_sem_mensagens,
        "conjuntos_quase_cheios": conjuntos_quase_cheios
    }

@router.get("/whatsapp/status", dependencies=[Depends(security.get_api_key)])
def get_whatsapp_status(db: Session = Depends(get_db)):
    from services.sync_service import verificar_status_whatsapp
    cid = get_active_client_id(db)
    cliente = db.query(models.Cliente).filter(models.Cliente.id == cid).first()
    
    status = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_STATUS").first()
    if not status or status.valor == "desconhecido":
        verificar_status_whatsapp(db)
        status = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_STATUS").first()

    return {
        "status": status.valor if status else "desconhecido",
        "plan_type": cliente.wapi_plan_type if cliente else "PRO",
        "last_check": datetime.now().isoformat()
    }
