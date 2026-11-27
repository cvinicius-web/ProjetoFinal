import { connection } from "../database/connection.js";
import { Animal } from "../entities/Animal.js";
import { Especie } from "../entities/Especie.js";
import type { RowDataPacket } from "mysql2";

interface AnimalRow extends RowDataPacket {
    ID_animal: number;
    Nome: string;
    Porte: string;
    Sexo: string;
    data_resgate: string;
    Situacao: string;
    Idade_estimada: number;
    ID_especie: number;
    Nome_especie: string;
}

export class AnimalRepository {
    public async salvar(animal: Animal): Promise<void> {
        await connection.execute(
            "INSERT INTO Animal (ID_animal, Nome, Porte, Sexo, data_resgate, Situacao, Idade_estimada, ID_especie) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                animal.getId(),
                animal.getNome(),
                animal.getPorte(),
                animal.getSexo(),
                animal.getDataResgate(),
                animal.getSituacao(),
                animal.getIdadeEstimada(),
                animal.getEspecie().getIdEspecie()
            ]
        );
    }

    public async listar(): Promise<Animal[]> {
        const [rows] = await connection.query<AnimalRow[]>(
            `SELECT a.ID_animal, a.Nome, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie, e.Nome_especie
             FROM Animal a
             JOIN Especie e ON a.ID_especie = e.ID_especie`
        );
        return rows.map((row) => this.criarAnimal(row));
    }

    public async buscarPorId(id: number): Promise<Animal | undefined> {
        const [rows] = await connection.execute<AnimalRow[]>(
            `SELECT a.ID_animal, a.Nome, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie, e.Nome_especie
             FROM Animal a
             JOIN Especie e ON a.ID_especie = e.ID_especie
             WHERE a.ID_animal = ?`,
            [id]
        );
        const row = rows[0];
        return row ? this.criarAnimal(row) : undefined;
    }

    public async alterar(animal: Animal): Promise<void> {
        await connection.execute(
            "UPDATE Animal SET Nome = ?, Porte = ?, Sexo = ?, data_resgate = ?, Situacao = ?, Idade_estimada = ?, ID_especie = ? WHERE ID_animal = ?",
            [
                animal.getNome(),
                animal.getPorte(),
                animal.getSexo(),
                animal.getDataResgate(),
                animal.getSituacao(),
                animal.getIdadeEstimada(),
                animal.getEspecie().getIdEspecie(),
                animal.getId()
            ]
        );
    }

    public async remover(id: number): Promise<void> {
        await connection.execute("DELETE FROM Animal WHERE ID_animal = ?", [id]);
    }

    private criarAnimal(row: AnimalRow): Animal {
        const especie = new Especie(row.ID_especie, row.Nome_especie);
        return new Animal(
            row.ID_animal,
            row.Nome,
            row.Idade_estimada,
            especie,
            row.Porte,
            row.Sexo,
            row.data_resgate,
            row.Situacao
        );
    }
}