# 📱 Gerenciador de Grupos do WhatsApp - Mídia ISKCON (v1.5.0)

Este projeto é uma plataforma premium de gerenciamento de grupos e mídias para WhatsApp, projetada para oferecer uma experiência de usuário fluida e de alta qualidade. O sistema integra automação (N8N), armazenamento em nuvem (Backblaze S3) e uma interface moderna com foco em performance e estética "Premium Dark Mode".

---

## 🚀 Tecnologias Utilizadas

### Core
- **Backend:** FastAPI (Python 3.9+) - API de alta performance com tipagem e segurança via JWT.
- **Frontend:** React + Vite - Interface rápida, reativa e moderna.
- **Banco de Dados:** PostgreSQL 13 - Armazenamento robusto e relacional.
- **Cache & Filas:** Redis - Gerenciamento de tarefas em segundo plano e cache.
- **Armazenamento:** Backblaze S3 (via B2 API) - Armazenamento escalável de mídias.

### Infraestrutura
- **Docker & Docker Compose:** Containerização completa do ambiente.
- **N8N Integration:** Webhooks para automação de processos.

---

## 🎨 Design System: "Premium Dark Mode"

A interface segue rigorosamente os padrões definidos em [INTERFACE.md](./INTERFACE.md):

- **Estética:** Fundo azul escuro profundo/preto acetinado com gradientes neon (roxo/azul).
- **Interatividade:** Micro-interações em todos os elementos (hover scale 1.03, bordas neon, transições suaves).
- **Glassmorphism:** Cards semi-transparentes com desfoque de fundo (backdrop blur).
- **Responsividade:** Layout adaptável para diferentes tamanhos de tela.

---

## 📁 Estrutura do Projeto

```text
.
├── backend/            # API FastAPI, modelos SQL e lógica de negócio
├── frontend/           # Interface React/Vite e componentes de UI
├── docker/             # Configurações de containers (Local e Prod)
├── docs/               # Documentação técnica adicional
└── debug/              # Scripts de utilidade e logs temporários
```

---

## 🛠️ Como Iniciar o Projeto (Local)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- Docker e Docker Compose
- Node.js (opcional, para desenvolvimento direto no frontend)
- Python 3.9+ (opcional, para desenvolvimento direto no backend)

### 2. Preparação do Ambiente

Antes de subir os containers, é necessário criar a rede e o volume externo definidos no `docker-compose.local.yml`:

```powershell
# Criar a rede externa do swarm (usada nos padrões do projeto)
docker network create network_swarm_public

# Criar o volume para persistência do banco de dados
docker volume create projeto-gerenciadordegrupodowhatsapp_postgres_data
```

### 3. Iniciando os Containers

Para iniciar todo o ecossistema (Postgres, Redis, Backend e Frontend) em modo de desenvolvimento local:

```powershell
# Navegar até a pasta docker
cd docker

# Subir os containers usando o arquivo de configuração local
docker-compose -f docker/docker-compose.local.yml up -d --build
```

### 4. Acessando a Aplicação

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend (API Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redis:** `localhost:6379`
- **Postgres:** `localhost:5432`

---

## 🧪 Testes Unitários

Seguindo as regras do projeto, **todas** as novas funcionalidades devem ser acompanhadas de testes unitários.

### Backend
Para rodar os testes do backend:
```powershell
cd backend
pytest
```

### Frontend
Para rodar os testes do frontend:
```powershell
cd frontend
npm test
```

---

## ⚙️ Configuração (.env)

Certifique-se de que os arquivos `.env` em `backend/` e `frontend/` estejam configurados corretamente. Exemplos de variáveis essenciais:

- `DATABASE_URL`: String de conexão com o PostgreSQL.
- `B2_KEY_ID` & `B2_APPLICATION_KEY`: Credenciais para o S3.
- `API_SECRET`: Chave secreta para geração de tokens JWT.
- `SUPER_ADMIN_EMAIL` & `SUPER_ADMIN_PASSWORD`: Acesso inicial ao sistema.

---

## 🔄 Fluxo de Desenvolvimento

Sempre que implementar uma alteração significativa:
1. Atualize os testes unitários.
2. Reinicie os containers para aplicar as mudanças:
   ```powershell
   # Workflow rápido
   docker-compose -f docker/docker-compose.local.yml restart
   ```
3. Em caso de problemas persistentes, limpe o cache do docker:
   ```powershell
   docker system prune -f
   ```

---
*Este arquivo README foi gerado automaticamente para garantir a padronização e clareza do projeto.*
