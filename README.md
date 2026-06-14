# Gerenciador de Tarefas — Qualidade e Teste de Software

Projeto utilizado nas aulas práticas da disciplina de Qualidade e Teste de Software.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm 9 ou superior

---

## Setup inicial

### 1. Clone o repositório

```bash
git clone https://github.com/unisenaiketly/gerenciador-de-tarefas
cd gerenciador-de-tarefas
```

### 2. Instale as dependências

```bash
npm install

cd server
npm install
cd ..

cd client
npm install
cd ..
```

### 3. Configure as variáveis de ambiente

```bash
cp server/.env.example server/.env
```

O arquivo `.env` criado já vem com os valores padrão para desenvolvimento local. Não é necessário alterar nada para rodar o projeto.

### 4. Inicialize o banco de dados

```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## Rodando o projeto

```bash
npm run dev
```

Isso sobe o servidor na porta **3001** e o cliente na porta **5173** ao mesmo tempo.

Acesse `http://localhost:5173` no navegador.

---

## Testes

### Testes unitários (Jest)

Testam funções puras em `server/src/utils/` isoladamente, sem banco de dados.

```bash
cd server
npm run test:unit
```

Para rodar um arquivo específico:

```bash
npx jest nome-do-arquivo.test.ts
```

Para gerar o relatório de cobertura:

```bash
npm run coverage
```

O relatório em HTML fica disponível em `server/coverage/lcov-report/index.html`.

---

### Testes de integração/API (Supertest)

Testam os endpoints REST fazendo requisições HTTP reais com banco de dados de teste isolado.

**Antes da primeira execução** (e sempre que o schema mudar), prepare o banco de teste:

```bash
cd server
npm run migrate:test
```

Para rodar os testes de integração:

```bash
npm run test:integration
```

> O comando `test:integration` já executa o `migrate:test` automaticamente antes dos testes. Você só precisa rodar o `migrate:test` manualmente se quiser resetar o banco sem rodar os testes em seguida.

Para rodar um arquivo específico:

```bash
npx jest nome-do-arquivo.routes.test.ts
```

---

### Testes E2E (Cypress)

Testam fluxos completos no navegador: login, criação de tarefas, comentários e demais interações com a interface.

**Modo interativo** (abre o Cypress com interface visual, recomendado durante o desenvolvimento):

```bash
npm run test:e2e
```

Na primeira execução, o Cypress vai pedir para selecionar o tipo de teste — escolha **E2E Testing** — e o navegador — escolha **Chrome**.

**Modo headless** (roda no terminal sem abrir o navegador, útil para CI):

```bash
npm run test:e2e:ci
```

> Os comandos E2E já sobem o servidor e o cliente em modo de teste automaticamente. Não é necessário rodar `npm run dev` antes.

---

## Estrutura do projeto

```
gerenciador-de-tarefas/
├── server/
│   └── src/
│       ├── controllers/     ← Recebem as requisições HTTP
│       ├── services/        ← Lógica de negócio
│       ├── routes/          ← Definição das rotas
│       ├── middlewares/     ← Autenticação e tratamento de erros
│       ├── errors/          ← Classes de erro customizadas
│       ├── utils/           ← Funções utilitárias (alvo dos testes unitários)
│       └── tests/           ← Testes unitários e de integração
├── client/                  ← Frontend React
├── cypress/                 ← Testes E2E
├── prisma/                  ← Schema e migrations do banco de dados
└── docs/                    ← Guias das aulas
```

---

## Scripts disponíveis

### Raiz do projeto

| Script | O que faz |
|---|---|
| `npm run dev` | Sobe servidor e cliente em paralelo |
| `npm run prisma:migrate` | Cria/atualiza o banco de desenvolvimento |
| `npm run prisma:studio` | Abre o Prisma Studio para inspecionar o banco |
| `npm run test:e2e` | Roda os testes E2E no modo interativo |
| `npm run test:e2e:ci` | Roda os testes E2E no modo headless |

### Dentro de `server/`

| Script | O que faz |
|---|---|
| `npm run test:unit` | Roda os testes unitários |
| `npm run test:integration` | Reseta o banco de teste e roda os testes de integração |
| `npm run migrate:test` | Reseta o banco de teste sem rodar os testes |
| `npm run coverage` | Gera o relatório de cobertura de código |
