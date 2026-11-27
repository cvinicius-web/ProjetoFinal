import { AplicacaoVacinaRepository } from "../repositories/AplicacaoVacinaRepository.js";
import { AnimalRepository } from "../repositories/AnimalRepository.js";
import { VacinaRepository } from "../repositories/VacinaRepository.js";
import { AplicacaoVacina } from "../entities/AplicacaoVacina.js";

export class AplicacaoVacinaService {
    constructor(
        private aplicacaoRepository: AplicacaoVacinaRepository,
        private animalRepository: AnimalRepository,
        private vacinaRepository: VacinaRepository
    ) {}

    public async registrarAplicacao(
        id_animal: number,
        id_vacina: number,
        data_aplicacao: string,
        data_proxima_dose: string
    ): Promise<AplicacaoVacina> {
        const animal = await this.animalRepository.buscarPorId(id_animal);
        if (!animal) {
            throw new Error("Animal não encontrado");
        }

        const vacina = await this.vacinaRepository.buscarPorId(id_vacina);
        if (!vacina) {
            throw new Error("Vacina não encontrada");
        }

        const pertence = await this.vacinaRepository.vacinaPertenceAEspecie(
            animal.getEspecie().getIdEspecie(),
            id_vacina
        );
        if (!pertence) {
            throw new Error("Esta vacina não está vinculada à espécie deste animal");
        }

        const novaAplicacao = new AplicacaoVacina(animal, vacina, data_aplicacao, data_proxima_dose);
        await this.aplicacaoRepository.salvar(novaAplicacao);
        return novaAplicacao;
    }

    public async listarAplicacoes(): Promise<AplicacaoVacina[]> {
        return await this.aplicacaoRepository.listar();
    }

    public async listarVacinasVencendoEm15Dias(dataHoje: string, dataDaqui15Dias: string): Promise<AplicacaoVacina[]> {
        const resultado: AplicacaoVacina[] = [];
        const todas = await this.aplicacaoRepository.listar();

        for (const app of todas) {
            const proxima = app.getDataProximaDose();
            if (proxima >= dataHoje && proxima <= dataDaqui15Dias) {
                resultado.push(app);
            }
        }

        return resultado;
    }
}