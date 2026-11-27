import { AnimalRepository } from "../repositories/AnimalRepository.js";
import { EspecieRepository } from "../repositories/EspecieRepository.js";
import { VacinaRepository } from "../repositories/VacinaRepository.js";
import { AplicacaoVacinaRepository } from "../repositories/AplicacaoVacinaRepository.js";
import { Animal } from "../entities/Animal.js";

export class AnimalService {
    constructor(
        private especieRepository: EspecieRepository,
        private animalRepository: AnimalRepository,
        private vacinaRepository: VacinaRepository,
        private aplicacaoVacinaRepository: AplicacaoVacinaRepository
    ) {}

    public async cadastrarAnimal(
        id: number,
        nome: string,
        idEspecie: number,
        idadeEstimada: number,
        porte: string,
        sexo: string,
        dataResgate: string
    ): Promise<Animal> {
        if (id <= 0) {
            throw new Error("O id deve ser maior que 0");
        }

        const animalExiste = await this.animalRepository.buscarPorId(id);
        if (animalExiste) {
            throw new Error("O id já existe");
        }

        const especieExiste = await this.especieRepository.buscarPorId(idEspecie);
        if (!especieExiste) {
            throw new Error("A espécie solicitada ainda não foi cadastrada");
        }

        const novoAnimal = new Animal(id, nome, idadeEstimada, especieExiste, porte, sexo, dataResgate);
        await this.animalRepository.salvar(novoAnimal);
        return novoAnimal;
    }

    public async atualizarSituacao(idAnimal: number, novaSituacao: string, dataHoje: string): Promise<Animal> {
        const animal = await this.animalRepository.buscarPorId(idAnimal);
        if (!animal) {
            throw new Error("Animal não encontrado");
        }

        if (novaSituacao.toLowerCase() === "disponivel" || novaSituacao.toLowerCase() === "disponível") {
            const idEspecie = animal.getEspecie().getIdEspecie();
            const obrigatorias = await this.vacinaRepository.buscarObrigatoriasPorEspecie(idEspecie);
            const aplicacoes = await this.aplicacaoVacinaRepository.buscarPorAnimal(idAnimal);

            for (const vacinaObrig of obrigatorias) {
                let emDia = false;

                for (const app of aplicacoes) {
                    const mesmaVacina = app.getVacina().getIdVacina() === vacinaObrig.getIdVacina();
                    const naoVenceu = app.getDataProximaDose() >= dataHoje;
                    if (mesmaVacina && naoVenceu) {
                        emDia = true;
                    }
                }

                if (!emDia) {
                    throw new Error(`O animal não pode ficar disponível: vacina "${vacinaObrig.getNomeVacina()}" pendente ou vencida`);
                }
            }
        }

        animal.atualizarSituacao(novaSituacao);
        await this.animalRepository.alterar(animal);
        return animal;
    }

    public async removerAnimal(id: number): Promise<void> {
        const animal = await this.animalRepository.buscarPorId(id);
        if (!animal) {
            throw new Error("Animal não encontrado");
        }
        await this.animalRepository.remover(id);
    }

    public async pesquisarDisponiveis(
        idEspecie?: number,
        porte?: string,
        sexo?: string,
        idadeEstimada?: number
    ): Promise<Animal[]> {
        const resultado: Animal[] = [];
        const todos = await this.animalRepository.listar();

        for (const animal of todos) {
            const sit = animal.getSituacao().toLowerCase();
            if (sit !== "disponivel" && sit !== "disponível") {
                continue;
            }
            if (idEspecie && animal.getEspecie().getIdEspecie() !== idEspecie) {
                continue;
            }
            if (porte && animal.getPorte().toLowerCase() !== porte.toLowerCase()) {
                continue;
            }
            if (sexo && animal.getSexo().toLowerCase() !== sexo.toLowerCase()) {
                continue;
            }
            if (idadeEstimada !== undefined && animal.getIdadeEstimada() !== idadeEstimada) {
                continue;
            }

            resultado.push(animal);
        }

        return resultado;
    }

    public async listarDisponiveisMaisTempo(): Promise<Animal[]> {
        const disponiveis = await this.pesquisarDisponiveis();

        for (let i = 0; i < disponiveis.length; i++) {
            for (let j = i + 1; j < disponiveis.length; j++) {
                if (disponiveis[j].getDataResgate() < disponiveis[i].getDataResgate()) {
                    const temp = disponiveis[i];
                    disponiveis[i] = disponiveis[j];
                    disponiveis[j] = temp;
                }
            }
        }

        return disponiveis;
    }

    public async listarAnimais(): Promise<Animal[]> {
        return await this.animalRepository.listar();
    }
}