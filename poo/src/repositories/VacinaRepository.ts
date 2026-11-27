import { connection } from "../database/connection.js";
import { Vacina } from "../entities/Vacina.js";
import type { RowDataPacket } from "mysql2";

interface VacinaRow extends RowDataPacket {
    ID_vacina: number;
    Nome_vacina: string;
}

export class VacinaRepository {
    public async salvar(vacina: Vacina): Promise<void> {
        await connection.execute(
            "INSERT INTO Vacina (ID_vacina, Nome_vacina) VALUES (?, ?)",
            [vacina.getIdVacina(), vacina.getNomeVacina()]
        );
    }

    public async listar(): Promise<Vacina[]> {
        const [rows] = await connection.query<VacinaRow[]>(
            "SELECT ID_vacina, Nome_vacina FROM Vacina"
        );
        return rows.map((row) => this.criarVacina(row));
    }

    public async buscarPorId(id: number): Promise<Vacina | undefined> {
        const [rows] = await connection.execute<VacinaRow[]>(
            "SELECT ID_vacina, Nome_vacina FROM Vacina WHERE ID_vacina = ?",
            [id]
        );
        const row = rows[0];
        return row ? this.criarVacina(row) : undefined;
    }

    public async buscarObrigatoriasPorEspecie(idEspecie: number): Promise<Vacina[]> {
        const [rows] = await connection.execute<VacinaRow[]>(
            `SELECT v.ID_vacina, v.Nome_vacina
             FROM Vacina v
             JOIN Especie_Vacina ev ON v.ID_vacina = ev.ID_vacina
             WHERE ev.ID_especie = ? AND ev.Obrigatoria = true`,
            [idEspecie]
        );
        return rows.map((row) => this.criarVacina(row));
    }

    public async vacinaPertenceAEspecie(idEspecie: number, idVacina: number): Promise<boolean> {
        const [rows] = await connection.execute<RowDataPacket[]>(
            "SELECT ID_especie FROM Especie_Vacina WHERE ID_especie = ? AND ID_vacina = ?",
            [idEspecie, idVacina]
        );
        return rows.length > 0;
    }

    private criarVacina(row: VacinaRow): Vacina {
        return new Vacina(row.ID_vacina, row.Nome_vacina);
    }
}