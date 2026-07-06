describe('Comentarios', () => {
    it('adiciona um comentario em uma tarefa pela interface', () => {
        const usuario = {
            nome: 'Usuario Comentario',
            email: 'comentario@teste.com',
            senha: 'Senha123',
        };
        const textoComentario = 'Comentario feito pelo Cypress';

        cy.registerUser(usuario);
        cy.login(usuario.email, usuario.senha);

        cy.window()
            .its('localStorage.token')
            .then((token) => {
                cy.request({
                    method: 'POST',
                    url: `${Cypress.env('apiUrl')}/tarefas`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: {
                        titulo: 'Tarefa com comentario',
                        descricao: 'Tarefa criada para testar comentarios',
                        prioridade: 'medium',
                    },
                }).then(({ body }) => {
                    cy.visit(`/tasks/${body.id}`);
                });
            });

        cy.get('[data-testid="comment-section"]').should('be.visible');
        cy.get('[data-testid="comment-count"]').should('contain', '0');

        cy.get('[data-testid="comment-input"]').type(textoComentario);
        cy.get('[data-testid="comment-submit"]').click();

        cy.get('[data-testid="comment-item"]').should('contain', textoComentario);
        cy.get('[data-testid="comment-count"]').should('contain', '1');
    });
});
