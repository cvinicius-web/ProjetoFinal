import { Vacina } from "../entities/Vacina"
import { AplicacaoVacina } from "../entities/AplicacaoVacina"
import { VacinaRepository } from "../repositories/VacinaRepository"
import { AplicacaoVacinaRepository } from "../repositories/AplicacaoVacinaRepository"
import { AnimalRepository } from "../repositories/AnimalRepository"

export class VacinaService {
    constructor(
        private vacinaRepository: VacinaRepository,
        private aplicacaoRepository: AplicacaoVacinaRepository,
        private animalRepository: AnimalRepository
    ) {}

    cadastrarVacina(id: number, nome: string): Vacina {
        if (id <= 0) throw new Error("O id deve ser maior que 0")
        if (this.vacinaRepository.buscarPorId(id)) throw new Error("O id já existe")

        const novaVacina = new Vacina(id, nome)
        this.vacinaRepository.salvar(novaVacina)
        return novaVacina
    }

    registrarAplicacao(id: number, idAnimal: number, idVacina: number, dataAplicacao: string, dataProximaDose: string): AplicacaoVacina {
        const animal = this.animalRepository.buscarPorId(idAnimal)
        if (!animal) throw new Error("Animal não encontrado")

        const vacina = this.vacinaRepository.buscarPorId(idVacina)
        if (!vacina) throw new Error("Vacina não encontrada")

        const aplicacao = new AplicacaoVacina(id, animal, vacina, dataAplicacao, dataProximaDose)
        this.aplicacaoRepository.salvar(aplicacao)
        return aplicacao
    }

    listarAplicacoes(): AplicacaoVacina[] {
        return this.aplicacaoRepository.listar()
    }
}