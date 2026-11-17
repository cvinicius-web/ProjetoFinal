import { AnimalRepository } from "./AnimalRepository"
import { EspecieRepository } from "./EspecieRepository"
import { Animal } from "./Animal"

export class AnimalService {
    constructor(
        private especieRepository: EspecieRepository, 
        private animalRepository: AnimalRepository
    ){}

    cadastrarAnimal(id: number, nome: string, idEspecie: number, idadeEstimada: number, porte: string, sexo: string, dataResgate: string): Animal {
        
        if (id <= 0) {
            throw new Error("O id deve ser maior que 0")
        }

        const animalExiste = this.animalRepository.buscarPorId(id)
        if (animalExiste) {
            throw new Error("O id já existe")
        }

        const especieExiste = this.especieRepository.buscarPorId(idEspecie)
        if (!especieExiste) {
            throw new Error("A espécie solicitada ainda não foi cadastrada")
        }

        const novoAnimal = new Animal(id, nome, especieExiste, idadeEstimada, porte, sexo, dataResgate)
        this.animalRepository.salvar(novoAnimal)
        return novoAnimal 
    } 

    listarAnimais(): Animal[] {
        return this.animalRepository.listar() 
    }
}
