import { Especie } from "./Especie"

export class Animal {

    constructor(

        private id: number,
        private nome: string,
        private idadeEstimada: number,
        private especie: Especie,
        private porte: string,
        private sexo: string,
        private dataResgate: string,
        private situacao: string = "Tratamento"

    ) {}

    getId(): number {
    return this.id
    }

    getNome(): string {
        return this.nome
    }

    getEscpecie(): Especie {
        return this.especie
    }

    getIdadeEstimada(): number {
        return this.idadeEstimada
    }

    getPorte(): string {
        return this.porte 
    }

    getSexo(): string {
        return this.sexo
    }

    getDataResgate(): string {
        return this.dataResgate
    }

    getSituacao(): string {
        return this.situacao
    }

    atualizarSituacao(novaSituacao: string): void {
        this.situacao = novaSituacao
}
}
