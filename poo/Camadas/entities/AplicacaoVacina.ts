import { Animal } from "./Animal"
import { Vacina } from "./Vacina"

export class AplicacaoVacina {
    constructor(
        private id: number,
        private animal: Animal,
        private vacina: Vacina,
        private dataAplicacao: string,
        private dataProximaDose: string
    ) {}

    getId(): number {
        return this.id
    }

    getAnimal(): Animal {
        return this.animal
    }

    getVacina(): Vacina {
        return this.vacina
    }

    getDataAplicacao(): string {
        return this.dataAplicacao
    }

    getDataProximaDose(): string {
        return this.dataProximaDose
    }
}