# Log de Alterações do Esquema do Banco de Dados (DATABASE_SCHEMA_LOG.md)

Este arquivo registra todas as alterações na estrutura do banco de dados (tabelas, colunas, índices) para garantir rastreabilidade e permitir replicações limpas em novos ambientes.

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
- **Descrição:** Permite definir individualmente por template se a ação de abrir/fechar o grupo vai também restringir ou liberar a edição das configurações do grupo no WhatsApp.


