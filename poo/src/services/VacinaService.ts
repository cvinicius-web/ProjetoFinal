import { VacinaRepository } from "../repositories/VacinaRepository.js";
import { Vacina } from "../entities/Vacina.js";

export class VacinaService {
    constructor(
        private vacinaRepository: VacinaRepository
    ) {}

    public async cadastrarVacina(id_vacina: number, nome_vacina: string): Promise<Vacina> {
        if (id_vacina <= 0) {
            throw new Error("O ID da vacina deve ser maior que 0");
        }

        const vacinaExiste = await this.vacinaRepository.buscarPorId(id_vacina);
        if (vacinaExiste) {
            throw new Error("Já existe uma vacina cadastrada com este ID");
        }

        const novaVacina = new Vacina(id_vacina, nome_vacina);
        await this.vacinaRepository.salvar(novaVacina);
        return novaVacina;
    }

    public async listarVacinas(): Promise<Vacina[]> {
        return await this.vacinaRepository.listar();
    }
}