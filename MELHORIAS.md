# Melhorias Pendentes — Gerenciador de Grupo do WhatsApp

> Este arquivo lista funcionalidades planejadas e melhorias identificadas no projeto. Cada item descreve o que precisa ser feito, por que é necessário e como implementar.

---

## 🔴 Alta Prioridade

---

### ✅ 1. Tipo de Ciclo: Semanal vs Único — IMPLEMENTADO (2026-05-09)

**O que foi feito:**
- `backend/models.py`: coluna `tipo_ciclo` adicionada ao model `GrupoWhatsApp`.
- `backend/scripts/add_tipo_ciclo.py`: script de migração criado e executado.
- `backend/DATABASE_SCHEMA_LOG.md`: entrada registrada.
- `backend/schemas.py`: campo `tipo_ciclo: str = "semanal"` adicionado ao schema base.
- `backend/services/cycle_service.py`: ao encerrar o ciclo, grupos `unico` recebem `ativo = False` e não reiniciam na semana seguinte.
- `frontend/src/hooks/useGroups.js`: estado inicial, reset e `startEdit` incluem `tipo_ciclo`.
- `frontend/src/pages/Groups/components/GroupForm.jsx`: radio buttons visuais "Semanal / Único" adicionados ao formulário.
- `frontend/src/pages/Groups/components/GroupsTable.jsx`: badge "Semanal" (azul) ou "Único" (âmbar) exibido na coluna Ciclo.

---

### ✅ 2. Notificação de Falha Definitiva de Mensagem — IMPLEMENTADO (2026-05-09)

**O que é:**
Quando uma mensagem falha 10x no mesmo dia para o mesmo grupo, o sistema para de tentar — mas o admin não é notificado. A falha fica invisível.

**Por que é necessário:**
O admin pode ficar dias sem saber que um grupo não está recebendo mensagens, prejudicando o lançamento dos seus clientes.

**Comportamento definido (2026-05-09):**
- O alerta aparece **somente no Dashboard** como um card de atenção.
- O alerta **nunca desaparece automaticamente** — nem após reenvio bem-sucedido.
- O admin precisa clicar em **"Dispensar"** para arquivar o alerta explicitamente.
- A página de Logs exibe o log normalmente (status + motivo do erro) com botão "Tentar novamente", mas sem card/banner especial.

**Como implementar:**

1. **`backend/scheduler.py`:** Ao atingir 10 erros, registrar log com status `"FALHA_DEFINITIVA"` e motivo detalhado do último erro.
2. **`backend/routers/logs.py`:** Criar endpoint `POST /logs/{id}/retentar` que chama `enviar_wapi()` diretamente com a mensagem e grupo do log.
3. **`backend/routers/dashboard.py`:** Incluir campo `falhas_definitivas` no endpoint `/dashboard/stats` listando logs com status `FALHA_DEFINITIVA` que ainda não foram dispensados (`dispensado = False`).
4. **`backend/models.py`:** Adicionar coluna `dispensado: Boolean = False` no model `LogDisparo`.
5. **`backend/routers/logs.py`:** Criar endpoint `PATCH /logs/{id}/dispensar` que seta `dispensado = True`.
6. **`frontend/src/pages/Dashboard.jsx`:** Exibir card de alerta vermelho com cada falha definitiva não dispensada, mostrando grupo, mensagem e motivo. Botão "Dispensar" em cada card.
7. **`frontend/src/pages/Logs.jsx`:** Exibir `detalhes_erro` de forma legível e botão "Tentar novamente" nas linhas com status `Erro` ou `FALHA_DEFINITIVA`.

---

### ✅ 3. Modelo de Associação de Mensagens — IMPLEMENTADO (2026-05-09)

**O que foi feito:**
- `backend/scheduler.py`: agora utiliza apenas as mensagens explicitamente associadas a cada grupo na tabela `grupo_mensagens`. O comportamento legado de "receber tudo" foi removido.
- `backend/routers/groups.py`: adicionado campo `total_mensagens` no retorno da listagem de grupos.
- `frontend/src/pages/Groups/components/GroupsTable.jsx`: implementado alerta visual (badge "SEM CONTEÚDO") para grupos ativos que não possuem nenhuma mensagem associada.

**Nota:** Conforme decisão do usuário, não foi criado script de migração automática para grupos antigos. A associação deve ser feita manualmente via interface.

---

---

### ✅ 3b. Verificação de Plano PRO no Disparo de Enquetes — IMPLEMENTADO (2026-05-09)

**O que é:**
O scheduler dispara mensagens do tipo `enquete` sem verificar se o usuário tem plano PRO. No plano LITE, a W-API rejeita a requisição mas o sistema tenta mesmo assim, gerando logs de erro.

**Como implementar:**

1. **`backend/scheduler.py`:** Antes de disparar uma mensagem do tipo `enquete`, consultar `WHATSAPP_PLAN_TYPE` no banco e pular o disparo com log explicativo se for LITE.
2. **`frontend/src/pages/Scheduling/`:** Ao criar/editar mensagem do tipo enquete, verificar `waStatus.plan_type` e exibir `toastPlanoInsuficiente` se for LITE, bloqueando o salvamento.

---

## 🟡 Média Prioridade

---

### ✅ 4. Horário de Silêncio (Não Disparar à Noite) — IMPLEMENTADO (2026-05-09)

**O que foi feito:**
- `backend/scripts/add_silence_hours.py`: script de migração adicionado para criar chaves `SILENCE_HOURS_ENABLED`, `SILENCE_HOURS_START` e `SILENCE_HOURS_END`.
- `backend/scheduler.py`: lógica adicionada para verificar o horário atual contra a janela de silêncio antes de processar qualquer disparo. Suporta janelas que cruzam a meia-noite (ex: 22h às 08h).
- `frontend/src/pages/Settings.jsx`: interface adicionada com toggle de ativação e seletores de horário.

---

### ✅ 5. Alerta de Conjunto Quase Cheio [CONCLUÍDO] ✅

**O que é:**
Exibir um alerta visual no Dashboard quando um Conjunto de Grupos estiver com mais de 80% da sua capacidade total preenchida (soma dos leads de todos os grupos do conjunto).

**Implementação:**
- Backend (`routers/dashboard.py`): Cálculo em tempo real da soma de leads vs capacidade máxima de cada conjunto.
- Frontend (`Dashboard.jsx`): Banner dinâmico com barra de progresso e indicadores de cor (Amarelo >= 80%, Vermelho >= 100%).
- Redirecionamento automático: Quando atinge 100%, o link do conjunto redireciona para a página de esgotamento.

---

### 6. Contextos React (Refatoração de Estado Global)

**O que é:**
O estado global está concentrado no `App.jsx` e passado via props. Conforme o projeto cresce, isso dificulta a manutenção.

**Por que é necessário:**
Evitar prop drilling em componentes profundos e facilitar o acesso a dados globais sem depender de `App.jsx`.

**Como implementar:**

Criar os seguintes contextos em `frontend/src/contexts/`:
- `AuthContext.jsx` — `isLoggedIn`, `userRole`, `userName`, funções de login/logout.
- `WaStatusContext.jsx` — `waStatus` (status + plan_type), polling a cada 60s.
- `CompanyContext.jsx` — `companyInfo` (logo, nome da empresa).

Cada contexto exporta um Provider e um hook customizado (ex: `useWaStatus()`).

---

## 🟢 Baixa Prioridade

---

### 7. Versionamento de API

**O que é:**
As rotas da API não têm prefixo de versão (ex: `/api/v1/`). Hoje todas as rotas são diretamente `/grupos/`, `/mensagens/`, etc.

**Por que é necessário:**
Sem versionamento, qualquer mudança breaking na API exige atualizar todos os clientes (frontend, integrações n8n) ao mesmo tempo.

**Como implementar:**

1. Adicionar prefixo `/api/v1` em todos os `app.include_router()` no `backend/main.py`.
2. Atualizar `frontend/src/services/api.js` para usar o novo prefixo.
3. Manter as rotas antigas funcionando por um período de transição (deprecated).

---

### 8. Retenção Configurável de Mensagens Capturadas

**O que é:**
Adicionar um dropdown nas Configurações para o admin escolher por quanto tempo as mensagens capturadas pelo webhook são mantidas no banco: 7 dias, 14 dias, 30 dias ou Ilimitado.

**Como implementar:**

1. **`backend/routers/config.py`:** A chave `RETENCAO_MENSAGENS_DIAS` já segue o padrão de configurações existente. Aceitar os valores: `"7"`, `"14"`, `"30"`, `"ilimitado"`.
2. **`backend/scheduler.py`:** Criar job diário que lê `RETENCAO_MENSAGENS_DIAS` e:
   - Busca registros de `MensagemCapturada` com `criado_em` mais antigo que o limite.
   - Para cada registro com `media_url` apontando para o S3, deleta o arquivo do S3 via `s3_helper.py`.
   - Deleta o registro do banco.
   - Ignorar tudo se `"ilimitado"`.
3. **`frontend/src/pages/Settings.jsx`:** Adicionar dropdown com as 4 opções dentro do card de configurações existente.

---

### 9. Backup Automático do Banco de Dados

**O que é:**
Criar um mecanismo de backup automático do PostgreSQL para proteger os dados do cliente em caso de falha do servidor.

**Referência:** O arquivo `DATABASE_SCHEMA.md` na raiz do projeto documenta todas as tabelas e colunas para facilitar scripts de restauração.

**Como implementar:**

1. **Script de backup:** Criar script `docker/backup.sh` que executa `pg_dump` do container postgres e salva o arquivo compactado com timestamp no S3 (usando as mesmas credenciais do `s3_helper.py`).
2. **Agendamento:** Adicionar serviço `backup` no `docker-compose.prod.yml` com cron diário (ex: `0 3 * * *` — 3h da manhã).
3. **Retenção de backups:** Manter os últimos 30 arquivos de backup no S3, deletar os mais antigos automaticamente.
4. **Documentar no `.env.example`:** Adicionar variável `BACKUP_S3_PATH` para configurar o prefixo do caminho no S3 (ex: `backups/`).

---

### 10. Política de Limpeza do S3

**O que é:**
Arquivos de mídia enviados e capturados são armazenados indefinidamente no Backblaze B2. Não há nenhuma política de expiração ou limpeza.

**Por que é necessário:**
O custo de armazenamento cresce continuamente. Arquivos de capturas antigas provavelmente não precisam ser mantidos para sempre.

**Como implementar:**

1. Definir com o dono do projeto por quanto tempo manter arquivos de captura (ex: 90 dias).
2. Criar job no scheduler para deletar arquivos do S3 com mais de X dias.
3. Adicionar configuração `DIAS_RETENCAO_MIDIA` na tabela `Configuracao`.

---

## 📋 Perguntas em Aberto (bloqueiam implementação)

Antes de implementar os itens acima, as seguintes decisões precisam ser tomadas:

- [x] **Item 2:** Notificação no histórico de logs com motivo da falha + botão "Tentar novamente". ✅
- [x] **Item 3:** Todos os grupos devem ter associações explícitas. O comportamento legado deve ser removido. Grupos existentes sem associações precisam ser migrados. ✅
- [x] **Item 4:** Horário de silêncio configurável globalmente em Configurações. ✅
- [ ] **Item 8:** Por quantos dias manter arquivos de mídia capturados?
