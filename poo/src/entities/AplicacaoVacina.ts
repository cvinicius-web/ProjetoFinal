import { Animal } from "./Animal.js";
import { Vacina } from "./Vacina.js";

export class AplicacaoVacina {
    constructor(
        private animal: Animal,
        private vacina: Vacina,
        private data_aplicacao: string,
        private data_proxima_dose: string
    ) {}

    getAnimal(): Animal {
        return this.animal;
    }

    getVacina(): Vacina {
        return this.vacina;
    }

    getDataAplicacao(): string {
        return this.data_aplicacao;
    }

    getDataProximaDose(): string {
        return this.data_proxima_dose;
    }
}