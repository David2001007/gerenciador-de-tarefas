export class InvalidEmailError extends Error {
    constructor(message?: string) {
        super(message ?? 'E-mail inválido');
        this.name = 'InvalidEmailError';
    }
}
