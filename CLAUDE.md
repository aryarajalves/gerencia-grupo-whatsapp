# Projeto - Gerenciador de Grupo do WhatsApp

## Nota de Compatibilidade de Agentes

Este projeto é desenvolvido com dois agentes de IA: **Gemini** e **Claude (Claude Code)**.
Algumas regras abaixo fazem referência ao `browser_subagent` — essa ferramenta existe apenas no Gemini.

**Se você é o Claude Code**, utilize os equivalentes abaixo no lugar do `browser_subagent`:
- **Verificar se o frontend está acessível:** `curl -I http://localhost:5176` via terminal.
- **Verificar resposta de rotas da API:** `WebFetch` para checar o conteúdo/status HTTP de uma URL.
- **Evidência visual:** Descreva o fluxo testado (página acessada, dados retornados pela API, status HTTP) e solicite que o usuário valide visualmente no navegador. Não invente screenshots — informe que a validação visual cabe ao usuário.
- **Logs de containers:** `docker logs --tail 20 <container>` via terminal.

**Capacidades exclusivas do Claude Code neste projeto:**
- Leitura, escrita e edição de arquivos diretamente.
- Busca em código (Grep/Glob) para localizar símbolos, padrões e arquivos.
- Execução de comandos de terminal (docker, pytest, curl, git, npm, etc.).
- WebFetch para consultar URLs e verificar respostas HTTP.
- WebSearch para pesquisar documentação e soluções externas.
- Subagentes paralelos para tarefas independentes (ex: pesquisa + edição simultâneas).
- Planejamento estruturado de implementação antes de codar.

@.agents/rules/linguagem-agente.md
@.agents/rules/acesso-sistema.md
@.agents/rules/automacao-reinicio.md
@.agents/rules/experiencia-usuario.md
@.agents/rules/integridade-banco.md
@.agents/rules/integridade-visual.md
@.agents/rules/limite-codigo.md
@.agents/rules/logs-backend.md
@.agents/rules/modularizacao-arquitetura.md
@.agents/rules/requisitos-backend.md
@.agents/rules/seguranca-api.md
@.agents/rules/seguranca-config.md
@.agents/rules/validacao-testes.md
@.agents/rules/api-whatsapp.md
@.agents/rules/verificacao-plano-wapi.md
@.agents/rules/exception-handler-global.md
@.agents/rules/env-example.md
@.agents/rules/gerenciamento-estado.md
@.agents/rules/padrao-commits.md
@.agents/rules/repositorio-github.md
@.agents/rules/consultar-business-rules.md
@.agents/rules/atualizar-business-rules.md
@BUSINESS_RULES.md
