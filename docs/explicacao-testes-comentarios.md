# Explicacao dos testes de comentarios

Este documento explica os testes criados para a funcionalidade de comentarios da aplicacao Gerenciador de Tarefas.

A atividade pede 6 testes no total:

- 3 testes unitarios com Jest.
- 2 testes de API/integracao com Supertest.
- 1 teste end-to-end com Cypress.

Todos os testes focam somente na funcionalidade de comentarios.

## 1. Testes unitarios

Arquivo:

`server/src/tests/services/comentario.utils.test.ts`

Esses testes verificam funcoes pequenas e isoladas do arquivo `comentario.utils.ts`.

Eles nao usam banco de dados, servidor, rotas ou navegador. Por isso sao chamados de testes unitarios: testam uma unidade pequena do sistema.

### Teste 1: aceita comentario com texto preenchido

O que faz:

Chama a funcao `validarTextoComentario` passando o texto `Comentario valido`.

O que espera:

Espera que a funcao retorne `{ valido: true }`.

O que cobre:

Cobre o cenario positivo da validacao de comentario. Ou seja, garante que um comentario com texto real e permitido pelo sistema.

Como explicar:

"Esse teste confirma que a regra de validacao aceita um comentario normal, com texto preenchido."

### Teste 2: rejeita comentario vazio

O que faz:

Chama a funcao `validarTextoComentario` passando apenas espacos em branco.

O que espera:

Espera que `valido` seja `false` e que a mensagem contenha a palavra `vazio`.

O que cobre:

Cobre um cenario negativo obrigatorio. Garante que o sistema nao aceite comentarios vazios ou feitos somente com espacos.

Como explicar:

"Esse e o teste negativo dos unitarios. Ele prova que um comentario vazio nao passa na validacao."

### Teste 3: remove espacos das pontas e conta somente o texto real

O que faz:

Usa o texto `  Comentario com espacos  `, com espacos antes e depois.

Depois chama:

- `sanitizarTexto`, para remover os espacos das pontas.
- `contarCaracteres`, para contar apenas o texto depois do `trim`.

O que espera:

Espera que o texto final seja `Comentario com espacos` e que a contagem seja `22`.

O que cobre:

Cobre a limpeza do texto antes de salvar ou validar. Isso evita que espacos extras no inicio ou no fim sejam considerados como parte real do comentario.

Como explicar:

"Esse teste mostra que o sistema trata o texto antes de usar: remove espacos desnecessarios e conta somente o conteudo real."

## 2. Testes de API/integracao

Arquivo:

`server/src/tests/routes/comentario.routes.test.ts`

Esses testes usam Supertest para fazer requisicoes HTTP na API Express.

Eles testam a integracao entre:

- rota HTTP;
- middleware de autenticacao;
- controller;
- service;
- banco de dados de teste.

### Preparacao usada nos testes

Antes de testar comentario, o arquivo garante que as tabelas de teste existem, porque este projeto pode estar sem migrations aplicadas no banco de teste. Depois disso, ele cria:

1. um usuario pela rota `/api/autenticacao/registrar`;
2. uma tarefa pela rota `/api/tarefas`;
3. usa o token desse usuario para testar os comentarios.

Isso e necessario porque comentario pertence a uma tarefa e a um usuario autenticado.

### Teste 4: cria um comentario em uma tarefa existente

O que faz:

Envia uma requisicao `POST` para:

`/api/tarefas/:tarefaId/comentarios`

Com o corpo:

```json
{
  "texto": "Comentario criado pela API"
}
```

O que espera:

Espera status HTTP `201`, que significa "criado com sucesso".

Tambem confere se a resposta tem:

- o texto enviado;
- o id da tarefa correta.

O que cobre:

Cobre o fluxo positivo da API de comentarios. Garante que um usuario autenticado consegue criar um comentario em uma tarefa existente.

Como explicar:

"Esse teste valida o caminho feliz da API: usuario autenticado, tarefa existente e comentario valido. A resposta precisa ser 201 e devolver o comentario criado."

### Teste 5: rejeita comentario vazio

O que faz:

Envia uma requisicao `POST` para a rota de comentarios, mas com texto contendo apenas espacos.

O que espera:

Espera status HTTP `400`, que significa erro de requisicao.

Tambem confere se a mensagem de erro fala que o comentario esta vazio.

O que cobre:

Cobre o cenario negativo da API. Garante que a regra de validacao tambem funciona quando o usuario tenta criar comentario pela rota HTTP.

Como explicar:

"Esse e o teste negativo da API. Mesmo chegando pela rota HTTP, o sistema bloqueia comentario vazio e responde 400."

## 3. Teste end-to-end

Arquivo:

`cypress/e2e/comentarios.cy.ts`

Esse teste usa Cypress e simula o uso real da aplicacao no navegador.

Ele cobre a integracao completa entre:

- frontend React;
- API;
- autenticacao;
- banco de dados;
- tela de detalhes da tarefa;
- componente de comentarios.

### Teste 6: adiciona um comentario em uma tarefa pela interface

O que faz:

1. Cria um usuario de teste.
2. Faz login com esse usuario.
3. Cria uma tarefa para receber o comentario.
4. Abre a tela de detalhes da tarefa.
5. Verifica se a secao de comentarios aparece.
6. Confere que o contador comeca em `0`.
7. Digita `Comentario feito pelo Cypress`.
8. Clica no botao de comentar.
9. Confere se o comentario apareceu na tela.
10. Confere se o contador mudou para `1`.

O que espera:

Espera que o comentario apareca visualmente para o usuario e que o contador seja atualizado.

O que cobre:

Cobre o fluxo positivo completo pela interface. Esse teste garante que a funcionalidade funciona do ponto de vista do usuario final.

Como explicar:

"Esse teste representa o usuario usando o sistema. Ele abre a tarefa, escreve um comentario, envia e verifica se apareceu na tela."

## Resumo para apresentacao

Uma forma simples de explicar:

"Eu dividi os testes seguindo a piramide de testes. Nos unitarios, testei as regras pequenas de validacao e tratamento do texto do comentario. Nos testes de API, testei se a rota cria comentario e rejeita comentario vazio. No E2E, testei o fluxo completo no navegador, como o usuario realmente usaria."

## Comandos para rodar

### Rodar testes unitarios

```bash
cd server
npm run test:unit
```

### Rodar testes de API/integracao

```bash
cd server
npm run test:integration
```

### Rodar teste E2E visual

```bash
npm run test:e2e
```

### Rodar teste E2E no terminal

```bash
npm run test:e2e:ci
```

