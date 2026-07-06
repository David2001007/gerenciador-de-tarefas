import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';

const prepararBancoDeTeste = async () => {
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Usuario (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            senha TEXT NOT NULL,
            nome TEXT NOT NULL,
            criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS Usuario_email_key
        ON Usuario(email);
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Tarefa (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            concluida BOOLEAN NOT NULL DEFAULT false,
            dataVencimento DATETIME,
            prioridade TEXT DEFAULT 'medium',
            usuarioId INTEGER NOT NULL,
            criadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT Tarefa_usuarioId_fkey
                FOREIGN KEY (usuarioId) REFERENCES Usuario (id)
                ON DELETE RESTRICT ON UPDATE CASCADE
        );
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS Comentario (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            texto TEXT NOT NULL,
            tarefaId INTEGER NOT NULL,
            usuarioId INTEGER NOT NULL,
            criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT Comentario_tarefaId_fkey
                FOREIGN KEY (tarefaId) REFERENCES Tarefa (id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT Comentario_usuarioId_fkey
                FOREIGN KEY (usuarioId) REFERENCES Usuario (id)
                ON DELETE RESTRICT ON UPDATE CASCADE
        );
    `);
};

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
    beforeAll(async () => {
        await prepararBancoDeTeste();
    });

    beforeEach(async () => {
        await prisma.comentario.deleteMany();
        await prisma.tarefa.deleteMany();
        await prisma.usuario.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
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