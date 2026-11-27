import { connection } from "../database/connection.js";
import { Especie } from "../entities/Especie.js";
import type { RowDataPacket } from "mysql2";

interface EspecieRow extends RowDataPacket {
    ID_especie: number;
    Nome_especie: string;
}

export class EspecieRepository {
    public async salvar(especie: Especie): Promise<void> {
        await connection.execute(
            "INSERT INTO Especie (ID_especie, Nome_especie) VALUES (?, ?)",
            [especie.getIdEspecie(), especie.getNomeEspecie()]
        );
    }

    public async listar(): Promise<Especie[]> {
        const [rows] = await connection.query<EspecieRow[]>(
            "SELECT ID_especie, Nome_especie FROM Especie"
        );
        return rows.map((row) => this.criarEspecie(row));
    }

    public async buscarPorId(id: number): Promise<Especie | undefined> {
        const [rows] = await connection.execute<EspecieRow[]>(
            "SELECT ID_especie, Nome_especie FROM Especie WHERE ID_especie = ?",
            [id]
        );
        const row = rows[0];
        return row ? this.criarEspecie(row) : undefined;
    }

    private criarEspecie(row: EspecieRow): Especie {
        return new Especie(row.ID_especie, row.Nome_especie);
    }
}