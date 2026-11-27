import { connection } from "../database/connection.js";
import { PedidoAdocao } from "../entities/PedidoAdocao.js";
import { Animal } from "../entities/Animal.js";
import { Especie } from "../entities/Especie.js";
import { Usuario } from "../entities/Usuario.js";
import type { RowDataPacket } from "mysql2";

interface PedidoRow extends RowDataPacket {
    ID_pedido: number;
    Status: string;
    Data: string;
    CPF: string;
    ID_animal: number;
    Nome_animal: string;
    Porte: string;
    Sexo: string;
    data_resgate: string;
    Situacao: string;
    Idade_estimada: number;
    ID_especie: number;
    Nome_especie: string;
    Senha: string;
    Email: string;
    Adotante: string;
    Nome_usuario: string;
    Endereco: string;
    Telefone: string;
    Nascimento: string;
}

export class PedidoAdocaoRepository {
    public async salvar(pedido: PedidoAdocao): Promise<void> {
        await connection.execute(
            "INSERT INTO Pedido_adocao (ID_pedido, Status, Data, CPF, ID_animal) VALUES (?, ?, ?, ?, ?)",
            [
                pedido.getIdPedido(),
                pedido.getStatus(),
                pedido.getData(),
                pedido.getAdotante().getCpf(),
                pedido.getAnimal().getId()
            ]
        );
    }

    public async listar(): Promise<PedidoAdocao[]> {
        const [rows] = await connection.query<PedidoRow[]>(
            `SELECT p.ID_pedido, p.Status, p.Data, p.CPF, p.ID_animal,
                    a.Nome AS Nome_animal, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie,
                    e.Nome_especie,
                    u.Senha, u.Email, u.Adotante, u.Nome AS Nome_usuario, u.Endereco, u.Telefone, u.Nascimento
             FROM Pedido_adocao p
             JOIN Animal a ON p.ID_animal = a.ID_animal
             JOIN Especie e ON a.ID_especie = e.ID_especie
             JOIN Usuario u ON p.CPF = u.CPF`
        );
        return rows.map((row) => this.criarPedido(row));
    }

    public async buscarPorId(id: number): Promise<PedidoAdocao | undefined> {
        const [rows] = await connection.execute<PedidoRow[]>(
            `SELECT p.ID_pedido, p.Status, p.Data, p.CPF, p.ID_animal,
                    a.Nome AS Nome_animal, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie,
                    e.Nome_especie,
                    u.Senha, u.Email, u.Adotante, u.Nome AS Nome_usuario, u.Endereco, u.Telefone, u.Nascimento
             FROM Pedido_adocao p
             JOIN Animal a ON p.ID_animal = a.ID_animal
             JOIN Especie e ON a.ID_especie = e.ID_especie
             JOIN Usuario u ON p.CPF = u.CPF
             WHERE p.ID_pedido = ?`,
            [id]
        );
        const row = rows[0];
        return row ? this.criarPedido(row) : undefined;
    }

    public async buscarPorAnimal(idAnimal: number): Promise<PedidoAdocao[]> {
        const [rows] = await connection.execute<PedidoRow[]>(
            `SELECT p.ID_pedido, p.Status, p.Data, p.CPF, p.ID_animal,
                    a.Nome AS Nome_animal, a.Porte, a.Sexo, a.data_resgate, a.Situacao, a.Idade_estimada, a.ID_especie,
                    e.Nome_especie,
                    u.Senha, u.Email, u.Adotante, u.Nome AS Nome_usuario, u.Endereco, u.Telefone, u.Nascimento
             FROM Pedido_adocao p
             JOIN Animal a ON p.ID_animal = a.ID_animal
             JOIN Especie e ON a.ID_especie = e.ID_especie
             JOIN Usuario u ON p.CPF = u.CPF
             WHERE p.ID_animal = ?`,
            [idAnimal]
        );
        return rows.map((row) => this.criarPedido(row));
    }

    public async alterar(pedido: PedidoAdocao): Promise<void> {
        await connection.execute(
            "UPDATE Pedido_adocao SET Status = ?, Data = ?, CPF = ?, ID_animal = ? WHERE ID_pedido = ?",
            [
                pedido.getStatus(),
                pedido.getData(),
                pedido.getAdotante().getCpf(),
                pedido.getAnimal().getId(),
                pedido.getIdPedido()
            ]
        );
    }

    public async remover(id: number): Promise<void> {
        await connection.execute("DELETE FROM Pedido_adocao WHERE ID_pedido = ?", [id]);
    }

    private criarPedido(row: PedidoRow): PedidoAdocao {
        const especie = new Especie(row.ID_especie, row.Nome_especie);
        const animal = new Animal(
            row.ID_animal,
            row.Nome_animal,
            row.Idade_estimada,
            especie,
            row.Porte,
            row.Sexo,
            row.data_resgate,
            row.Situacao
        );
        const usuario = new Usuario(
            row.CPF,
            row.Senha,
            row.Email,
            row.Adotante,
            row.Nome_usuario,
            row.Endereco,
            row.Telefone,
            row.Nascimento
        );
        return new PedidoAdocao(row.ID_pedido, row.Status, row.Data, animal, usuario);
    }
}