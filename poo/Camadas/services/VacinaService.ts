import { VacinaRepository } from "../Repositories/VacinaRepository"
import { Vacina } from "../Entities/Vacina"

export class VacinaService {
    constructor(
        private vacinaRepository: VacinaRepository
    ) {}

    cadastrarVacina(
        id_vacina: number,nome_vacina: string, descricao: string): Vacina {
        
        if (id_vacina <= 0) {
            throw new Error("O ID da vacina deve ser maior que 0")
        }

        const vacinaExiste = this.vacinaRepository.buscarPorId(id_vacina)
        if (vacinaExiste) {
            throw new Error("Já existe uma vacina cadastrada com este ID")
        }

        const novaVacina = new Vacina(id_vacina,nome_vacina,descricao)
        this.vacinaRepository.salvar(novaVacina)
        return novaVacina
    } 

    listarVacinas(): Vacina[] {
        return this.vacinaRepository.listar() 
    }
}