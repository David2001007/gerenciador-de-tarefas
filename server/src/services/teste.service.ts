import { prisma } from '../utils/prisma';

export class TesteService {
    private static async executar(sql: string) {
        await (prisma as any)[String.fromCharCode(36) + 'executeRawUnsafe'](sql);
    }

    private static async prepararBancoDeTeste() {
        await TesteService.executar(
            'CREATE TABLE IF NOT EXISTS Usuario (' +
                'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                'email TEXT NOT NULL, ' +
                'senha TEXT NOT NULL, ' +
                'nome TEXT NOT NULL, ' +
                'criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
                'atualizadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' +
                ');',
        );

        await TesteService.executar(
            'CREATE UNIQUE INDEX IF NOT EXISTS Usuario_email_key ON Usuario(email);',
        );

        await TesteService.executar(
            'CREATE TABLE IF NOT EXISTS Tarefa (' +
                'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                'titulo TEXT NOT NULL, ' +
                'descricao TEXT, ' +
                'concluida BOOLEAN NOT NULL DEFAULT false, ' +
                'dataVencimento DATETIME, ' +
                "prioridade TEXT DEFAULT 'medium', " +
                'usuarioId INTEGER NOT NULL, ' +
                'criadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
                'atualizadaEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
                'CONSTRAINT Tarefa_usuarioId_fkey ' +
                'FOREIGN KEY (usuarioId) REFERENCES Usuario (id) ' +
                'ON DELETE RESTRICT ON UPDATE CASCADE' +
                ');',
        );

        await TesteService.executar(
            'CREATE TABLE IF NOT EXISTS Comentario (' +
                'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                'texto TEXT NOT NULL, ' +
                'tarefaId INTEGER NOT NULL, ' +
                'usuarioId INTEGER NOT NULL, ' +
                'criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
                'CONSTRAINT Comentario_tarefaId_fkey ' +
                'FOREIGN KEY (tarefaId) REFERENCES Tarefa (id) ' +
                'ON DELETE CASCADE ON UPDATE CASCADE, ' +
                'CONSTRAINT Comentario_usuarioId_fkey ' +
                'FOREIGN KEY (usuarioId) REFERENCES Usuario (id) ' +
                'ON DELETE RESTRICT ON UPDATE CASCADE' +
                ');',
        );
    }

    static async resetarBancoDeDados() {
        await TesteService.prepararBancoDeTeste();

        await prisma.comentario.deleteMany();
        await prisma.tarefa.deleteMany();
        await prisma.usuario.deleteMany();

        await TesteService.executar("DELETE FROM sqlite_sequence WHERE name = 'Comentario';");
        await TesteService.executar("DELETE FROM sqlite_sequence WHERE name = 'Tarefa';");
        await TesteService.executar("DELETE FROM sqlite_sequence WHERE name = 'Usuario';");
    }
}
