export class Vacina {
    constructor(
        private id: number,
        private nome: string
    ) {}

    getId(): number {
        return this.id
    }

    getNome(): string {
        return this.nome
    }
}