export class Vacina {

    constructor(
        private id_vacina: number,
        private nome_vacina: string,
        private descricao: string
    ) {}

    getIdVacina(): number {
        return this.id_vacina
    }

    getNomeVacina(): string {
        return this.nome_vacina
    }

    getDescricao(): string {
        return this.descricao
    }
}