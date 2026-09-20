import os
import httpx
from core.logger import logger

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def enviar_email_codigo_verificacao(
    destinatario_email: str,
    destinatario_nome: str,
    codigo: str,
    tempo_expiracao_minutos: int = 15
) -> bool:
    """
    Envia e-mail transacional contendo o código de 6 dígitos para confirmação de cadastro via Brevo.
    Caso a BREVO_API_KEY não esteja configurada, registra log de aviso em modo simulação (desenvolvimento).
    """
    api_key = os.getenv("BREVO_API_KEY", "").strip()
    sender_email = os.getenv("BREVO_SENDER_EMAIL", "nao-responda@zapgroup.com").strip()
    sender_name = os.getenv("BREVO_SENDER_NAME", "Zap Group").strip()

    if not api_key:
        logger.warning(
            f"[BREVO EMAIL SIMULADO] BREVO_API_KEY não configurada. "
            f"Código de verificação para {destinatario_email}: [{codigo}]"
        )
        return True

    assunto = f"{codigo} é o seu código de confirmação - Zap Group"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0d1117;
                color: #e6edf3;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 540px;
                margin: 40px auto;
                background: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            }}
            .header {{
                text-align: center;
                margin-bottom: 24px;
            }}
            .header h1 {{
                color: #58a6ff;
                font-size: 22px;
                margin: 0 0 8px 0;
            }}
            .header p {{
                color: #8b949e;
                font-size: 14px;
                margin: 0;
            }}
            .code-box {{
                background: rgba(88, 166, 255, 0.08);
                border: 1px dashed #58a6ff;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                margin: 24px 0 16px 0;
                user-select: all;
                -webkit-user-select: all;
                -moz-user-select: all;
                cursor: pointer;
            }}
            .code {{
                font-size: 34px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #58a6ff;
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                user-select: all;
                -webkit-user-select: all;
                -moz-user-select: all;
            }}
            .btn-copy-wrapper {{
                text-align: center;
                margin: 16px 0 24px 0;
            }}
            .btn-copy {{
                display: inline-block;
                background: linear-gradient(135deg, #1f6feb, #238636);
                color: #ffffff !important;
                padding: 12px 26px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 15px;
                text-decoration: none;
                user-select: all;
                -webkit-user-select: all;
                -moz-user-select: all;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(31, 111, 235, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.15);
            }}
            .info {{
                color: #8b949e;
                font-size: 13px;
                line-height: 1.6;
                text-align: center;
            }}
            .footer {{
                margin-top: 32px;
                border-top: 1px solid #30363d;
                padding-top: 16px;
                text-align: center;
                font-size: 12px;
                color: #484f58;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Confirmação de Cadastro</h1>
                <p>Olá, <strong>{destinatario_nome}</strong>! Use o código abaixo para ativar sua conta no Zap Group.</p>
            </div>
            
            <div class="code-box" title="Clique para selecionar e copiar o código">
                <div class="code">{codigo}</div>
            </div>

            <div class="btn-copy-wrapper">
                <div class="btn-copy" title="Clique para selecionar o código de 6 dígitos">
                    📋 Copiar Código: <span style="font-family: monospace; font-size: 16px; letter-spacing: 2px;">{codigo}</span>
                </div>
            </div>
            
            <div class="info">
                <p>Este código expira em <strong>{tempo_expiracao_minutos} minutos</strong>.</p>
                <p>Se você não solicitou este cadastro, ignore esta mensagem com segurança.</p>
            </div>
            
            <div class="footer">
                &copy; Zap Group &bull; Sistema Seguro de Gestão de Grupos
            </div>
        </div>
    </body>
    </html>
    """

    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
                "email": destinatario_email,
                "name": destinatario_nome
            }
        ],
        "subject": assunto,
        "htmlContent": html_content
    }

    headers = {
        "api-key": api_key,
        "accept": "application/json",
        "content-type": "application/json"
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(BREVO_API_URL, json=payload, headers=headers)
            if resp.status_code in [200, 201, 202]:
                logger.info(f"[BREVO EMAIL] Código de confirmação enviado para {destinatario_email} com sucesso.")
                return True
            else:
                logger.error(
                    f"[BREVO EMAIL ERRO] Falha ao enviar e-mail ({resp.status_code}): {resp.text}"
                )
                return False
    except Exception as e:
        logger.error(f"[BREVO EMAIL EXCEÇÃO] Erro de conexão ao enviar para {destinatario_email}: {e}")
        return False
