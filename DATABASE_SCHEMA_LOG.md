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

### [2026-08-01] Configurações de Extração de Contatos por Grupo
- **Tabela Afetada:** `grupos_whatsapp`
- **Colunas Adicionadas:**
  - `extrair_contatos` (BOOLEAN DEFAULT TRUE)
  - `intervalo_extracao_minutos` (INTEGER DEFAULT 30)
  - `ultima_extracao_em` (TIMESTAMP NULL)
- **Script de Migração:** Integrado em `backend/migrations.py`
- **Descrição:** Permite habilitar ou desabilitar a extração de contatos por grupo e definir o intervalo de consulta à W-API em minutos.
