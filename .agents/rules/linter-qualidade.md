# Regra de Validação de Código e Auditoria de Segurança (Linter e Dependências Pré-Push)

Para garantir a confiabilidade do código e prevenir o envio de vulnerabilidades de segurança (CVEs), erros de sintaxe, imports órfãos, variáveis mortas ou indefinidas para o GitHub, o projeto possui ferramentas automatizadas no Backend e no Frontend.

**Ferramentas Integradas:**
- **Frontend (React / Vite):**
  - **Linter:** ESLint (`npm run lint`), configurado em `frontend/eslint.config.js`.
  - **Auditoria de Vulnerabilidades:** `npm audit` (`npm run audit`).
- **Backend (FastAPI / Python):**
  - **Linter:** Flake8 (`python -m flake8 .`), configurado em `backend/.flake8`.
  - **Auditoria de Vulnerabilidades:** Pip-Audit (`python -m pip_audit --local` / `pip-audit`), registrado em `backend/requirements.txt`.

**Protocolo Obrigatório Pré-Push:**

Antes de qualquer `git commit` ou `git push` para o repositório GitHub (`repositorio-github.md`), execute obrigatoriamente a esteira de qualidade e segurança:

1. **Validação Frontend:**
   ```bash
   cd frontend
   npm run lint
   npm run audit
   ```

2. **Validação Backend:**
   ```bash
   cd backend
   python -m flake8 .
   python -m pip_audit --local
   ```

**Critérios Obrigatórios de Aprovação:**
- **0 Erros de Sintaxe e Linter:** Nenhum erro de sintaxe, variáveis/funções indefinidas (`F821`, `no-undef`) ou código órfão.
- **Relatório de Vulnerabilidades Conhecidas:** Sempre que uma vulnerabilidade de dependência for detectada, avaliar a possibilidade de atualização de versão segura no `requirements.txt` / `package.json` mantendo a compatibilidade do sistema.
- **Relatório Final Obrigatório:**
  - `[OK] Linter Frontend (ESLint): Aprovado`
  - `[OK] Linter Backend (Flake8): Aprovado`
  - `[OK] Auditoria de Segurança Frontend (npm audit): Executada`
  - `[OK] Auditoria de Segurança Backend (pip-audit): Executada`
