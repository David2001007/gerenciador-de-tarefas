# Aula 15: Testes E2E com Cypress

## Onde estamos

Na aula 14 você escreveu testes nos dois primeiros níveis da pirâmide: unitários com Jest (funções puras, sem banco) e de integração com Supertest (rotas HTTP com banco). Os dois cobrem o *backend*.

Esta aula chega ao topo da pirâmide: **testes de ponta a ponta (E2E)**. Aqui você não testa uma função ou uma rota isolada: você controla um navegador real, visita páginas, clica em botões, preenche formulários e verifica o que aparece na tela. É o teste mais próximo de como um usuário real usa a aplicação.

Ao final desta aula, você terá:

- Escrito testes com a sintaxe nativa do Cypress (`describe` / `it` / `beforeEach`)
- Usado seletores `data-testid` para localizar elementos de forma robusta
- Executado testes completos de login, registro e gerenciamento de tarefas
- Entendido como os três níveis da pirâmide se complementam

### Atualizando o projeto

**Se você esteve na aula 14:** na raiz do projeto (pasta `gerenciador-de-tarefas`), execute `git pull` e depois `npm install`. As dependências do `client/` e do `server/` não precisam ser reinstaladas.

**Se você não esteve na aula 14:** antes de continuar, siga o guia em `docs/aula-14-jest-supertest.md`. Ele cobre a instalação completa do projeto, criação do banco de dados e execução inicial da aplicação.

## Antes de começar

Na raiz do projeto, execute `npm run e2e:open:full`. Esse comando sobe o servidor em modo de teste, sobe o frontend e abre o Cypress, tudo de uma vez. Na primeira execução, o Cypress vai pedir para escolher o tipo de teste (selecione **E2E Testing**) e o navegador (escolha **Chrome**).

## Como o Cypress está configurado neste projeto

Você não precisa alterar nada aqui. Esta seção existe para você entender o que cada arquivo faz, o que pode ser útil se precisar reproduzir essa estrutura em outro projeto.

**`cypress.config.ts`** (configuração principal):

```typescript
export default defineConfig({
    e2e: {
        // onde ficam os arquivos de teste
        specPattern: 'cypress/e2e/**/*.cy.ts',
        // executado antes de tudo
        supportFile: 'cypress/support/e2e.ts',
        // prefixo das URLs em cy.visit()
        baseUrl: 'http://localhost:5173',
        env: {
            // acessível nos testes via Cypress.env('apiUrl')
            apiUrl: 'http://localhost:3001/api',
        },
    },
});
```

**`cypress/support/e2e.ts`** (roda automaticamente antes de cada teste):

```typescript
import './commands';

beforeEach(() => {
    // limpa o banco antes de cada teste
    cy.resetDatabase();
});
```

Esse `beforeEach` global garante que cada teste começa com um banco vazio, sem herdar dados do teste anterior. Isso se chama **isolamento entre testes**.

**`cypress/support/commands.ts`** (comandos personalizados disponíveis em qualquer teste):

| Comando | O que faz |
|---|---|
| `cy.resetDatabase()` | Chama `POST /api/teste/resetar-banco` para limpar o banco |
| `cy.registerUser({ nome, email, senha })` | Cadastra um usuário via API, sem passar pela UI |
| `cy.login(email, senha)` | Faz login via API e salva o token no `localStorage` |

Esses comandos existem para preparar o estado antes dos testes sem depender da interface. Essa prática se chama **setup via API**.

## A sintaxe do Cypress

A sintaxe nativa do Cypress usa a mesma estrutura que você já conhece do Jest:

| Jest (aula 14) | Cypress |
|---|---|
| `describe('nome', () => {})` | `describe('nome', () => {})` |
| `it('deve fazer X', () => {})` | `it('deve fazer X', () => {})` |
| `beforeEach(() => {})` | `beforeEach(() => {})` |
| `expect(valor).toBe(esperado)` | `cy.get('[data-testid="x"]').should('be.visible')` |

A diferença principal está em como as verificações funcionam. No Jest, você chama uma função e verifica o valor que ela retorna:

```typescript
// soma() retorna 5, você compara com o esperado
expect(soma(2, 3)).toBe(5);
```

No Cypress não há retorno para verificar: você está interagindo com elementos de uma página que carrega de forma assíncrona. A verificação é encadeada diretamente no elemento:

```typescript
// cy.get(...) localiza o elemento → .should(...) verifica algo sobre ele
cy.get('[data-testid="email-input"]').should('be.visible');
```

O `.should()` tem um comportamento especial: o Cypress vai tentar a asserção repetidamente até ela passar ou o tempo esgotar. Isso é necessário porque elementos aparecem, somem e mudam na página o tempo todo.

## Parte 1: Seu primeiro teste

Vamos criar o arquivo de testes de autenticação e escrever o primeiro teste, o mais simples possível: visitar a página de login e verificar que o formulário está lá.

### 1.1 Crie o arquivo

Crie o arquivo `cypress/e2e/auth/autenticacao.cy.ts`:

```typescript
describe('Autenticação', () => {
    it('deve exibir o formulário de login', () => {
        cy.visit('/login');

        cy.get('[data-testid="email-input"]').should('be.visible');
        cy.get('[data-testid="password-input"]').should('be.visible');
        cy.get('[data-testid="login-button"]').should('be.visible');
    });
});
```

Cada linha faz exatamente uma coisa:

- `cy.visit('/login')`: navega até `http://localhost:5173/login`
  - O Cypress pega o `baseUrl` definido em `cypress.config.ts` (`http://localhost:5173`) e junta com o caminho que você passou (`/login`), então você nunca precisa repetir o endereço completo nos testes
- `cy.get('[data-testid="email-input"]')`: encontra o elemento com esse atributo na página
- `.should('be.visible')`: verifica que o elemento está visível para o usuário

### 1.2 Execute no Cypress

No Cypress, clique em `autenticacao.cy.ts`. Você vai ver o navegador abrir, navegar até `/login` e verificar os três elementos.

> **Checkpoint:** 1 teste verde. Clique em qualquer linha no painel esquerdo para ver uma captura de tela daquele momento exato. Esse recurso se chama *time travel debugging*.

### 1.3 Adicione um segundo caso

Agora adicione um segundo `it()` dentro do mesmo `describe`. Complete os trechos marcados com `___`:

```typescript
    it('deve exibir o formulário de cadastro', () => {
        cy.visit(___); // ← qual é a rota? (veja client/src/App.tsx)

        cy.get('[data-testid="name-input"]').should('be.visible');
        cy.get('[data-testid="email-input"]').should('be.visible');
        cy.get(___).should('be.visible'); // ← data-testid do botão (veja pages/Register/index.tsx)
    });
```

Execute de novo. Os dois testes devem passar.

> **Checkpoint:** 2 testes verdes.

### 1.4 Por conta própria

Em `cypress/e2e/auth/autenticacao.cy.ts`, dentro do `describe('Autenticação')`, escreva um teste que visite a página de login e verifique que nenhuma mensagem de erro está visível antes de qualquer interação.

> Para verificar que um elemento não existe na página, use `.should('not.exist')`.

## Parte 2: Login com credenciais válidas

Agora vamos testar um fluxo real: criar um usuário e fazer login com ele. Adicione o `it()` abaixo dentro do `describe('Autenticação')` existente:

```typescript
    it('deve fazer login com credenciais válidas', () => {
        cy.registerUser({ nome: 'Usuário Teste', email: 'usuario@teste.com', senha: 'Senha123' });

        cy.visit('/login');
        cy.get('[data-testid="email-input"]').type('usuario@teste.com');
        cy.get('[data-testid="password-input"]').type('Senha123');
        cy.get('[data-testid="login-button"]').click();

        cy.url().should('include', '/tasks');
        cy.get('[data-testid="task-list"]').should('exist');
    });
```

O que cada linha nova faz:

- **`cy.registerUser(...)`**: cria o usuário via API antes de qualquer interação com a UI
  - O banco foi limpo pelo `beforeEach` global, então o usuário precisa ser criado antes de tentar logar
- **`.type('usuario@teste.com')`**: digita no campo selecionado, caractere por caractere
- **`.click()`**: clica no elemento
- **`cy.url().should('include', '/tasks')`**: verifica que após o login a URL contém `/tasks`

Execute no Cypress.

> **Checkpoint:** 3 testes verdes.

**Se o teste falhar, leia a mensagem de erro:**

- `Timed out... cy.get() failed`: o seletor não encontrou o elemento
  - Verifique o `data-testid` correto no arquivo do componente
- `expected '...' to include '/tasks'`: a asserção falhou
  - O Cypress mostra o valor recebido vs. o esperado
- `cy.request()` falhou com status 4xx/5xx
  - Verifique se o backend está rodando em modo de teste

### Por que usar `data-testid`?

Você poderia selecionar elementos de outras formas:

```typescript
// frágil: quebra se outro input for adicionado
cy.get('input').first().type(email);
// frágil: quebra se os estilos mudarem
cy.get('.input-email').type(email);
// robusto: existe só para os testes
cy.get('[data-testid="email-input"]').type(email);
```

O `data-testid` é um atributo sem efeito visual. Se o desenvolvedor mudar o CSS ou reestruturar o HTML, o teste continua funcionando. Todo o frontend desta aplicação já foi preparado com esses atributos. Para ver quais estão disponíveis, abra qualquer arquivo em `client/src/pages/` e procure por `data-testid`.

### Por conta própria

Em `cypress/e2e/auth/autenticacao.cy.ts`, dentro do `describe('Autenticação')`, escreva um teste que tente fazer login com um e-mail que não está cadastrado e verifique que a mensagem de erro aparece.

## Parte 3: Mais cenários de autenticação

Adicione os dois `it()` abaixo dentro do mesmo `describe('Autenticação')`.

O primeiro verifica o **registro bem-sucedido**. Complete os trechos:

```typescript
    it('deve registrar com dados válidos', () => {
        cy.visit(___); // ← rota da página de cadastro

        cy.get('[data-testid="name-input"]').type('Maria Teste');
        cy.get('[data-testid="email-input"]').type('maria@teste.com');
        cy.get('[data-testid="password-input"]').type('Senha123');
        cy.get('[data-testid="register-button"]').click();

        cy.get('[data-testid="success-message"]').should(___); // ← asserção de visibilidade
    });
```

O segundo verifica o **login com senha incorreta**. Complete:

```typescript
    it('deve mostrar erro com senha incorreta', () => {
        cy.registerUser({ nome: 'Usuário Teste', email: 'usuario@teste.com', senha: 'Senha123' });

        cy.visit('/login');
        cy.get('[data-testid="email-input"]').type('usuario@teste.com');
        cy.get('[data-testid="password-input"]').type('SenhaErrada');
        cy.get('[data-testid="login-button"]').click();

        cy.get(___).should('be.visible'); // ← data-testid da mensagem de erro (veja pages/Login/index.tsx)
    });
```

**Pontos de apoio:**
- As rotas estão em `client/src/App.tsx`
- A asserção de visibilidade é `.should('be.visible')`

Execute e verifique que os 5 testes passam.

> **Checkpoint:** 5 testes verdes. Se algum falhou, clique nos comandos no painel esquerdo do Cypress para ver o estado exato da tela naquele momento.

### Por conta própria

Em `cypress/e2e/auth/autenticacao.cy.ts`, dentro do `describe('Autenticação')`, escreva um teste que acesse a página `/tasks` sem estar autenticado e verifique que a aplicação redireciona para `/login`.

> Para verificar para qual página a aplicação redirecionou, use `cy.url().should('include', '/caminho')`.

## Parte 4: Testes de tarefas

### Por que usar `cy.login()` em vez da UI?

Quase todos os testes de tarefas precisam de um usuário autenticado. Você poderia navegar pela tela de login em cada teste, mas isso:

1. Torna os testes mais lentos (mais interações com a UI)
2. Cria dependência: se o login quebrar, todos os testes de tarefas também quebram

`cy.login()` chama a API diretamente, obtém o token JWT e o salva no `localStorage`. É exatamente o que o frontend faz após um login bem-sucedido, mas sem passar pela UI.

### Como os `beforeEach` se encadeiam

Cada teste de tarefas precisa de duas coisas antes de rodar: banco limpo e um usuário autenticado. O banco já é cuidado pelo `beforeEach` global em `e2e.ts`, que roda antes de qualquer teste do projeto. Para o usuário, vamos adicionar um `beforeEach` local dentro do próprio `describe`. O Cypress garante que os dois rodam em ordem, antes do `it`:

1. **`beforeEach` global** (`e2e.ts`): executa `cy.resetDatabase()` → banco limpo
2. **`beforeEach` local** (`tarefas.cy.ts`): registra o usuário e faz login → usuário pronto
3. **`it(...)`**: o teste em si

### 4.1 Crie o arquivo de teste de tarefas

Crie o arquivo `cypress/e2e/tasks/tarefas.cy.ts`:

```typescript
describe('Gerenciamento de Tarefas', () => {
    beforeEach(() => {
        cy.registerUser({ nome: 'Usuário Teste', email: 'usuario@teste.com', senha: 'Senha123' });
        cy.login('usuario@teste.com', 'Senha123');
    });

    it('deve exibir lista vazia quando não há tarefas', () => {
        cy.visit('/tasks');
        cy.get('[data-testid="empty-state"]').should('be.visible');
    });

    it('deve criar uma tarefa com dados válidos', () => {
        cy.visit('/tasks/create');
        cy.get('[data-testid="title-input"]').type('Estudar Cypress');
        cy.get('[data-testid="priority-select"]').select('high');
        cy.get('[data-testid="submit-button"]').click();

        cy.url().should('include', '/tasks');
        cy.url().should('not.include', '/create');
        cy.get('[data-testid="task-list"]').should('contain', 'Estudar Cypress');
    });
});
```

Pontos de atenção:
- `.select('high')` seleciona uma opção em um `<select>` pelo **valor interno**
  - Os valores disponíveis são `'low'`, `'medium'` e `'high'`
  - Veja `client/src/pages/CreateTask/index.tsx`
- `.should('contain', texto)` verifica que um elemento contém aquele texto
- `.should('not.include', '/create')` confirma que o redirecionamento aconteceu após criar a tarefa

Execute os testes no Cypress.

> **Checkpoint:** 2 testes de tarefas verdes.

### 4.2 Mais testes

Adicione ao `describe` de `tarefas.cy.ts`, após os testes existentes:

```typescript
    it('deve criar uma tarefa com prioridade baixa', () => {
        cy.visit('/tasks/create');
        cy.get('[data-testid="title-input"]').type('Tarefa de baixa prioridade');
        cy.get('[data-testid="priority-select"]').select(___); // ← qual é o valor interno para "Baixa"?
        cy.get('[data-testid="submit-button"]').click();

        cy.get('[data-testid="task-list"]').should('contain', 'Tarefa de baixa prioridade');
    });

    it('deve exibir os detalhes de uma tarefa criada', () => {
        cy.visit('/tasks/create');
        cy.get('[data-testid="title-input"]').type('Verificar detalhes');
        cy.get('[data-testid="submit-button"]').click();

        // clica no título da tarefa na lista
        cy.contains('Verificar detalhes').click();

        cy.get(___).should('contain', 'Verificar detalhes'); // ← data-testid do título na página de detalhes
        cy.get('[data-testid="task-status"]').should('contain', ___); // ← qual texto aparece para uma tarefa recém-criada?
    });
```

**Pontos de apoio:**
- Os valores do `<select>` de prioridade estão em `client/src/pages/CreateTask/index.tsx`
- Os `data-testid` da página de detalhes estão em `client/src/pages/TaskDetail/index.tsx`
- Uma tarefa recém-criada tem o status "Pendente"

Execute e verifique que os 4 testes de tarefas passam.

> **Checkpoint:** 4 testes de tarefas verdes.

### 4.3 Por conta própria

Em `cypress/e2e/tasks/tarefas.cy.ts`, dentro do `describe('Gerenciamento de Tarefas')`, escreva um teste que crie duas tarefas com títulos diferentes e verifique que as duas aparecem na lista.

## Parte 5: Atividades

Se você terminou as Partes 1 a 4 antes do fim da aula, continue aqui. Caso contrário, ficam para estudo extraclasse.

### Atividade 1: Editar uma tarefa

Em `cypress/e2e/tasks/tarefas.cy.ts`, dentro do `describe('Gerenciamento de Tarefas')`: crie uma tarefa, acesse seus detalhes, clique em editar, altere o título e salve. Verifique que o novo título aparece na lista de tarefas.

> Para limpar o conteúdo de um campo antes de digitar um novo valor, encadeie `.clear()` antes de `.type()`: `.clear().type('novo texto')`.

### Atividade 2: Marcar uma tarefa como concluída

Em `cypress/e2e/tasks/tarefas.cy.ts`, dentro do `describe('Gerenciamento de Tarefas')`: crie uma tarefa, acesse seus detalhes, abra a edição, marque-a como concluída e salve. Acesse os detalhes novamente e verifique que o status exibido é "Concluída".

> Para marcar um checkbox, use `.check()` no lugar de `.click()`.

### Atividade 3: Excluir uma tarefa

Em `cypress/e2e/tasks/tarefas.cy.ts`, dentro do `describe('Gerenciamento de Tarefas')`: crie uma tarefa, acesse seus detalhes e exclua-a. Verifique que ela não aparece mais na lista de tarefas.

> Para verificar que um elemento não contém um texto, use `.should('not.contain', 'texto')`.

### Atividade 4: Registro com email já cadastrado

Em `cypress/e2e/auth/autenticacao.cy.ts`, dentro do `describe('Autenticação')`: cadastre um usuário via API, depois tente registrar outro usuário com o mesmo e-mail pela interface. Verifique que uma mensagem de erro é exibida.

## Os três níveis da pirâmide

Ao longo das aulas 14 e 15 você escreveu testes nos três níveis. Veja como cada um cobre a criação de uma tarefa:

| Teste | Ferramenta | Como verifica | Velocidade |
|---|---|---|---|
| `calcularEstatisticas(...)` | Jest | Retorno da função | Milissegundos |
| `POST /api/tarefas` com Supertest | Supertest | Status HTTP e banco | Segundos |
| Preencher formulário e clicar "Criar Tarefa" | Cypress | Comportamento no navegador | Segundos a minutos |

A pirâmide sugere **mais testes na base e menos no topo**, não porque E2E seja ruim, mas porque é mais lento e mais frágil (depende do navegador, da rede, da UI). Um bug que quebra um `data-testid` derruba o teste E2E, mas não o unitário. A proporção recomendada: muitos unitários, alguns de integração, poucos E2E cobrindo os fluxos mais críticos.

## Fechamento

Com esta aula você fechou a pirâmide. O projeto agora tem testes nos três níveis: funções isoladas com Jest, rotas HTTP com Supertest e fluxos completos no navegador com Cypress.

O Cypress não exigiu aprender tudo do zero: a estrutura `describe`/`it`/`beforeEach` é a mesma do Jest, e a lógica de preparar dados antes dos testes é a mesma dos testes de integração. O que mudou foi o objeto testado. Em vez de funções ou rotas, você testou o comportamento que o usuário vê na tela.

Três ideias que valem carregar:

- **`data-testid` como contrato:** ao atribuir esses atributos aos elementos, o frontend e os testes firmam um acordo que resiste a mudanças de estilo e de estrutura HTML
- **Setup via API:** preparar o estado (usuário, login) pela API em vez da UI torna os testes mais rápidos e independentes entre si
- **Banco limpo por teste:** o `beforeEach` global garante que cada teste começa do zero, sem herdar dados ou falhas de testes anteriores
