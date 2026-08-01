# Arquitetura do Projeto — Gerenciador de Grupo do WhatsApp

## Visão Geral

Sistema SaaS de gestão de grupos WhatsApp com disparo automático de mensagens em ciclos semanais. Composto por backend FastAPI (Python) + frontend React + PostgreSQL + Redis + S3.

---

## Backend (`backend/`)

### Arquivos Raiz

| Arquivo | Responsabilidade |
|---------|-----------------|
| `main.py` | Inicialização FastAPI: CORS, middlewares, rate limiting, security headers, handler global de exceções, startup events, registro de todos os routers |

| `models.py` | Todos os modelos SQLAlchemy: GrupoWhatsApp, MensagemDisparada, GrupoMensagem (N:N), LogDisparo, Usuario, Configuracao, MensagemCapturada, ContatoGrupo, ConjuntoGrupo, GrupoConjuntoAssociacao, Invitation |

| `schemas.py` | Schemas Pydantic de validação de entrada/saída para todos os endpoints |

| `database.py` | Engine PostgreSQL, SessionLocal, Base declarativa, função `get_db()` para dependency injection |
| `security.py` | Hash bcrypt, geração/validação JWT (24h), validação de API Key via header `x-api-key`, verificação de cargo |
| `scheduler.py` | APScheduler: job de disparo a cada minuto + job diário de avanço de ciclos |
| `migrations.py` | Sincronização automática de schema no startup (aguarda PostgreSQL ficar disponível) |
| `s3_helper.py` | Upload de arquivos para Backblaze B2 via SDK S3 compatível |

### Routers (`backend/routers/`)

| Arquivo | Prefixo | Responsabilidade |
|---------|---------|-----------------|
| `users.py` | `/login`, `/usuarios/`, `/convite`, `/registrar`, `/resetar-senha` | Autenticação, CRUD de usuários, geração e validação de convites/reset |
| `groups.py` | `/grupos/`, `/wapi/grupos/` | CRUD de grupos, busca grupos na W-API, associação de mensagens a grupos |
| `messages.py` | `/mensagens/` | CRUD de mensagens agendadas com upload de mídia |
| `group_sets.py` | `/conjuntos/` | CRUD de conjuntos (funnels), reordenação, limite de leads por grupo |
| `logs.py` | `/logs/` | Consulta paginada de logs de disparo com filtros e exclusão em batch |
| `contacts.py` | `/contatos/` | Lista paginada de contatos com filtros e export CSV |
| `dashboard.py` | `/dashboard/stats`, `/whatsapp/status` | Métricas do sistema, status e plano da W-API |
| `config.py` | `/config/` | CRUD de configurações key-value do sistema (apenas SUPER_ADMIN) |
| `media.py` | `/upload/` | Upload de arquivos (máx 16MB), converte áudio webm → ogg, salva no S3 |
| `webhooks.py` | `/webhook/whatsapp` | Recepção de eventos da W-API, captura e persiste mensagens e mídias |
| `capture.py` | `/captura/` | Mensagens capturadas, envio manual via chat, revogar mensagem (PRO) |
| `redirect.py` | `/join/{slug}` | Redirecionamento público de leads para grupos do conjunto correto |

### Services (`backend/services/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `message_service.py` | Monta payload por tipo de mensagem e faz POST na W-API, registra LogDisparo |
| `sync_service.py` | Verifica conexão do WhatsApp na W-API, atualiza contagem de contatos dos grupos, detecta plano LITE/PRO |
| `cycle_service.py` | Avança `dia_lancamento_atual` diariamente com base em `dia_inicio_semana` e `dia_fim_semana` |

### Core (`backend/core/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `logger.py` | Logger centralizado com RotatingFileHandler (10MB, 5 backups) em `data/logs/app.log` + console |
| `wapi.py` | Constante `WAPI_BASE`, `ENDPOINT_MAP` (tipo → endpoint W-API), helpers de header/instância/config |

---

## Frontend (`frontend/src/`)

### Pages

| Arquivo | Responsabilidade |
|---------|-----------------|
| `Login.jsx` | Formulário de login, salva JWT no localStorage |
| `Dashboard.jsx` | Métricas: grupos, disparos, taxa de sucesso, próximos disparos |
| `Groups/index.jsx` | CRUD de grupos, busca JID na W-API, modal de associação de mensagens |
| `Users/index.jsx` | Gestão de usuários (SUPER_ADMIN): convites, reset de senha, ativar/inativar |
| `Scheduling/index.jsx` | CRUD de mensagens agendadas: tipo, dia do ciclo, horário, upload de mídia |
| `Contacts.jsx` | Lista paginada de contatos com filtros e export CSV |
| `Logs.jsx` | Histórico de disparos com filtros, paginação e exclusão em batch |
| `GroupSets.jsx` | CRUD de conjuntos (funnels), reordenação drag-and-drop, max_leads por grupo |
| `Capture.jsx` | Mensagens capturadas via webhook, URL do webhook para configurar na W-API |
| `Settings.jsx` | Configuração de WAPI_TOKEN, WAPI_INSTANCE_ID e logo da empresa |
| `Chat/index.jsx` | Chat ao vivo: sidebar de grupos, histórico, envio de texto/arquivo/áudio |
| `Register.jsx` | Registro de novo usuário via token de convite |
| `SetupProfile.jsx` | Redefinição de senha via token de reset |

### Components (`frontend/src/components/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `layout/Sidebar.jsx` | Menu lateral com navegação, nome/cargo do usuário, logo da empresa |
| `common/ConfirmModal.jsx` | Modal de confirmação genérico (usado em todas as deleções) |
| `common/ModalPortal.jsx` | Portal React para renderizar modais fora da árvore DOM principal |
| `common/LogoutModal.jsx` | Modal de confirmação de logout |

### Hooks

| Arquivo | Responsabilidade |
|---------|-----------------|
| `hooks/useGroups.js` | Estados e lógica de CRUD de grupos + sincronização com W-API |
| `hooks/useScheduling.js` | Estados e lógica de CRUD de mensagens agendadas + upload |
| `hooks/useCopy.js` | Copiar texto para clipboard com feedback visual temporário |
| `pages/Chat/hooks/useChat.js` | Estados e lógica do chat ao vivo: mensagens, grupos, gravação, envio |
| `pages/Users/hooks/useUsers.js` | Estados e lógica de gestão de usuários |

### Services & Utils

| Arquivo | Responsabilidade |
|---------|-----------------|
| `services/api.js` | Instância axios com JWT no header, interceptador de logout em 401 |
| `utils/constants.js` | `TIPO_CONFIG` (tipo → label/ícone/cor), `DIAS_SEMANA` |
| `utils/toastPlano.js` | Toast customizado para bloqueio de recurso PRO |

### Entry Points

| Arquivo | Responsabilidade |
|---------|-----------------|
| `App.jsx` | Raiz da aplicação: estado de autenticação, roteamento por `activeTab`, gerencia confirmModal global |
| `main.jsx` | Monta App no `#root` com StrictMode |

---

## Infraestrutura (`docker/`)

| Serviço | Descrição |
|---------|-----------|
| `postgres` | Banco de dados principal |
| `redis` | Rate limiting via slowapi |
| `backend` | FastAPI na porta 8000 |
| `frontend` | React (Vite) na porta 5176 |
| `tunnel` | Cloudflare Tunnel (dev) / Traefik (prod) |
