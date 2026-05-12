# Gerenciador de Tarefas — Projeto de Qualidade e Teste de Software

Gerenciador de tarefas para as aulas práticas da disciplina de Qualidade e Teste de Software.

## Stack

- **Backend:** TypeScript, Express, Prisma, SQLite
- **Frontend:** React, Vite, Tailwind CSS

## Pré-requisitos

- Node.js 20+
- npm

## Setup

```bash
# 1. Clone e instale as dependências
git clone https://github.com/ketlymachado/gerenciador-de-tarefas.git
cd gerenciador-de-tarefas
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 2. Configure as variáveis de ambiente
cp .env.example .env
cp server/.env.example server/.env

# 3. Crie o banco de dados
npm run prisma:generate
npm run prisma:migrate

# 4. Inicie o projeto
npm run dev
```

O servidor roda em `http://localhost:5000` e o cliente em `http://localhost:5173`.

## Testes

### Testes unitários e de integração (Jest + Supertest)

```bash
cd server

npm test                  # todos os testes
npm run test:unit         # apenas testes unitários
npm run test:integration  # apenas testes de integração
npm run coverage          # cobertura de código
```

### Testes E2E (Cypress)

```bash
npm run migrate:test      # prepara banco de dados de teste
npm run test:e2e:open     # abre o Cypress interativo
npm run test:e2e:run      # executa em modo headless (CI)
```

### Testes de performance (k6)

```bash
k6 run tests/k6/<arquivo>.js
```

### Testes keyword-driven (Robot Framework)

```bash
robot tests/robot/
```

## API

### Autenticação

| Método | Rota | Autenticada | Descrição |
|--------|------|-------------|-----------|
| POST | `/api/auth/register` | Não | Cadastro (valida e-mail e força da senha) |
| POST | `/api/auth/login` | Não | Login |
| GET | `/api/auth/me` | Sim | Dados do usuário autenticado |
| GET | `/api/auth/validate` | Sim | Valida o token atual |
| POST | `/api/auth/refresh` | Sim | Renova o token |

### Tarefas

| Método | Rota | Autenticada | Descrição |
|--------|------|-------------|-----------|
| POST | `/api/tasks` | Sim | Cria uma tarefa |
| GET | `/api/tasks` | Sim | Lista tarefas (filtros: `completed`, `priority`) |
| GET | `/api/tasks/stats` | Sim | Estatísticas das tarefas do usuário |
| GET | `/api/tasks/:id` | Sim | Busca tarefa por ID |
| PUT | `/api/tasks/:id` | Sim | Atualiza tarefa |
| DELETE | `/api/tasks/:id` | Sim | Remove tarefa |
| POST | `/api/test/reset-database` | Não | Reseta o banco de teste (apenas em `NODE_ENV=test`) |

## Estrutura

```
gerenciador-de-tarefas/
├── client/          # Interface web (React + Vite)
├── server/          # API REST (Express + Prisma)
│   └── src/
│       ├── tests/   # Testes Jest e Supertest (aula 14)
│       └── utils/   # Funções puras para exercícios unitários
├── cypress/         # Testes E2E (aula 15)
├── prisma/          # Schema do banco de dados
├── tests/
│   ├── k6/          # Testes de carga (aula 16)
│   └── robot/       # Testes keyword-driven (aula 16)
└── docs/            # Guias das aulas práticas
```
