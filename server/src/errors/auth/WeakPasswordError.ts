export class WeakPasswordError extends Error {
    constructor(message?: string) {
        super(message ?? 'Senha não atende aos requisitos mínimos');
        this.name = 'WeakPasswordError';
    }
}
