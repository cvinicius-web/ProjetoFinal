import { Animal } from "./Animal"

export class AnimalRepository {

    private animais: Animal[] =[]

    salvar(animal: Animal): void {
        this.animais.push(animal)
    }

    listar(): Animal[] {
        return this.animais
    }

    buscarPorId(id: number): Animal | undefined {
        return this.animais.find((a) => a.getId() === id)
    }
}

