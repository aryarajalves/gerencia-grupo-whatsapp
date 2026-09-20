import os
import json
import httpx
from core.logger import logger

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

SYSTEM_PROMPT = """Você é um assistente especialista em automação e lançamentos no WhatsApp.
Sua tarefa é ler um roteiro de mensagens em texto livre (que pode conter avisos, horários, dias, mídias e enquetes) e extrair com precisão cada mensagem individual em uma estrutura JSON válida.

Para cada mensagem identificada, produza um objeto com os seguintes campos:
- "dia_do_lancamento": inteiro (ex: 1, 2, 3...). Se não especificado no texto, assuma 1.
- "horario_do_disparo": string no formato "HH:MM" (24h, ex: "09:00", "14:30", "20:00"). Se não especificado, use "12:00".
- "tipo_de_mensagem": um dos seguintes valores: "texto", "imagem", "video", "audio", "arquivo", "enquete".
  * Se o texto mencionar que deve enviar uma foto, imagem ou banner -> "imagem".
  * Se mencionar áudio, gravação de voz -> "audio".
  * Se mencionar vídeo -> "video".
  * Se tiver pergunta com alternativas/opções de votação -> "enquete".
  * Caso contrário -> "texto".
- "mensagem": texto completo da mensagem/copy a ser enviada aos participantes (preservando quebras de linha e emojis).
- "link_midia": string com a URL da mídia caso haja link no texto (ex: https://...), ou string vazia "" se não houver.
- "opcoes_enquete": lista de strings com as opções de voto se for enquete (ex: ["Sim", "Não"]), ou lista vazia [] se não for.
- "etiqueta": string curta categorizando a mensagem (ex: "boas-vindas", "aquecimento", "oferta", "encerramento", "lembrete"), ou null.
- "grupo_identificado": se o texto indicar um grupo específico (ex: "Grupo VIP", "Turma 2"), preencha com o nome ou ID correspondente. Se for para todos ou não mencionar, retorne null.

Retorne SEMPRE um objeto JSON estritamente no seguinte formato:
{
  "mensagens": [
    ...
  ]
}
"""


def parse_roteiro_com_ia(texto: str, grupos_disponiveis: list = None) -> list:
    """
    Processa um texto bruto contendo roteiro de mensagens usando a API da OpenAI.
    Retorna uma lista de dicionários estruturados pronta para pré-visualização e importação.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

    if not api_key or api_key.startswith("sk-proj-sua-chave"):
        raise ValueError("OPENAI_API_KEY não configurada no servidor. Configure uma chave válida no arquivo .env.")

    if not texto or not texto.strip():
        raise ValueError("O texto do roteiro não pode estar vazio.")

    # Contexto opcional dos grupos cadastrados para auxílio da IA
    user_prompt = f"Roteiro de mensagens para processar:\n\n{texto.strip()}\n"
    if grupos_disponiveis and len(grupos_disponiveis) > 0:
        nomes_grupos = ", ".join([f"'{g.get('nome')}' (ID: {g.get('id')})" for g in grupos_disponiveis if g.get('nome')])
        user_prompt += f"\nGrupos disponíveis no sistema para correlação:\n{nomes_grupos}\n"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        with httpx.Client(timeout=45.0) as client:
            resp = client.post(OPENAI_API_URL, json=payload, headers=headers)
            if resp.status_code == 401:
                raise ValueError("Chave da OpenAI inválida ou não autorizada.")
            elif resp.status_code == 429:
                raise ValueError("Limite de requisições ou créditos da OpenAI excedido (Rate Limit / Quota).")
            elif resp.status_code != 200:
                logger.error(f"[OPENAI PARSER] Erro {resp.status_code}: {resp.text}")
                raise ValueError(f"Falha na comunicação com a OpenAI (Status {resp.status_code}).")

            data = resp.json()
            raw_content = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_content)

            mensagens = parsed.get("mensagens", [])
            if not isinstance(mensagens, list):
                mensagens = []

            # Sanitização e normalização básica
            resultado = []
            for idx, msg in enumerate(mensagens, 1):
                tipo = msg.get("tipo_de_mensagem", "texto").lower().strip()
                if tipo not in ["texto", "imagem", "video", "audio", "arquivo", "enquete"]:
                    tipo = "texto"

                dia = msg.get("dia_do_lancamento", 1)
                try:
                    dia = int(dia) if int(dia) >= 1 else 1
                except (ValueError, TypeError):
                    dia = 1

                horario = msg.get("horario_do_disparo", "12:00")
                if not isinstance(horario, str) or ":" not in horario:
                    horario = "12:00"

                corpo = msg.get("mensagem", "").strip()
                link = msg.get("link_midia", "").strip()
                opcoes = msg.get("opcoes_enquete", [])
                if not isinstance(opcoes, list):
                    opcoes = []

                resultado.append({
                    "numero_da_mensagem": idx,
                    "dia_do_lancamento": dia,
                    "horario_do_disparo": horario,
                    "tipo_de_mensagem": tipo,
                    "mensagem": corpo,
                    "link_midia": link,
                    "opcoes_enquete": opcoes,
                    "enquete_multipla": bool(msg.get("enquete_multipla", False)),
                    "etiqueta": msg.get("etiqueta") or None,
                    "grupo_identificado": msg.get("grupo_identificado") or None
                })

            logger.info(f"[OPENAI PARSER] Roteiro processado com sucesso: {len(resultado)} mensagens extraídas.")
            return resultado

    except httpx.RequestError as exc:
        logger.error(f"[OPENAI PARSER] Erro de rede ao contatar OpenAI: {exc}")
        raise ValueError("Não foi possível conectar aos servidores da OpenAI. Verifique a conexão de internet.")
    except json.JSONDecodeError as exc:
        logger.error(f"[OPENAI PARSER] Resposta da OpenAI não é JSON válido: {exc}")
        raise ValueError("A IA não retornou um formato JSON válido. Tente novamente.")
