import httpx
from datetime import datetime
import models
from core.wapi import WAPI_BASE, get_wapi_headers, get_wapi_instance, set_system_config
import pytz

BR_TZ = pytz.timezone('America/Sao_Paulo')

def verificar_status_whatsapp(db):
    """Verifica se o WhatsApp está conectado na W-API e salva o status."""
    try:
        instance_id = get_wapi_instance(db)
        headers = get_wapi_headers(db)
        
        if not instance_id or not headers.get("Authorization"):
            print("W-API: Configurações ausentes para verificação de status.")
            return

        url = f"{WAPI_BASE}/instance/status-instance?instanceId={instance_id}"
        
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers)
            
            status_ws = "desconectado"
            if response.status_code == 200:
                data = response.json()
                print(f"W-API Status Check Result: {data}")
                
                # Trata todas as variações conhecidas de resposta da W-API
                is_connected = (
                    data.get("connected") is True or
                    str(data.get("status", "")).upper() in ["CONNECTED", "ONLINE"] or
                    str(data.get("state", "")).upper() in ["CONNECTED", "ONLINE"] or
                    str(data.get("sessionStatus", "")).upper() in ["CONNECTED", "ONLINE"] or
                    (isinstance(data.get("instance"), dict) and (
                        str(data["instance"].get("status", "")).upper() in ["CONNECTED", "ONLINE"] or
                        data["instance"].get("connected") is True
                    ))
                )
                if is_connected:
                    status_ws = "conectado"
            
            # Obtém plano existente no banco (padrão PRO se não definido)
            existing_plan_cfg = db.query(models.Configuracao).filter(models.Configuracao.chave == "WHATSAPP_PLAN_TYPE").first()
            user_configured_plan = existing_plan_cfg.valor if (existing_plan_cfg and existing_plan_cfg.valor) else "PRO"

            plan_type = user_configured_plan

            # Se a configuração não for forçada para PRO, tenta auto-detectar na W-API
            if user_configured_plan != "PRO":
                try:
                    if response.status_code == 200:
                        resp_data = response.json()
                        inst_obj = resp_data.get("instance") if isinstance(resp_data.get("instance"), dict) else resp_data
                        p_val = str(inst_obj.get("planType") or inst_obj.get("plan") or inst_obj.get("plan_type") or "").upper()
                        if "PRO" in p_val or inst_obj.get("isPro") is True:
                            plan_type = "PRO"

                    url_instances = f"{WAPI_BASE}/instance/list-instances"
                    resp = client.get(url_instances, headers=headers)
                    if resp.status_code == 200:
                        data_inst = resp.json()
                        instances_list = data_inst if isinstance(data_inst, list) else (data_inst.get("instances") or data_inst.get("data") or [])
                        if isinstance(instances_list, list):
                            for inst in instances_list:
                                inst_id_val = str(inst.get("instanceId") or inst.get("id") or inst.get("instance_id") or "").strip().lower()
                                target_id_val = str(instance_id).strip().lower()
                                if inst_id_val and inst_id_val == target_id_val:
                                    p_val = str(inst.get("planType") or inst.get("plan") or inst.get("plan_type") or inst.get("tier") or "").upper()
                                    if "PRO" in p_val or inst.get("isPro") is True:
                                        plan_type = "PRO"
                                    break
                except Exception as e:
                    print(f"Erro ao verificar plano da W-API: {e}")

            set_system_config(db, "WHATSAPP_STATUS", status_ws)
            set_system_config(db, "WHATSAPP_PLAN_TYPE", plan_type)
            set_system_config(db, "WHATSAPP_LAST_CHECK", datetime.now(BR_TZ).isoformat())
            
            db.commit()
            print(f"W-API: Status do WhatsApp verificado: {status_ws}")

    except Exception as e:
        print(f"Erro ao verificar status do WhatsApp: {str(e)}")

def fetch_participants(client, wapi_base, instance_id, group_id, headers):
    """Tenta buscar os participantes do grupo usando diferentes endpoints e métodos (resiliência)."""
    # Endpoints e variações
    strategies = [
        {"method": "GET", "url": f"{wapi_base}/group/get-participants", "params": {"instanceId": instance_id, "groupId": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/get-participants", "params": {"instanceId": instance_id, "groupJid": group_id}},
        {"method": "POST", "url": f"{wapi_base}/group/get-participants", "json": {"instanceId": instance_id, "groupId": group_id}},
        {"method": "GET", "url": f"{wapi_base}/group/get-group-info", "params": {"instanceId": instance_id, "groupId": group_id}}
    ]

    for strategy in strategies:
        try:
            if strategy["method"] == "GET":
                resp = client.get(strategy["url"], params=strategy.get("params"), headers=headers)
            else:
                resp = client.post(strategy["url"], json=strategy.get("json"), headers=headers)

            if resp.status_code == 200:
                data = resp.json()
                # Se for get-group-info, extrai de dentro do objeto group
                if "get-group-info" in strategy["url"]:
                    participants = (data.get("group") or data).get("participants")
                else:
                    participants = data.get("participants")
                
                if isinstance(participants, list):
                    return participants
        except Exception as e:
            print(f"W-API Sync DEBUG: Falha {strategy['method']} {strategy['url']}: {e}")
    
    return None

def atualizar_contagem_contatos(db):
    """Busca grupos ativos e sincroniza contatos via W-API."""
    try:
        instance_id = get_wapi_instance(db)
        headers = get_wapi_headers(db)
        if not instance_id or not headers.get("Authorization"):
            print("W-API Sync: Configurações ausentes.")
            return

        grupos_ativos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.ativo == True).all()
        print(f"W-API Sync: Iniciando atualização sequencial para {len(grupos_ativos)} grupos ativos.")

        agora = datetime.now(BR_TZ).replace(tzinfo=None)

        for grupo in grupos_ativos:
            try:
                # Verifica se a extração está desabilitada para o grupo
                if getattr(grupo, 'extrair_contatos', True) is False:
                    print(f"W-API Sync: Extração de contatos DESABILITADA para o grupo '{grupo.nome}'. Pulando.")
                    continue

                # Verifica o intervalo de extração em minutos
                intervalo = getattr(grupo, 'intervalo_extracao_minutos', 30) or 30
                ultima = getattr(grupo, 'ultima_extracao_em', None)
                if ultima:
                    minutos_decorridos = (agora - ultima).total_seconds() / 60.0
                    if minutos_decorridos < intervalo:
                        print(f"W-API Sync: Grupo '{grupo.nome}' extraído há {int(minutos_decorridos)}min (intervalo: {intervalo}min). Pulando.")
                        continue

                print(f"W-API Sync: Processando grupo '{grupo.nome}' ({grupo.id_do_grupo})...")
                
                with httpx.Client(timeout=30.0) as client:
                    participants = fetch_participants(client, WAPI_BASE, instance_id, grupo.id_do_grupo, headers)
                    
                    if participants is None:
                        print(f"W-API Sync: Não foi possível obter participantes para {grupo.nome}.")
                        continue
                    
                    grupo.quantidade_contatos = len(participants)
                    grupo.ultima_extracao_em = agora

                    # Link de convite
                    if not grupo.link_convite:
                        try:
                            params_inv = {"instanceId": instance_id, "groupId": grupo.id_do_grupo}
                            resp_invite = client.get(f"{WAPI_BASE}/group/invite-code", params=params_inv, headers=headers)
                            if resp_invite.status_code != 200:
                                resp_invite = client.get(f"{WAPI_BASE}/group/get-invite-code", params=params_inv, headers=headers)

                            if resp_invite.status_code == 200:
                                data_invite = resp_invite.json()
                                invite_url = data_invite.get("inviteUrl") or data_invite.get("inviteCode") or data_invite.get("code")
                                if invite_url:
                                    if not invite_url.startswith("http"):
                                        invite_url = f"https://chat.whatsapp.com/{invite_url}"
                                    grupo.link_convite = invite_url
                        except Exception as e_invite:
                            print(f"W-API Sync: Erro convite {grupo.nome}: {e_invite}")

                    # Sincroniza contatos
                    db.query(models.ContatoGrupo).filter_by(jid_grupo=grupo.id_do_grupo).update({"no_grupo": False})
                    db.commit()

                    for p in participants:
                        try:
                            p_numero = str(p.get("phone") or p.get("phoneNumber") or p.get("id") or p.get("user") or p.get("number") or "").strip()
                            if not p_numero: continue
                            if "@" in p_numero:
                                p_numero = p_numero.split("@")[0]

                            p_nome = p.get("name") or p.get("short") or p.get("pushname") or p.get("verifiedName") or p.get("notify") or p_numero
                            
                            existe = db.query(models.ContatoGrupo).filter_by(numero=p_numero, jid_grupo=grupo.id_do_grupo).first()
                            if not existe:
                                novo = models.ContatoGrupo(
                                    cliente_id=grupo.cliente_id,
                                    nome=p_nome, numero=p_numero, jid_grupo=grupo.id_do_grupo,
                                    nome_grupo=grupo.nome, no_grupo=True,
                                    extraido_em=datetime.now(BR_TZ).replace(tzinfo=None)
                                )
                                db.add(novo)
                            else:
                                if p_nome: existe.nome = p_nome
                                existe.no_grupo = True
                                if grupo.cliente_id: existe.cliente_id = grupo.cliente_id
                        except Exception as ep:
                            print(f"Erro participante {p.get('id')}: {ep}")
                    
                    # Salva log de sucesso no Histórico
                    log_sucesso = models.LogDisparo(
                        cliente_id=grupo.cliente_id,
                        grupo_nome=grupo.nome,
                        mensagem_corpo=f"Extração de contatos realizada ({len(participants)} contatos encontrados)",
                        status="SUCESSO",
                        tipo="extracao_contatos",
                        criado_em=agora
                    )
                    db.add(log_sucesso)
                    db.commit()
                    import time
                    time.sleep(2)

            except Exception as e:
                print(f"W-API Sync: Falha grupo {grupo.nome}: {e}")
                db.rollback()
                try:
                    log_err = models.LogDisparo(
                        cliente_id=grupo.cliente_id,
                        grupo_nome=grupo.nome,
                        mensagem_corpo="Falha na extração de contatos do grupo",
                        status="ERRO",
                        detalhes_erro=str(e),
                        tipo="extracao_contatos",
                        criado_em=agora
                    )
                    db.add(log_err)
                    db.commit()
                except Exception:
                    db.rollback()

    except Exception as e:
        print(f"W-API Sync: Erro geral: {str(e)}")
