import { contarCaracteres, sanitizarTexto, validarTextoComentario } from '../../utils/comentario.utils';

describe('comentario.utils', () => {
    it('aceita comentario com texto preenchido', () => {
        const resultado = validarTextoComentario('Comentario valido');

        expect(resultado).toEqual({ valido: true });
    });

    it('rejeita comentario vazio', () => {
        const resultado = validarTextoComentario('   ');

        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toContain('vazio');
    });

    it('remove espacos das pontas e conta somente o texto real', () => {
        const texto = '  Comentario com espacos  ';

        expect(sanitizarTexto(texto)).toBe('Comentario com espacos');
        expect(contarCaracteres(texto)).toBe(22);
    });
});
