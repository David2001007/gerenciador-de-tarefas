import { TAMANHO_MAXIMO_COMENTARIO, validarTextoComentario } from '../../utils/comentario.utils';

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

    it('rejeita comentario com mais de 500 caracteres', () => {
        const textoMuitoGrande = 'a'.repeat(TAMANHO_MAXIMO_COMENTARIO + 1);

        const resultado = validarTextoComentario(textoMuitoGrande);

        expect(resultado.valido).toBe(false);
        expect(resultado.mensagem).toContain(String(TAMANHO_MAXIMO_COMENTARIO));
    });
});