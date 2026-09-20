from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os
import httpx
from datetime import datetime

from sqlalchemy import or_

import models, schemas, security, scheduler
from database import get_db
from client_context import get_active_client_id
import core.wapi as wapi
from services import sync_service

router = APIRouter(tags=["Grupos"])

@router.get("/grupos/", response_model=List[schemas.GrupoWhatsApp], dependencies=[Depends(security.get_api_key)])
def listar_grupos(db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    grupos = db.query(models.GrupoWhatsApp).filter(
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None))
    ).order_by(models.GrupoWhatsApp.nome, models.GrupoWhatsApp.id).all()
    
    for g in grupos:
        ids_associados = db.query(models.GrupoMensagem.mensagem_id).filter_by(grupo_id=g.id).all()
        ids_associados = [r[0] for r in ids_associados]
        g.total_mensagens = len(ids_associados)

        if g.ativo and g.dia_lancamento_atual > 0:
            if ids_associados:
                count_hoje = db.query(models.MensagemDisparada).filter(
                    models.MensagemDisparada.dia_do_lancamento == g.dia_lancamento_atual,
                    models.MensagemDisparada.ativo == True,
                    models.MensagemDisparada.id.in_(ids_associados)
                ).count()
            else:
                count_hoje = db.query(models.MensagemDisparada).filter(
                    models.MensagemDisparada.dia_do_lancamento == g.dia_lancamento_atual,
                    models.MensagemDisparada.ativo == True
                ).count()
            g.total_disparos_hoje = count_hoje
            g.tem_disparo_hoje = (count_hoje > 0)
        else:
            g.total_disparos_hoje = 0
            g.tem_disparo_hoje = False

    return grupos


@router.post("/grupos/", response_model=schemas.GrupoWhatsApp, dependencies=[Depends(security.get_api_key)])
def criar_grupo(grupo: schemas.GrupoWhatsAppCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_grupo = models.GrupoWhatsApp(**grupo.model_dump())
    db_grupo.cliente_id = cid
    
    hoje = datetime.now().weekday()
    is_in_cycle = False
    
    if db_grupo.dia_inicio_semana <= db_grupo.dia_fim_semana:
        if db_grupo.dia_inicio_semana <= hoje <= db_grupo.dia_fim_semana:
            is_in_cycle = True
    else:
        if hoje >= db_grupo.dia_inicio_semana or hoje <= db_grupo.dia_fim_semana:
            is_in_cycle = True
            
    if is_in_cycle:
        if hoje >= db_grupo.dia_inicio_semana:
            db_grupo.dia_lancamento_atual = (hoje - db_grupo.dia_inicio_semana) + 1
        else:
            db_grupo.dia_lancamento_atual = (hoje + 7 - db_grupo.dia_inicio_semana) + 1
    else:
        db_grupo.dia_lancamento_atual = 0
        
    db.add(db_grupo)
    db.commit()
    db.refresh(db_grupo)
    db_grupo.total_mensagens = 0
    return db_grupo

@router.patch("/grupos/{grupo_id}/toggle", response_model=schemas.GrupoWhatsApp, dependencies=[Depends(security.get_api_key)])
def toggle_grupo(grupo_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id, models.GrupoWhatsApp.cliente_id == cid).first()
    if not db_grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    db_grupo.ativo = not db_grupo.ativo
    db.commit()
    db.refresh(db_grupo)
    return db_grupo

@router.put("/grupos/{grupo_id}", response_model=schemas.GrupoWhatsApp, dependencies=[Depends(security.get_api_key)])
def atualizar_grupo(grupo_id: uuid.UUID, grupo: schemas.GrupoWhatsAppCreate, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id, models.GrupoWhatsApp.cliente_id == cid).first()
    if not db_grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    
    for key, value in grupo.model_dump().items():
        setattr(db_grupo, key, value)
    
    db_grupo.cliente_id = cid
    
    hoje = datetime.now().weekday()
    is_in_cycle = False
    
    if db_grupo.dia_inicio_semana <= db_grupo.dia_fim_semana:
        if db_grupo.dia_inicio_semana <= hoje <= db_grupo.dia_fim_semana:
            is_in_cycle = True
    else:
        if hoje >= db_grupo.dia_inicio_semana or hoje <= db_grupo.dia_fim_semana:
            is_in_cycle = True
            
    if is_in_cycle:
        if hoje >= db_grupo.dia_inicio_semana:
            db_grupo.dia_lancamento_atual = (hoje - db_grupo.dia_inicio_semana) + 1
        else:
            db_grupo.dia_lancamento_atual = (hoje + 7 - db_grupo.dia_inicio_semana) + 1
    else:
        db_grupo.dia_lancamento_atual = 0
    
    db.commit()
    db.refresh(db_grupo)
    db_grupo.total_mensagens = db.query(models.GrupoMensagem).filter_by(grupo_id=db_grupo.id).count()
    return db_grupo

@router.delete("/grupos/{grupo_id}", dependencies=[Depends(security.get_api_key)])
def deletar_grupo(grupo_id: uuid.UUID, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    db_grupo = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.id == grupo_id, models.GrupoWhatsApp.cliente_id == cid).first()
    if not db_grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    
    db.delete(db_grupo)
    db.commit()
    return {"message": "Grupo deletado com sucesso"}

@router.post("/grupos/bulk-delete", dependencies=[Depends(security.get_api_key)])
def deletar_grupos_em_massa(payload: schemas.GrupoBulkDelete, db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    if not payload.grupo_ids:
        return {"message": "Nenhum grupo informado para exclusão", "deleted_count": 0}
    
    grupos_db = db.query(models.GrupoWhatsApp).filter(
        models.GrupoWhatsApp.id.in_(payload.grupo_ids),
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None))
    ).all()
    
    count = len(grupos_db)
    for g in grupos_db:
        db.delete(g)
    
    db.commit()
    return {"message": f"{count} grupo(s) excluído(s) com sucesso", "deleted_count": count}


@router.get("/grupos/{grupo_id}/mensagens/", dependencies=[Depends(security.get_api_key)])
def listar_mensagens_do_grupo(grupo_id: uuid.UUID, db: Session = Depends(get_db)):
    ids = db.query(models.GrupoMensagem.mensagem_id).filter(
        models.GrupoMensagem.grupo_id == grupo_id
    ).all()
    return [str(r[0]) for r in ids]

@router.post("/grupos/{grupo_id}/mensagens/{mensagem_id}", dependencies=[Depends(security.get_api_key)])
def associar_mensagem_ao_grupo(grupo_id: uuid.UUID, mensagem_id: uuid.UUID, db: Session = Depends(get_db)):
    existe = db.query(models.GrupoMensagem).filter_by(grupo_id=grupo_id, mensagem_id=mensagem_id).first()
    if not existe:
        db.add(models.GrupoMensagem(grupo_id=grupo_id, mensagem_id=mensagem_id))
        db.commit()
    return {"ok": True}

@router.delete("/grupos/{grupo_id}/mensagens/{mensagem_id}", dependencies=[Depends(security.get_api_key)])
def desassociar_mensagem_do_grupo(grupo_id: uuid.UUID, mensagem_id: uuid.UUID, db: Session = Depends(get_db)):
    db.query(models.GrupoMensagem).filter_by(grupo_id=grupo_id, mensagem_id=mensagem_id).delete()
    db.commit()
    return {"ok": True}

@router.get("/wapi/grupos/", dependencies=[Depends(security.get_api_key)])
async def listar_grupos_wapi(db: Session = Depends(get_db)):
    cid = get_active_client_id(db)
    cliente = db.query(models.Cliente).filter(models.Cliente.id == cid).first()
    
    token = (cliente.wapi_token if cliente else None) or os.getenv("WAPI_TOKEN")
    instance_id = (cliente.wapi_instance_id if cliente else None) or os.getenv("WAPI_INSTANCE_ID")

    if not token or not instance_id:
        missing = []
        if not token: missing.append("WAPI_TOKEN")
        if not instance_id: missing.append("WAPI_INSTANCE_ID")
        raise HTTPException(
            status_code=503, 
            detail=f"Configurações ausentes no servidor: {', '.join(missing)}."
        )

    url = f"https://api.w-api.app/v1/group/get-all-groups?instanceId={instance_id}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Falha na W-API: {str(e)}")

    data = resp.json()
    raw_list = data if isinstance(data, list) else data.get("groups") or data.get("data") or []

    grupos = []
    for g in raw_list:
        if isinstance(g.get("id"), dict):
            jid = g["id"].get("_serialized") or g["id"].get("user", "")
        else:
            jid = g.get("id", "")
        nome = g.get("subject") or g.get("name") or jid
        if jid:
            grupos.append({"jid": jid, "nome": nome})
    
    grupos.sort(key=lambda x: x["nome"].lower())
    return grupos

@router.post("/grupos/sync", dependencies=[Depends(security.get_api_key)])
def sincronizar_dados_grupos(db: Session = Depends(get_db)):
    """
    Dispara a sincronização manual de contatos e links de convite para todos os grupos ativos.
    """
    try:
        scheduler.atualizar_contagem_contatos(db)
        return {"message": "Sincronização iniciada com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na sincronização: {str(e)}")

@router.post("/grupos/{grupo_id}/extrair-contatos", dependencies=[Depends(security.get_api_key)])
def extrair_contatos_grupo_manualmente(
    grupo_id: uuid.UUID,
    payload: Optional[schemas.ExtrairContatosManualRequest] = None,
    forcar_reenvio: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Força a extração imediata dos contatos de um grupo específico via W-API.
    Se forcar_reenvio_webhook=True, reenvia para todos os contatos do grupo (exceto admins).
    """
    forcar = False
    if payload and payload.forcar_reenvio_webhook:
        forcar = True
    elif forcar_reenvio is True:
        forcar = True

    cid = get_active_client_id(db)
    grupo = db.query(models.GrupoWhatsApp).filter(
        models.GrupoWhatsApp.id == grupo_id, 
        or_(models.GrupoWhatsApp.cliente_id == cid, models.GrupoWhatsApp.cliente_id.is_(None))
    ).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")

    instance_id = wapi.get_wapi_instance(db)
    headers = wapi.get_wapi_headers(db)
    if not instance_id or not headers.get("Authorization"):
        raise HTTPException(status_code=400, detail="Configurações W-API ausentes. Verifique suas credenciais em Configurações.")

    agora = datetime.now(sync_service.BR_TZ).replace(tzinfo=None)

    with httpx.Client(timeout=30.0) as client:
        participants, is_closed = sync_service.fetch_participants(client, wapi.WAPI_BASE, instance_id, grupo.id_do_grupo, headers)
        if participants is None:
            raise HTTPException(status_code=502, detail="Não foi possível obter participantes da W-API (verifique se a instância está conectada).")

        grupo.quantidade_contatos = len(participants)
        grupo.ultima_extracao_em = agora

        # Sincroniza contatos
        db.query(models.ContatoGrupo).filter_by(jid_grupo=grupo.id_do_grupo).update({"no_grupo": False})
        db.commit()

        detalhes = sync_service.processar_participantes_grupo(
            db, client, instance_id, headers, grupo, participants, agora,
            group_is_closed=is_closed,
            forcar_reenvio_webhook=forcar,
            retornar_detalhes=True
        )
        novos_contatos_count = detalhes["novos"]
        webhooks_disparados = detalhes["webhooks"]
        db.commit()

        # Registra log no Histórico
        msg_log = f"Extração manual de contatos realizada ({len(participants)} contatos encontrados, {novos_contatos_count} novos"
        if webhooks_disparados > 0:
            msg_log += f", {webhooks_disparados} webhooks disparados"
        msg_log += ")"

        log = models.LogDisparo(
            cliente_id=cid,
            grupo_nome=grupo.nome,
            mensagem_corpo=msg_log,
            status="SUCESSO",
            tipo="extracao_contatos",
            criado_em=agora
        )
        db.add(log)
        db.commit()

        msg_retorno = f"Extração de contatos concluída para '{grupo.nome}' ({len(participants)} contatos encontrados"
        if webhooks_disparados > 0:
            msg_retorno += f", {webhooks_disparados} webhooks disparados"
        msg_retorno += ")"

        return {
            "status": "success",
            "message": msg_retorno,
            "quantidade_contatos": len(participants),
            "webhooks_disparados": webhooks_disparados
        }


@router.post("/grupos/test-poll-webhook", dependencies=[Depends(security.get_api_key)])
async def testar_webhook_enquete(payload: schemas.TestPollWebhookRequest, db: Session = Depends(get_db)):
    url = (payload.webhook_url or "").strip()
    if not url or not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Por favor, forneça uma URL de Webhook válida iniciando com http:// ou https://")

    agora_bsb = datetime.now(scheduler.BR_TZ).strftime("%Y-%m-%d %H:%M:%S")

    dados_teste = {
      "evento": "voto_enquete_teste",
      "grupo": {
        "id": "teste-preview-id",
        "nome": payload.grupo_nome or "WhatsApp - Teste - Astrologia",
        "jid": payload.grupo_jid or "120363405673797894@g.us"
      },
      "usuario": {
        "nome": "Lead de Demonstração (Teste)",
        "numero": "5511999998888",
        "jid": "5511999998888@s.whatsapp.net"
      },
      "enquete": {
        "id_mensagem_enquete": "POLL_TEST_ID_12345",
        "titulo": "Qual seu principal interesse no lançamento?",
        "opcao_marcada": "Garantir minha vaga no 1º lote com desconto",
        "opcoes_marcadas": ["Garantir minha vaga no 1º lote com desconto"],
        "todas_opcoes": [
          "Garantir minha vaga no 1º lote com desconto",
          "Conhecer mais sobre o cronograma",
          "Tirar dúvidas com o suporte"
        ]
      },
      "data_hora": agora_bsb,
      "is_teste": True,
      "raw_data": {
        "tipo": "disparo_manual_de_teste",
        "origem": "painel_gerenciador_grupos"
      }
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json=dados_teste,
                headers={"Content-Type": "application/json"}
            )
            if 200 <= resp.status_code < 300:
                return {
                    "success": True,
                    "status_code": resp.status_code,
                    "message": f"Webhook testado com sucesso! O endpoint respondeu com status {resp.status_code}."
                }
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"O webhook foi contactado, mas retornou status de erro {resp.status_code}: {resp.text[:200]}"
                )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Falha de conexão com a URL informada: {str(e)}"
        )
