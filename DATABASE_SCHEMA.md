# Esquema do Banco de Dados — Gerenciador de Grupo do WhatsApp

> Banco de dados: **PostgreSQL**
> Arquivo de origem: `backend/models.py`
> Use este arquivo como referência para scripts de backup, migração e restauração.

---

## Tabela: `grupos_whatsapp`

Armazena os grupos do WhatsApp gerenciados pelo sistema.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `nome` | String | ✅ | Nome do grupo |
| `id_do_grupo` | String | ✅ UNIQUE | JID do WhatsApp (ex: `123@g.us`) |
| `numero_do_disparo` | String | ❌ | Número que realiza os envios |
| `ativo` | Boolean | ✅ | Se o grupo está ativo (default: `true`) |
| `dia_inicio_semana` | Integer | ✅ | Dia de início do ciclo (0=Segunda … 6=Domingo) |
| `dia_fim_semana` | Integer | ✅ | Dia de fim do ciclo (default: 4=Sexta) |
| `dia_lancamento_atual` | Integer | ✅ | Dia atual do ciclo (0=fora do ciclo, 1+=ativo) |
| `link_convite` | String | ❌ | Link público de acesso ao grupo |
| `quantidade_contatos` | Integer | ✅ | Contagem de membros (default: 0) |
| `tipo_ciclo` | String | ✅ | `semanal` (reinicia toda semana) ou `unico` (roda uma vez e encerra) — default: `semanal` |

---

## Tabela: `mensagens_disparadas`

Armazena as mensagens agendadas para disparo automático.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `mensagem` | Text | ❌ | Conteúdo da mensagem |
| `numero_da_mensagem` | Integer | ❌ | Número de ordem da mensagem |
| `dia_do_lancamento` | Integer | ✅ | Em qual dia do ciclo disparar (ex: 1, 2, 3) |
| `horario_do_disparo` | Time | ✅ | Horário do disparo (fuso: America/Sao_Paulo) |
| `tipo_de_mensagem` | String | ✅ | `texto`, `imagem`, `video`, `audio`, `arquivo`, `enquete`, `nome_grupo` |
| `link_midia` | String | ❌ | URL do arquivo no S3 |
| `opcoes_enquete` | Text | ❌ | Opções da enquete separadas por vírgula ou JSON |
| `status` | String | ✅ | `pendente` (default) |
| `ativo` | Boolean | ✅ | Se a mensagem está ativa (default: `true`) |

---

## Tabela: `grupo_mensagens`

Tabela de associação N:N entre grupos e mensagens. Se um grupo tiver registros aqui, recebe apenas as mensagens associadas. Grupos sem registros não recebem nada (comportamento obrigatório).

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `grupo_id` | UUID | ✅ PK/FK | Referência a `grupos_whatsapp.id` (CASCADE DELETE) |
| `mensagem_id` | UUID | ✅ PK/FK | Referência a `mensagens_disparadas.id` (CASCADE DELETE) |

---

## Tabela: `logs_disparos`

Histórico de todos os disparos realizados pelo scheduler.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `grupo_nome` | String | ✅ | Nome do grupo no momento do disparo |
| `mensagem_corpo` | Text | ❌ | Conteúdo da mensagem disparada |
| `status` | String | ✅ | `Sucesso`, `Erro` |
| `detalhes_erro` | Text | ❌ | Mensagem de erro detalhada |
| `mensagem_id` | UUID | ❌ | Referência à mensagem original |
| `tipo` | String | ❌ | Tipo da mensagem (`texto`, `imagem`, etc.) |
| `criado_em` | DateTime | ✅ | Data/hora do disparo |

---

## Tabela: `usuarios`

Usuários com acesso ao sistema.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `nome` | String | ✅ | Nome do usuário |
| `email` | String | ✅ UNIQUE | E-mail de login |
| `cargo` | String | ✅ | `SUPER_ADMIN` ou `ADMIN` |
| `ativo` | Boolean | ✅ | Se o usuário está ativo (default: `true`) |
| `senha_hash` | String | ❌ | Hash bcrypt da senha |
| `criado_em` | DateTime | ✅ | Data de criação |

---

## Tabela: `configuracoes`

Configurações do sistema em formato chave-valor.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `chave` | String | ✅ PK | Nome da configuração |
| `valor` | Text | ✅ | Valor da configuração |

**Chaves conhecidas:**

| Chave | Descrição |
|-------|-----------|
| `WAPI_TOKEN` | Token de autenticação da W-API |
| `WAPI_INSTANCE_ID` | ID da instância WhatsApp na W-API |
| `WHATSAPP_STATUS` | Status da conexão (`conectado`, `desconectado`) |
| `WHATSAPP_PLAN_TYPE` | Plano atual (`LITE` ou `PRO`) |
| `WHATSAPP_LAST_CHECK` | Data/hora da última verificação de status |
| `RETENCAO_MENSAGENS_DIAS` | Retenção de mensagens capturadas (`7`, `14`, `30`, `ilimitado`) |

---

## Tabela: `mensagens_capturadas`

Mensagens recebidas nos grupos via webhook da W-API.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `message_id` | String | ❌ | ID real da mensagem no WhatsApp |
| `from_me` | Boolean | ✅ | Se enviada pelo bot (sempre `false` — bot não é capturado) |
| `sender_name` | String | ✅ | Nome do remetente |
| `sender_number` | String | ✅ | Número do remetente |
| `message_content` | Text | ❌ | Texto da mensagem |
| `media_url` | String | ❌ | URL do arquivo de mídia no S3 |
| `media_type` | String | ❌ | `imagem`, `video`, `audio`, `arquivo` |
| `group_jid` | String | ✅ | JID do grupo |
| `group_name` | String | ❌ | Nome do grupo |
| `timestamp` | DateTime | ✅ | Data/hora da captura (fuso: America/Sao_Paulo) |

---

## Tabela: `contatos_grupos`

Contatos identificados nos grupos via webhook ou sincronização.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `nome` | String | ❌ | Nome do contato |
| `numero` | String | ✅ | Número WhatsApp |
| `jid_grupo` | String | ✅ | JID do grupo onde está |
| `nome_grupo` | String | ✅ | Nome do grupo |
| `no_grupo` | Boolean | ✅ | Se ainda está no grupo (default: `true`) |
| `extraido_em` | DateTime | ✅ | Data/hora de extração (fuso: America/Sao_Paulo) |

---

## Tabela: `conjuntos_grupos`

Conjuntos (funnels) de grupos para distribuição automática de leads.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `nome` | String | ✅ | Nome do conjunto |
| `slug` | String | ✅ UNIQUE | Identificador para a URL pública (`/join/{slug}`) |
| `ativo` | Boolean | ✅ | Se o conjunto está ativo (default: `true`) |
| `criado_em` | DateTime | ✅ | Data de criação |

---

## Tabela: `grupo_conjunto_associacoes`

Associação entre conjuntos e grupos, com ordem e limite de leads.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `conjunto_id` | UUID | ✅ FK | Referência a `conjuntos_grupos.id` (CASCADE DELETE) |
| `grupo_id` | UUID | ✅ FK | Referência a `grupos_whatsapp.id` (CASCADE DELETE) |
| `posicao` | Integer | ✅ | Ordem de prioridade para receber leads |
| `max_leads` | Integer | ✅ | Limite de contatos antes de passar ao próximo (default: 900) |

---

## Tabela: `invitations`

Tokens de convite e reset de senha.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | ✅ PK | Identificador único |
| `token` | String | ✅ UNIQUE | Token seguro gerado via `secrets.token_urlsafe(32)` |
| `cargo` | String | ✅ | Cargo que será atribuído ao novo usuário |
| `tipo` | String | ✅ | `convite` (novo usuário) ou `reset` (senha) |
| `usuario_id` | UUID | ❌ FK | Referência a `usuarios.id` (apenas para reset) |
| `usado` | Boolean | ✅ | Se o token já foi utilizado (default: `false`) |
| `expira_em` | DateTime | ❌ | Data de expiração (`null` = sem expiração) |
| `criado_em` | DateTime | ✅ | Data de criação (fuso: America/Sao_Paulo) |

---

## Resumo de Tabelas

| Tabela | Registros crescem com | Retenção |
|--------|----------------------|----------|
| `grupos_whatsapp` | Cadastro manual | Permanente |
| `mensagens_disparadas` | Cadastro manual | Permanente |
| `grupo_mensagens` | Associações manuais | Permanente |
| `logs_disparos` | Todo disparo automático | Permanente (limpeza manual via UI) |
| `usuarios` | Convites aceitos | Permanente |
| `configuracoes` | Configurações do sistema | Permanente |
| `mensagens_capturadas` | Todo webhook recebido | Configurável (7/14/30 dias ou ilimitado) |
| `contatos_grupos` | Todo webhook + sync | Permanente |
| `conjuntos_grupos` | Cadastro manual | Permanente |
| `grupo_conjunto_associacoes` | Associações de conjuntos | Permanente |
| `invitations` | Geração de convites | Permanente |
