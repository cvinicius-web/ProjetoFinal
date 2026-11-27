import { connection } from "../database/connection.js";
import { AplicacaoVacina } from "../entities/AplicacaoVacina.js";
import { Animal } from "../entities/Animal.js";
import { Especie } from "../entities/Especie.js";
import { Vacina } from "../entities/Vacina.js";
import type { RowDataPacket } from "mysql2";

interface AplicacaoRow extends RowDataPacket {
    ID_animal: number;
    ID_vacina: number;
    Data_aplicacao: string;
    Data_proxima_dose: string;
    Nome: string;
    Porte: string;
    Sexo: string;
    data_resgate: string;
    Situacao: string;
    Idade_estimada: number;
    ID_especie: number;
    Nome_especie: string;
    Nome_vacina: string;
}

export class AplicacaoVacinaRepository {
    public async salvar(aplicacao: AplicacaoVacina): Promise<void> {
        await connection.execute(
            "INSERT INTO Aplicacao_vacina (ID_animal, ID_vacina, Data_aplicacao, Data_proxima_dose) VALUES (?, ?, ?, ?)",
            [
                aplicacao.getAnimal().getId(),
                aplicacao.getVacina().getIdVacina(),
                aplicacao.getDataAplicacao(),
                aplicacao.getDataProximaDose()
            ]
        );
    }

    public async listar(): Promise<AplicacaoVacina[]> {
        const [rows] = await connection.query<AplicacaoRow[]>(
            `SELECT av.ID_animal, av.ID_vacina, av.Data_aplicacao, av.Data_proxima_dose,
                    a.Nome, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie,
                    e.Nome_especie, v.Nome_vacina
             FROM Aplicacao_vacina av
             JOIN Animal a ON av.ID_animal = a.ID_animal
             JOIN Especie e ON a.ID_especie = e.ID_especie
             JOIN Vacina v ON av.ID_vacina = v.ID_vacina`
        );
        return rows.map((row) => this.criarAplicacao(row));
    }

    public async buscarPorAnimal(idAnimal: number): Promise<AplicacaoVacina[]> {
        const [rows] = await connection.execute<AplicacaoRow[]>(
            `SELECT av.ID_animal, av.ID_vacina, av.Data_aplicacao, av.Data_proxima_dose,
                    a.Nome, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie,
                    e.Nome_especie, v.Nome_vacina
             FROM Aplicacao_vacina av
             JOIN Animal a ON av.ID_animal = a.ID_animal
             JOIN Especie e ON a.ID_especie = e.ID_especie
             JOIN Vacina v ON av.ID_vacina = v.ID_vacina
             WHERE av.ID_animal = ?`,
            [idAnimal]
        );
        return rows.map((row) => this.criarAplicacao(row));
    }

    private criarAplicacao(row: AplicacaoRow): AplicacaoVacina {
        const especie = new Especie(row.ID_especie, row.Nome_especie);
        const animal = new Animal(
            row.ID_animal,
            row.Nome,
            row.Idade_estimada,
            especie,
            row.Porte,
            row.Sexo,
            row.data_resgate,
            row.Situacao
        );
        const vacina = new Vacina(row.ID_vacina, row.Nome_vacina);
        return new AplicacaoVacina(animal, vacina, row.Data_aplicacao, row.Data_proxima_dose);
    }
}