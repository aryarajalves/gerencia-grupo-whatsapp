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

- O sistema suporta dois tipos de plano da W-API: `LITE` e `PRO`.
- A detecção do plano é feita automaticamente pelo `sync_service.py` consultando `instance/list-instances`. O valor é persistido na chave `WHATSAPP_PLAN_TYPE` da tabela `configuracoes`.
- O frontend consulta `/whatsapp/status` a cada 60 segundos e mantém `waStatus.plan_type` atualizado.

**Restrições por plano:**
- Recursos exclusivos do plano **PRO** devem ser bloqueados no backend com `403` e `detail="PRO_REQUIRED::<descrição>"`.
- O frontend captura o erro e exibe o toast estilizado via `toastPlanoInsuficiente()`.
- Exemplos de recursos exclusivos PRO:
  - Revogar/apagar mensagem para todos (`/captura/revogar/:id`)
  - Outros endpoints identificados na doc oficial da W-API como PRO.

---

## 6. Usuários e Permissões

- O sistema possui dois cargos: `SUPER_ADMIN` e `ADMIN`.
- Apenas `SUPER_ADMIN` pode gerenciar outros usuários, alterar plano e acessar configurações críticas.
- `ADMIN` opera grupos, mensagens e funnels do dia a dia.

---

## 7. Captura de Mensagens e Mídia

- Mensagens recebidas via webhook da W-API são persistidas na tabela `mensagens_capturadas`.
- Mídias (imagem, vídeo, áudio, documento) são baixadas via W-API (`/message/download-media`), descriptografadas e enviadas para o bucket S3 configurado.
- Mensagens enviadas pelo próprio painel são registradas com `from_me=True` e não duplicadas no chat.

---

## 8. Webhook de Extração de Contatos

- Cada grupo pode ter uma URL de webhook externa configurada em `webhook_extracao_url`.
- Durante a extração periódica de contatos, novos contatos inseridos são enviados via `POST` com `{nome, numero, grupo, grupo_jid, extraido_em}`.
- O campo `webhook_enviado` na tabela `contatos_grupos` garante que nenhum contato seja enviado mais de uma vez para o webhook.

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

---

## 11. Ambiente e Conectividade (BASE_URL)

- **Fonte da Verdade:** A `BASE_URL` usada para gerar links universais (`/join/{slug}`) e redirecionamentos de esgotamento DEVE ser extraída prioritariamente do arquivo `.env` do backend.
- **Proibição de localhost:** É terminantemente proibido o uso de `localhost` para links gerados que serão enviados a leads. Se a variável `BASE_URL` estiver configurada no ambiente, ela tem precedência total sobre qualquer detecção automática de `window.location.origin`.
- **Túneis e Produção:** Em ambientes que utilizam túneis (Ngrok, Cloudflare) ou domínios de produção, a `BASE_URL` deve refletir o endereço externo acessível pelo lead (ex: `https://zapgrupo.aryaraj.shop`).
- **Exposição via API:** O backend deve expor o valor da `BASE_URL` do ambiente via endpoint `/config/` para que o frontend apresente os links de cópia corretos ao administrador.

---

## 12. Lista de Segurança e Mitigação em Grupo Fechado

- **Validação de Grupo Fechado:** Um grupo só aplica a restrição de administradores quando estiver com `status_grupo_fechado == True` (somente administradores podem enviar mensagens no WhatsApp) E `seguranca_adms_ativa == True`. Se o grupo estiver aberto para todos, a lista de segurança não bloqueia membros comuns.
- **Detecção de Mensagem Não Autorizada:** Se qualquer participante cujo número não conste na lista de `adms_permitidos` enviar uma mensagem em grupo fechado com segurança ativa:
  1. **Revogação/Deleção:** A mensagem do participante é apagada para todos via `/message/delete` (se plano PRO).
  2. **Remoção do Grupo:** Se configurado "Remover e Alertar", o participante é removido do grupo via W-API (`DELETE /group/remove-participant`).
  3. **Aviso no Grupo:** O bot dispara uma mensagem pré-pronta no grupo informando o número do participante removido/alertado e o motivo.
  4. **Log de Auditoria:** É gravado um registro em `LogDisparo` com o tipo `seguranca_impostor_msg` e detalhes das ações tomadas.
- **Detecção de Novo Administrador na Sincronização:** Quando a lista de participantes é sincronizada e um novo administrador é identificado em grupo fechado sem constar na lista de segurança:
  1. **Apenas Registro de Alerta:** O sistema registra um log de auditoria do tipo `seguranca_adm` no histórico de logs informando o ocorrido.
  2. **Sem Ações Destrutivas:** O sistema NÃO remove nem rebaixa o participante do grupo no WhatsApp, pois o novo administrador pode ser um usuário legítimo promovido pela equipe.
