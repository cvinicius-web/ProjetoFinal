import { EspecieRepository } from "../Repositories/EspecieRepository"
import { Especie } from "../Entities/Especie"

export class EspecieService {
    constructor(
        private especieRepository: EspecieRepository
    ) {}

    cadastrarEspecie(id_especie: number, nome_especie: string): Especie {
        
        if (id_especie <= 0) {
            throw new Error("O ID da espécie deve ser maior que 0")
        }

        const especiePorId = this.especieRepository.buscarPorId(id_especie)
        if (especiePorId) {
            throw new Error("Já existe uma espécie cadastrada com este ID")
        }

        const todasEspecies = this.especieRepository.listar()
        const especiePorNome = todasEspecies.find(
            (e) => e.getNomeEspecie().toLowerCase() === nome_especie.toLowerCase()
        )
        if (especiePorNome) {
            throw new Error("Já existe uma espécie cadastrada com este nome")
        }

        const novaEspecie = new Especie(id_especie, nome_especie)
        this.especieRepository.salvar(novaEspecie)
        
        return novaEspecie
    } 

    listarEspecies(): Especie[] {
        return this.especieRepository.listar() 
    }
}
