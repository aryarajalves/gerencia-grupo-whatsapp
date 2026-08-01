# Log de Alterações no Esquema do Banco de Dados

| Data       | Tabela            | Alteração                          | Script de Migração            |
|------------|-------------------|------------------------------------|-------------------------------|
| 2026-05-04 | grupos_whatsapp   | Adição da coluna `quantidade_contatos` | `scripts/add_contact_count.py` |
| 2026-05-04 | contatos_grupos   | Criação da tabela de contatos          | `scripts/create_contacts_table.py` |
| 2026-05-04 | contatos_grupos   | Adição da coluna `no_grupo` (Boolean)  | `scripts/add_no_grupo_column.py` |
| 2026-05-04 | grupos_whatsapp   | Adição de `link_convite`, `dia_inicio_semana`, `dia_fim_semana`, `dia_lancamento_atual` | `migrations.py` (v1.4.0) |
| 2026-05-04 | logs_disparos     | Adição da coluna `tipo`             | `migrations.py` (v1.4.0) |
| 2026-05-06 | mensagens_capturadas | Adição de `message_id`, `from_me` | `scripts/update_mensagens_capturadas.py` |
| 2026-05-09 | grupos_whatsapp   | Adição da coluna `tipo_ciclo` (semanal/unico) | `scripts/add_tipo_ciclo.py` |
| 2026-05-06 | mensagens_capturadas | Adição de `media_url`, `media_type` | `scripts/migrate_postgres.py` |
| 2026-05-09 | invitations       | Criação da tabela de convites e links de reset | `scripts/add_invitations_table.py` |
| 2026-05-09 | mensagens_disparadas | Adição da coluna `enquete_multipla` (Boolean) | `scripts/add_enquete_multipla.py` |


| 2026-05-09 | configuracoes | SILENCE_HOURS_ENABLED, SILENCE_HOURS_START, SILENCE_HOURS_END | add_silence_hours.py | Adição de configurações de horário de silêncio |
| 2026-07-31 | clientes | Criação da tabela clientes para gerenciamento de múltiplas contas/instâncias de WhatsApp | `scripts/add_clientes_table.py` |
