export class Especie {
    constructor(
        private id_especie: number,
        private nome_especie: string
    ) {}

    getIdEspecie(): number {
        return this.id_especie;
    }

    getNomeEspecie(): string {
        return this.nome_especie;
    }
}