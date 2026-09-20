---
trigger: always_on
---

# Regra de Modularização, Refatoração e Arquitetura

Ao realizar refatorações ou expansões do sistema, a organização de arquivos deve seguir um padrão modular e um protocolo rígido de segurança para evitar o acúmulo de lógica e perda de código funcional.

**Protocolo Obrigatório de Refatoração:**
1. **Backup Prévio Obrigatório (Passo 0):** Toda vez que você for refatorar um código existente, a **primeira coisa que você deve fazer antes de qualquer alteração** é criar uma cópia de backup do(s) arquivo(s) original(is) (ex: `NomeArquivo.jsx.bak` ou cópia na pasta de backup). Isso garante que tenhamos uma cópia fiel para restaurar imediatamente caso ocorra algum problema durante a refatoração. Somente após criar o backup você deve iniciar as alterações no código.
2. **Pontos de Entrada (Barrels):** Ao quebrar um arquivo grande em uma pasta, mantenha um arquivo `index.jsx` (ou `__init__.py`) que atue como o exportador principal, mantendo a compatibilidade com os imports existentes no restante do projeto.
3. **Separação de Preocupações:**
   - **Frontend:** Separe a lógica de estado (Hooks customizados), a renderização (Componentes) e os utilitários em arquivos distintos.
   - **Backend:** Separe as rotas (Routers), os modelos de dados (Schemas/Models) e a lógica de negócio (Services).
4. **Proibição de Componentes Aninhados:** Não defina sub-componentes dentro do mesmo arquivo se eles possuírem lógica complexa ou mais de 50 linhas de código. Extraia para a pasta `components/`.
5. **Validação Pós-Refatoração:** Após refatorar, valide a funcionalidade com os testes unitários e com testes de interface antes de considerar a tarefa concluída. Somente após a validação bem-sucedida os arquivos de backup temporários (`.bak`) devem ser removidos.

Isso mantém a base de código limpa, escalável, segura contra quebras e fácil de navegar.