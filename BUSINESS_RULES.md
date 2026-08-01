# Regras de Negócio — Gerenciador de Grupo do WhatsApp

> **Instruções para o agente:** Este arquivo contém regras que NÃO estão explícitas no código. Sempre consulte antes de implementar qualquer funcionalidade nova. Seções marcadas com `[RASCUNHO - VALIDAR]` foram inferidas do código e precisam ser confirmadas pelo dono do projeto.

---

## 1. Ciclos de Lançamento

- Cada grupo passa por um "lançamento" de `dia_inicio_semana` até `dia_fim_semana`.
- `dia_lancamento_atual` indica em qual dia do ciclo o grupo está (0 = fora do ciclo, 1 em diante = dia ativo).
- O avanço ocorre automaticamente todo dia à meia-noite via scheduler.
- Grupos fora do ciclo não recebem disparos automáticos.

**[RESPONDIDO] Tipo de ciclo:** Na criação do grupo deve existir uma opção para escolher entre:
- **Semanal:** o ciclo reinicia automaticamente toda semana no `dia_inicio_semana`. Exemplo: grupo configurado de quarta (dia 1) a sexta (dia 3) → roda quarta, quinta e sexta, fica inativo nos dias restantes da semana, e reinicia na próxima quarta como dia 1.
- **Único:** o ciclo roda uma única vez e para ao atingir o `dia_fim_semana`. O grupo não reinicia automaticamente.

**[RESPONDIDO] Intervalo entre ciclos (semanal):** Os dias fora do ciclo (entre `dia_fim_semana` e o próximo `dia_inicio_semana`) são dias de inatividade total — nenhuma mensagem deve ser disparada e nenhum funil deve ser ativado. O grupo aguarda silenciosamente até o próximo `dia_inicio_semana`.

---

## 2. Disparo de Mensagens

- O scheduler roda a cada 30 segundos e dispara mensagens dentro de uma janela de 30 minutos. Isso significa que uma mensagem agendada para as 14:00 será disparada se o scheduler rodar entre 13:30 e 14:00. Após 30 minutos do horário programado, a mensagem é considerada perdida para aquele dia (tolerância a quedas breves do servidor).

- Uma mensagem só é disparada 1x por dia para cada grupo (deduplicação por log de sucesso).

- Se uma mensagem falhar 10x no mesmo dia para o mesmo grupo, o sistema para de tentar.

- Há um delay de 5 segundos entre disparos consecutivos para evitar bloqueio da W-API.

**[RESPONDIDO] Prioridade entre tipos de mensagem:** Não existe prioridade — todas as mensagens do dia são disparadas na ordem em que aparecem, independente do tipo.

**[RESPONDIDO] Falha definitiva:** Quando uma mensagem atingir 10 erros no mesmo dia para o mesmo grupo, o scheduler registra um log com status `FALHA_DEFINITIVA`. Regras:
- O alerta de falha definitiva aparece **somente no Dashboard** como um card de atenção.
- O alerta **não desaparece automaticamente** — mesmo que o admin clique em "Tentar novamente" e o reenvio tenha sucesso. O admin precisa clicar em um botão "Dispensar" explicitamente para arquivar o alerta.
- A página de Logs exibe o log normalmente (com status e motivo do erro), mas sem card/banner especial.
- O botão "Tentar novamente" continua disponível na página de Logs para reenvio manual.

**[RESPONDIDO] Horário de silêncio:** O sistema possui uma trava global configurável em **Configurações**. Quando ativado, o scheduler suspende todos os disparos automáticos durante o intervalo definido (ex: 22:00 às 08:00). Mensagens agendadas para dentro deste intervalo serão ignoradas pelo scheduler naquele dia.

---

## 3. Associação de Mensagens a Grupos

- Se o grupo tiver entradas na tabela `grupo_mensagens`, recebe APENAS as mensagens associadas.

**[RESPONDIDO] Modelo obrigatório:** Todos os grupos devem ter associações explícitas. O comportamento legado de "recebe tudo por padrão" deve ser removido. Um grupo sem nenhuma mensagem associada não deve receber nada — nunca assumir recebimento global.

**Impacto no código:** O `backend/scheduler.py` ignora grupos sem associações em vez de disparar todas as mensagens. Grupos sem associações exibem um alerta visual "SEM CONTEÚDO" na tabela de grupos para orientar o administrador a realizar a configuração manual. Não haverá migração automática de registros legados.

---

## 4. Conjuntos de Grupos (Funnels)

- Um conjunto é uma fila de grupos para receber leads via link público `/join/{slug}`.
- Leads são distribuídos em ordem de posição, sempre para o primeiro grupo que não atingiu `max_leads`.
- `max_leads` padrão: 900 contatos por grupo.
- Se todos os grupos do conjunto estiverem cheios, o sistema retorna erro 503 (nenhum lead é perdido — é apenas bloqueado).
- O slug é único e público — qualquer pessoa com o link pode entrar.

**[RESPONDIDO] Leads quando conjunto lotado:** O lead deve ser redirecionado para uma página informando que o grupo está lotado e que ele não conseguirá acessá-lo. Essa página só deve aparecer quando **todos** os grupos do conjunto atingirem `max_leads` ou mais contatos.

**[RESPONDIDO] Reabertura de grupo:** Ainda não implementado, mas deve ser implementado. Quando um membro sai de um grupo e a contagem cair abaixo de `max_leads`, o grupo deve voltar a receber leads automaticamente. O `max_leads` padrão de 900 é apenas um valor inicial configurável — não é um número fixo.

**[RESPONDIDO] Notificação de conjunto quase cheio:** Exibir badge vermelho no item "Conjuntos" do menu lateral + card de alerta no Dashboard quando algum grupo do conjunto atingir 80% ou mais da capacidade (`max_leads`).

---

## 5. Planos LITE vs PRO

- O sistema detecta o plano atual da W-API automaticamente a cada 60 segundos.
- Funcionalidades exclusivas PRO conhecidas até agora:
  - Revogar/apagar mensagem para todos (`/captura/revogar/{id}`)
- O frontend exibe o plano atual (badge PRO/LITE) no sidebar do chat.
- Ao tentar usar recurso PRO com plano LITE, o sistema exibe um toast customizado (âmbar/dourado com cadeado).

**[RESPONDIDO] Upgrade de plano:** Feito diretamente no painel da W-API pelo usuário. O sistema detecta o plano automaticamente via `/instance/list-instances` a cada 60 segundos.

**[RESPONDIDO] Endpoints PRO usados neste projeto:**

Segundo a documentação oficial da W-API (https://docs.w-api.app/lite-vs-pro), a regra geral é:
- **LITE:** envio de mensagens básicas (texto, imagem, vídeo, áudio, documento, enquete) e webhooks.
- **PRO:** qualquer endpoint de gerenciamento de grupos + mensagens interativas (botões e listas).

Mapeamento dos endpoints do projeto:

| Endpoint | Usado em | Plano |
|----------|----------|-------|
| `/message/send-text` | Disparo de texto | ✅ LITE |
| `/message/send-image` | Disparo de imagem | ✅ LITE |
| `/message/send-video` | Disparo de vídeo | ✅ LITE |
| `/message/send-audio` | Disparo de áudio | ✅ LITE |
| `/message/send-document` | Disparo de documento | ✅ LITE |
| `/message/send-poll` | Disparo de enquete | 🔒 PRO |
| `/message/download-media` | Captura de mídia via webhook | ✅ LITE |
| `/message/delete` | Revogar mensagem | 🔒 PRO |
| `/instance/status-instance` | Verificar conexão | ✅ LITE |
| `/instance/list-instances` | Detectar plano | ✅ LITE |
| `/group/get-all-groups` | Listar grupos para cadastro | ✅ LITE |
| `/group/get-participants` | Contar contatos do grupo | ✅ LITE |
| `/group/get-invite-code` | Obter link de convite | ✅ LITE |
| `/group/update-group-name` | Alterar nome do grupo | 🔒 PRO |

**Regra geral confirmada em uso:** Endpoints de **leitura** de grupos funcionam no LITE. Endpoints de **escrita** (criar, renomear, gerenciar membros) são exclusivos PRO. Mensagens interativas (botões, listas) também são PRO.

---

## 6. Usuários e Permissões

- Existem dois cargos: `SUPER_ADMIN` e `ADMIN`.
- `SUPER_ADMIN`: acesso total (usuários, convites, configurações do sistema).
- `ADMIN`: acesso operacional (grupos, mensagens, logs, contatos, chat) — sem acesso a usuários e configurações.
- Novos usuários só podem ser criados via convite gerado por um `SUPER_ADMIN`.
- Convites têm expiração configurável (em horas) e são de uso único.

**[RESPONDIDO] Limite de usuários:** Não há limite de usuários por conta no momento.

**[RESPONDIDO] Visibilidade de dados:** Todos os dados são compartilhados entre os usuários — um ADMIN vê tudo, incluindo dados criados por outros ADMINs.

**[RESPONDIDO] Cargos futuros:** Apenas `SUPER_ADMIN` e `ADMIN` por enquanto. Nenhum novo cargo planejado.

---

## 7. Captura de Mensagens (Webhook)

- O sistema só captura mensagens de grupos (`@g.us`), ignora chats 1:1.
- Mídias são descriptografadas pela W-API e salvas permanentemente no S3.
- Contatos que enviam mensagens em grupos são automaticamente adicionados à base de contatos.

**[RESPONDIDO] Retenção de mensagens capturadas:** Deve ser configurável pelo admin nas Configurações via dropdown com as opções: 7 dias, 14 dias, 30 dias ou Ilimitado. Atualmente não existe essa lógica — precisa ser implementada (ver `MELHORIAS.md`).

**[RESPONDIDO] Política de privacidade:** Não há política definida no momento.

**[RESPONDIDO] Captura de mensagens do bot:** O webhook NÃO deve capturar mensagens enviadas pelo próprio bot (`from_me: true`). Apenas mensagens enviadas por membros do grupo devem ser armazenadas.

---

## 8. Upload de Mídia

- Limite de 16MB por arquivo.
- Áudio gravado no browser (webm) é convertido para ogg antes do upload (compatibilidade W-API).
- Todos os arquivos são armazenados no Backblaze B2 (S3 compatível).

**[RESPONDIDO] Limpeza do S3:** Deve seguir o mesmo período configurado em `RETENCAO_MENSAGENS_DIAS`. Quando o job de retenção deletar mensagens capturadas do banco, deve também deletar os arquivos de mídia correspondentes do S3.

**[RESPONDIDO] Arquivos proibidos:** Não há restrição de tipo de arquivo além do limite de 16MB.

---

## 9. Informações Gerais do Negócio

**[RESPONDIDO] Modelo de precificação:** Venda de instalação única no servidor do cliente com cobrança de valor único. Não é modelo de assinatura recorrente por uso.

**[RESPONDIDO] Limite de grupos:** Não há limite de grupos por instalação.

**[RESPONDIDO] Integrações externas:** Não há integração com Hotmart, Kiwify ou outras plataformas além do webhook padrão.

**[RESPONDIDO] Backup do banco:** Implementado na aba **Backup Banco** em **ADMINISTRAÇÃO**. Suporta backups manuais e agendamento automático com envio direto para o armazenamento Backblaze B2 S3, retenção configurável e upload/restauração de dumps do PostgreSQL.

**[RESPONDIDO] SLA de entrega:** Não há SLA prometido aos clientes.

**[RESPONDIDO] Conteúdo proibido:** Não há restrição de tipo de conteúdo.

---

## 10. Fuso Horário

- **Fuso obrigatório: Horário de Brasília (America/Sao_Paulo, UTC-3).**
- Toda data e horário exibido no frontend deve estar no fuso de Brasília.
- Todo log gerado no backend deve registrar timestamps no fuso de Brasília.
- Toda comparação de horário no scheduler (ex: janela de disparo, meia-noite de avanço de ciclo) deve usar o horário de Brasília como referência.
- O banco de dados pode armazenar datas em UTC, mas a conversão para exibição e comparação deve sempre usar `America/Sao_Paulo`.

**Implementação no backend (Python):**
```python
from zoneinfo import ZoneInfo
from datetime import datetime

BRASILIA = ZoneInfo("America/Sao_Paulo")
agora_brasilia = datetime.now(BRASILIA)
```

**Implementação no frontend (JavaScript):**
```javascript
const formatarDataBrasilia = (isoString) =>
  new Date(isoString).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
```

---

## 11. Ambiente e Conectividade (BASE_URL)

- **Fonte da Verdade:** A `BASE_URL` usada para gerar links universais (`/join/{slug}`) e redirecionamentos de esgotamento DEVE ser extraída prioritariamente do arquivo `.env` do backend.
- **Proibição de localhost:** É terminantemente proibido o uso de `localhost` para links gerados que serão enviados a leads. Se a variável `BASE_URL` estiver configurada no ambiente, ela tem precedência total sobre qualquer detecção automática de `window.location.origin`.
- **Túneis e Produção:** Em ambientes que utilizam túneis (Ngrok, Cloudflare) ou domínios de produção, a `BASE_URL` deve refletir o endereço externo acessível pelo lead (ex: `https://zapgrupo.aryaraj.shop`).
- **Exposição via API:** O backend deve expor o valor da `BASE_URL` do ambiente via endpoint `/config/` para que o frontend apresente os links de cópia corretos ao administrador.
