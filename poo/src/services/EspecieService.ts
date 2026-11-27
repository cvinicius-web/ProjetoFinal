import { EspecieRepository } from "../repositories/EspecieRepository.js";
import { Especie } from "../entities/Especie.js";

export class EspecieService {
    constructor(
        private especieRepository: EspecieRepository
    ) {}

    public async cadastrarEspecie(id_especie: number, nome_especie: string): Promise<Especie> {
        if (id_especie <= 0) {
            throw new Error("O ID da espécie deve ser maior que 0");
        }

        const especieExiste = await this.especieRepository.buscarPorId(id_especie);
        if (especieExiste) {
            throw new Error("Já existe uma espécie cadastrada com este ID");
        }

        const todas = await this.especieRepository.listar();
        for (const e of todas) {
            if (e.getNomeEspecie().toLowerCase() === nome_especie.toLowerCase()) {
                throw new Error("Já existe uma espécie cadastrada com este nome");
            }
        }

        const novaEspecie = new Especie(id_especie, nome_especie);
        await this.especieRepository.salvar(novaEspecie);
        return novaEspecie;
    }

    public async listarEspecies(): Promise<Especie[]> {
        return await this.especieRepository.listar();
    }
}