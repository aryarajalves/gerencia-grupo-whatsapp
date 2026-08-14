import os
import re
import json
import httpx
import pytz
from datetime import datetime
from sqlalchemy.orm import Session
from core.logger import logger
import models

BR_TZ = pytz.timezone('America/Sao_Paulo')

def _classificacao_heuristica_fallback(texto: str) -> dict:
    """
    Fallback heurístico caso a OpenAI API Key não esteja configurada ou ocorra erro de rede.
    """
    texto_lower = texto.lower()
    
    # Detecção de links
    link_patterns = [r'https?://', r'wa\.me/', r't\.me/', r'chat\.whatsapp\.com/']
    tem_link = any(re.search(pat, texto_lower) for pat in link_patterns)
    
    # Palavras de abordagem de vendas e pesca de leads
    palavras_venda = [
        'desconto', 'vaga', 'mentoria', 'curso', 'oportunidade', 'pix', 'comprar', 
        'oferta', 'promoção', 'acesso', 'grupo vip', 'meu produto', 'sou da equipe',
        'suporte oficial', 'link de pagamento', 'fazer uma pergunta sobre', 'vi você no grupo'
    ]
    tem_palavra_venda = any(palavra in texto_lower for palavra in palavras_venda)

    if tem_link and tem_palavra_venda:
        return {
            "e_venda_ou_prospeccao": True,
            "tipo_infracao": "VENDA_CONCORRENTE",
            "grau_risco": "ALTO",
            "resumo_motivo": "Mensagem contém link externo e termos característicos de oferta/venda."
        }
    elif tem_link:
        return {
            "e_venda_ou_prospeccao": True,
            "tipo_infracao": "SPAM_LINKS",
            "grau_risco": "MEDIO",
            "resumo_motivo": "Mensagem privada não solicitada contendo link."
        }
    elif tem_palavra_venda:
        return {
            "e_venda_ou_prospeccao": True,
            "tipo_infracao": "PROSPECCAO_DIRETA",
            "grau_risco": "MEDIO",
            "resumo_motivo": "Abordagem com termos típicos de prospecção/pesca de leads."
        }
    
    return {
        "e_venda_ou_prospeccao": False,
        "tipo_infracao": "CONVERSA_COMUM",
        "grau_risco": "BAIXO",
        "resumo_motivo": "Nenhum padrão evidente de venda detectado no texto."
    }

def analisar_mensagem_fantasma(
    texto_mensagem: str, 
    nome_grupo: str = "", 
    remetente_info: str = "",
    modelo_openai: str = None
) -> dict:
    """
    Analisa a mensagem privada recebida pelo Número Fantasma utilizando a OpenAI.
    """
    openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
    active_model = (modelo_openai or "gpt-4o-mini").strip()

    if not openai_api_key or openai_api_key.startswith("sk-proj-sua-chave"):
        logger.info("[GHOST AI] OPENAI_API_KEY não configurada. Usando heurística padrão.")
        return _classificacao_heuristica_fallback(texto_mensagem)

    system_prompt = (
        "Você é um sentinela de segurança especialista em grupos de WhatsApp e lançamentos digitais. "
        "Sua tarefa é analisar mensagens privadas recebidas por um 'Número Fantasma' (membro comum disfarçado no grupo) "
        "e identificar se o remetente está tentando vender produtos concorrentes, prospectar leads, aplicar golpes se "
        "passando pela equipe, enviar links de afiliados ou praticar 'pesca no aquário' (roubar contatos do grupo).\n\n"
        "Retorne OBRIGATORIAMENTE um JSON puro (sem markdown ou blocos ```json) com a seguinte estrutura:\n"
        "{\n"
        '  "e_venda_ou_prospeccao": true ou false,\n'
        '  "tipo_infracao": "PROSPECCAO_DIRETA" | "VENDA_CONCORRENTE" | "GOLPE_SUPORTE" | "SPAM_LINKS" | "CONVERSA_COMUM",\n'
        '  "grau_risco": "ALTO" | "MEDIO" | "BAIXO",\n'
        '  "resumo_motivo": "Explicação concisa em português (máx 120 caracteres)"\n'
        "}"
    )

    user_content = (
        f"Grupo de Origem: {nome_grupo or 'Desconhecido'}\n"
        f"Remetente: {remetente_info or 'Desconhecido'}\n"
        f"Mensagem Privada Recebida:\n\"\"\"\n{texto_mensagem}\n\"\"\""
    )

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openai_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": active_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, json=payload, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                raw_content = data["choices"][0]["message"]["content"]
                result = json.loads(raw_content)
                logger.info(f"[GHOST AI] Análise OpenAI concluída: {result}")
                return result
            else:
                logger.error(f"[GHOST AI] Erro na API OpenAI ({resp.status_code}): {resp.text}")
                return _classificacao_heuristica_fallback(texto_mensagem)

    except Exception as e:
        logger.error(f"[GHOST AI] Exceção ao chamar OpenAI: {e}")
        return _classificacao_heuristica_fallback(texto_mensagem)

def processar_mensagem_privada_fantasma(
    db: Session,
    sender_number: str,
    sender_name: str,
    msg_body: str,
    cid: str = None,
    instance_id: str = None
):
    """
    Verifica se a mensagem privada recebida veio de um participante de algum grupo monitorado com Número Fantasma ativo.
    Caso positivo, analisa com IA e registra alerta no histórico.
    """
    if not sender_number or not msg_body:
        return

    # Normaliza apenas números para busca
    clean_sender = re.sub(r'\D', '', sender_number)
    if not clean_sender:
        return

    # 1. Busca todos os grupos com Número Fantasma ATIVO para o cliente
    query_grupos = db.query(models.GrupoWhatsApp).filter(models.GrupoWhatsApp.numero_fantasma_ativo == True)
    if cid:
        query_grupos = query_grupos.filter(models.GrupoWhatsApp.cliente_id == cid)
    
    grupos_fantasma = query_grupos.all()
    if not grupos_fantasma:
        return

    grupos_jids = [g.id_do_grupo for g in grupos_fantasma]
    map_grupos = {g.id_do_grupo: g for g in grupos_fantasma}

    # 2. Busca se o contato pertence a algum desses grupos
    contatos_encontrados = db.query(models.ContatoGrupo).filter(
        models.ContatoGrupo.jid_grupo.in_(grupos_jids),
        models.ContatoGrupo.numero.ilike(f"%{clean_sender}%")
    ).all()

    if not contatos_encontrados:
        return

    # Busca modelo da OpenAI configurado no banco
    cfg_model = db.query(models.Configuracao).filter(models.Configuracao.chave == "OPENAI_MODEL").first()
    modelo_openai = cfg_model.valor if cfg_model and cfg_model.valor else "gpt-4o-mini"

    # 3. Para cada grupo onde o contato foi encontrado, aciona a IA
    for contato in contatos_encontrados:
        grupo = map_grupos.get(contato.jid_grupo)
        if not grupo:
            continue

        nome_contato = contato.nome or sender_name or "Desconhecido"
        
        logger.info(f"[GHOST SENTINELA] Contato {clean_sender} do grupo '{grupo.nome}' enviou mensagem no privado do Fantasma. Analisando com modelo {modelo_openai}...")
        
        resultado_ia = analisar_mensagem_fantasma(
            texto_mensagem=msg_body,
            nome_grupo=grupo.nome,
            remetente_info=f"{nome_contato} ({clean_sender})",
            modelo_openai=modelo_openai
        )

        # Se for classificado como tentativa de venda, prospecção ou risco alto/médio
        if resultado_ia.get("e_venda_ou_prospeccao") or resultado_ia.get("grau_risco") in ["ALTO", "MEDIO"]:
            tipo_infracao = resultado_ia.get("tipo_infracao", "PROSPECCAO_DETECTADA")
            motivo = resultado_ia.get("resumo_motivo", "Tentativa de venda ou abordagem não autorizada no privado.")
            risco = resultado_ia.get("grau_risco", "ALTO")

            corpo_alerta = (
                f"🚨 [ALERTA SENTINELA - PESCA DE LEADS DETECTADA]\n"
                f"• Invasor: {nome_contato} (+{clean_sender})\n"
                f"• Grupo de Origem: {grupo.nome}\n"
                f"• Classificação IA: {tipo_infracao} (Risco: {risco})\n"
                f"• Diagnóstico: {motivo}\n"
                f"• Mensagem Privada:\n\"{msg_body}\""
            )

            log_alerta = models.LogDisparo(
                cliente_id=cid or grupo.cliente_id,
                tipo="fantasma_pesca_leads",
                status="ALERTA",
                grupo_nome=grupo.nome,
                mensagem_corpo=corpo_alerta,
                detalhes_erro=f"IA: {tipo_infracao} - {motivo}",
                criado_em=datetime.now(BR_TZ).replace(tzinfo=None)
            )

            db.add(log_alerta)
            db.commit()
            logger.warning(f"[GHOST SENTINELA] ALERTA REGISTRADO: Invasor {clean_sender} detectado no grupo {grupo.nome}.")
