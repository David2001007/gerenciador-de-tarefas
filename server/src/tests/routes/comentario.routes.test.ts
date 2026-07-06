import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';

const criarUsuarioETarefa = async () => {
    const email = 'comentario_' + Date.now() + '@teste.com';
    const senha = 'Senha123';

    const registro = await request(app)
        .post('/api/autenticacao/registrar')
        .send({ nome: 'Usuario Teste', email, senha });

    const tarefa = await request(app)
        .post('/api/tarefas')
        .set('Authorization', 'Bearer ' + registro.body.token)
        .send({
            titulo: 'Tarefa para comentario',
            descricao: 'Descricao simples',
            prioridade: 'medium',
        });

    return {
        token: registro.body.token as string,
        tarefaId: tarefa.body.id as number,
    };
};

describe('rotas de comentarios', () => {
    beforeEach(async () => {
        await prisma.comentario.deleteMany();
        await prisma.tarefa.deleteMany();
        await prisma.usuario.deleteMany();
    });

    afterAll(async () => {
        await (prisma as any)[String.fromCharCode(36) + 'disconnect']();
    });

    it('cria um comentario em uma tarefa existente', async () => {
        const { token, tarefaId } = await criarUsuarioETarefa();

        const resposta = await request(app)
            .post('/api/tarefas/' + tarefaId + '/comentarios')
            .set('Authorization', 'Bearer ' + token)
            .send({ texto: 'Comentario criado pela API' });

        expect(resposta.status).toBe(201);
        expect(resposta.body).toMatchObject({
            texto: 'Comentario criado pela API',
            tarefaId,
        });
    });

    it('rejeita comentario vazio', async () => {
        const { token, tarefaId } = await criarUsuarioETarefa();

        const resposta = await request(app)
            .post('/api/tarefas/' + tarefaId + '/comentarios')
            .set('Authorization', 'Bearer ' + token)
            .send({ texto: '   ' });

        expect(resposta.status).toBe(400);
        expect(resposta.body.message).toContain('vazio');
    });
});
