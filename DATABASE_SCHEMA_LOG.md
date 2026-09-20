# Log de Alterações do Esquema do Banco de Dados (DATABASE_SCHEMA_LOG.md)

Este arquivo registra todas as alterações na estrutura do banco de dados (tabelas, colunas, índices) para garantir rastreabilidade e permitir replicações limpas em novos ambientes.

---

### [2026-08-28] Tabela de Verificação de E-mails e Códigos de Registro (Brevo)
- **Tabela Adicionada:** `email_verifications`
  - `id` (GUID / Primary Key)
  - `email` (VARCHAR, Index)
  - `codigo` (VARCHAR, Index) — Código de 6 dígitos para validação
  - `nome` (VARCHAR)
  - `senha_hash` (TEXT) — Senha hasheada com Argon2id
  - `cargo` (VARCHAR)
  - `token_convite` (VARCHAR, Index)
  - `expira_em` (TIMESTAMP) — Validade do código (15 min)
  - `usado` (BOOLEAN DEFAULT FALSE)
  - `criado_em` (TIMESTAMP)
- **Script de Migração:** `backend/scripts/add_email_verifications_table.py` e integrado em `backend/migrations.py`.
- **Descrição:** Armazena temporariamente os dados de pré-cadastro e o código de 6 dígitos disparado via Brevo para validar se o e-mail é real e ativar a conta.

---

### [2026-08-15] Escopo de Webhook de Enquete e Seleção de Enquetes Específicas
- **Tabelas Afetadas:**
  - `grupos_whatsapp`: 
    - `webhook_enquete_modo` (VARCHAR(50) DEFAULT 'todas') — Define se dispara para `todas` as enquetes do grupo ou apenas para `selecionadas` (enquetes programadas marcadas).
    - `webhook_enquete_ids` (TEXT NULL) — Lista em JSON com os IDs das mensagens de enquetes programadas autorizadas para este grupo.
  - `mensagens_disparadas`: `webhook_enquete_ativo` (BOOLEAN DEFAULT TRUE) — Define individualmente se as respostas de uma enquete agendada devem ser disparadas para o webhook.
- **Script de Migração:** `backend/scripts/add_webhook_enquete_ids_column.py` e integrado em `backend/migrations.py`.
- **Descrição:** Permite selecionar na aba do grupo exatamente quais enquetes programadas disparam para o webhook.

---

### [2026-08-15] Webhook de Respostas de Enquetes por Grupo
- **Tabela Afetada:** `grupos_whatsapp`
- **Colunas Adicionadas:**
  - `webhook_enquete_ativo` (BOOLEAN DEFAULT FALSE) — Toggle para ativar ou desativar o envio de votos/respostas de enquetes para um webhook externo.
  - `webhook_enquete_url` (TEXT NULL) — URL externa para receber dados dos votos de enquetes via HTTP POST.
  - `webhook_enquete_delay_segundos` (INTEGER DEFAULT 0) — Tempo de espera/debounce em segundos antes do disparo para consolidar alterações de votos e enviar apenas a mais recente.
- **Script de Migração:** `backend/scripts/add_webhook_enquete_columns.py` e integrado em `backend/migrations.py`.
- **Descrição:** Permite que cada grupo configure um webhook dedicado para receber em tempo real os votos e respostas de enquetes com debounce configurável.

---

### [2026-08-14] Ativação de Número Fantasma por Grupo
- **Tabela Afetada:** `grupos_whatsapp`
- **Coluna Adicionada:**
  - `numero_fantasma_ativo` (BOOLEAN DEFAULT FALSE) — Toggle para ativar ou desativar o monitoramento pelo Número Fantasma para o grupo específico.
- **Script de Migração:** `backend/scripts/add_numero_fantasma_grupo_column.py` e integrado em `backend/migrations.py`.
- **Descrição:** Permite que o monitoramento do Número Fantasma seja ligado ou desligado individualmente em cada grupo.

---

### [2026-08-01] Migração de Multi-Tenancy (Isolamento por Cliente)
- **Tabelas Afetadas:**
  - `grupos_whatsapp`
  - `mensagens_disparadas`
  - `logs_disparos`
  - `mensagens_capturadas`
  - `contatos_grupos`
  - `conjuntos_grupos`
- **Coluna Adicionada:** `cliente_id` (GUID / VARCHAR(36), ForeignKey em `clientes.id`, Index)
- **Script de Migração:** `backend/scripts/add_cliente_id_multi_tenancy.py`
- **Descrição:** Garante que todos os dados operacionais pertençam exclusivamente a um Cliente/Instância. Registros legados existentes foram associados ao Cliente padrão ativo.

---

### [2026-08-01] Rastreamento de Envio de Webhook por Contato
- **Tabela Afetada:** `contatos_grupos`
- **Colunas Adicionadas:**
  - `webhook_enviado` (BOOLEAN DEFAULT FALSE) — Indica se o contato já foi despachado com sucesso para o webhook do grupo
  - `webhook_enviado_em` (TIMESTAMP NULL) — Timestamp de quando o webhook foi disparado para este contato
- **Script de Migração:** `backend/scripts/add_webhook_enviado_column.py`
- **Descrição:** Garante que contatos que foram extraídos do WhatsApp antes da configuração do webhook (ou cuja tentativa anterior de webhook falhou) sejam identificados e enviados apenas 1 vez quando a extração for executada.

---

### [2026-08-01] Webhook de Extração de Contatos por Grupo
- **Tabela Afetada:** `grupos_whatsapp`
- **Coluna Adicionada:**
  - `webhook_extracao_url` (TEXT NULL) — URL externa para receber dados de novos contatos extraídos via POST
- **Script de Migração:** `backend/scripts/add_webhook_extracao_url.py`
- **Descrição:** Quando preenchida, a cada extração de contatos, cada contato novo (recém-inserido no banco) é enviado via HTTP POST para esta URL com payload: `{nome, numero, grupo, grupo_jid, extraido_em}`. Falhas no webhook são apenas logadas e não interrompem a extração.

---

### [2026-08-01] Configurações de Extração de Contatos por Grupo
- **Tabela Afetada:** `grupos_whatsapp`
- **Colunas Adicionadas:**
  - `extrair_contatos` (BOOLEAN DEFAULT TRUE)
  - `intervalo_extracao_minutos` (INTEGER DEFAULT 30)
  - `ultima_extracao_em` (TIMESTAMP NULL)
- **Script de Migração:** Integrado em `backend/migrations.py`
- **Descrição:** Permite habilitar ou desabilitar a extração de contatos por grupo e definir o intervalo de consulta à W-API em minutos.

---

### [2026-08-02] Simulação de Tempo Digitando por Grupo
- **Tabela Afetada:** `grupos_whatsapp`
- **Coluna Adicionada:**
  - `tempo_digitando_segundos` (INTEGER DEFAULT 0) — Tempo em segundos (0=desabilitado, 1-60s) que o bot exibe "digitando..." antes de disparar a mensagem
- **Script de Migração:** `backend/scripts/add_tempo_digitando.py` e integrado em `backend/migrations.py`
- **Descrição:** Permite configurar no grupo por quanto tempo o bot simula o status `composing` (digitando) via W-API antes do envio de cada mensagem.

---

### [2026-08-03] Permissão de Edição de Configurações do Grupo no Template Status/Abrir/Fechar
- **Tabela Afetada:** `mensagens_disparadas`
- **Coluna Adicionada:**
  - `admin_only_settings` (BOOLEAN NULL) — Define se a alteração do status do grupo deve também ajustar a permissão de quem pode editar o grupo (`True`=Apenas admins, `False`=Todos os participantes, `NULL`=Manter estado atual)
- **Script de Migração:** `backend/add_admin_only_settings_column.py`

---

### [2026-08-11] Suporte a Etiqueta / Tag em Mensagens Disparadas
- **Tabela Afetada:** `mensagens_disparadas`
- **Coluna Adicionada:**
  - `etiqueta` (VARCHAR(50) NULL) — Identificador textual/etiqueta opcional para categorizar a mensagem (Ex: Oferta, Lembrete, Conteúdo)
- **Script de Migração:** Integrado em `backend/migrations.py`
- **Descrição:** Permite associar uma etiqueta/tag às mensagens agendadas e realizar filtragens dinâmicas no Roteiro de Mensagens.

---

### [2026-08-11] Identificação de Cargo do Participante (Admin vs Membro)
- **Tabela Afetada:** `contatos_grupos`
- **Coluna Adicionada:**
  - `is_admin` (BOOLEAN DEFAULT FALSE) — Indica se o contato é administrador ou superadministrador do grupo no WhatsApp
- **Script de Migração:** Integrado em `backend/migrations.py`
- **Descrição:** Permite identificar se o contato extraído é administrador do grupo, filtrá-lo no backend/frontend e exportar seu cargo no CSV.

---

### [2026-08-13] Lista de Segurança, Status Fechado e Remoção Automática de Impostores
- **Tabela Afetada:** `grupos_whatsapp`
- **Colunas Adicionadas:**
  - `adms_permitidos` (TEXT NULL) — Lista de números ou JIDs dos administradores autorizados do grupo (separados por vírgula)
  - `seguranca_adms_ativa` (BOOLEAN DEFAULT FALSE) — Toggle que liga/desliga a proteção da lista de segurança por grupo
  - `status_grupo_fechado` (BOOLEAN NULL) — Armazena o estado atual do grupo (True=Apenas admins enviam msgs [fechado], False=Todos enviam msgs [aberto])
  - `remover_impostor_msg` (BOOLEAN DEFAULT TRUE) — Define se participantes não autorizados que enviem mensagens com o grupo fechado devem ser removidos
  - `msg_remocao_impostor` (TEXT NULL) — Template customizável de aviso enviado no grupo após a remoção (suporta a tag `{numero}`)
- **Script de Migração:** Integrado em `backend/migrations.py`
- **Descrição:** Em grupos fechados com segurança ativa, mensagens enviadas por quem não está na lista de admins disparam a deleção da mensagem, remoção do participante da sala, envio de alerta no grupo e log de auditoria.
