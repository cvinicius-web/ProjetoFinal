import { connection } from "../database/connection.js";
import { Usuario } from "../entities/Usuario.js";
import type { RowDataPacket } from "mysql2";

interface UsuarioRow extends RowDataPacket {
    CPF: string;
    Senha: string;
    Email: string;
    Adotante: string;
    Nome: string;
    Endereco: string;
    Telefone: string;
    Nascimento: string;
}

export class UsuarioRepository {
    public async salvar(usuario: Usuario): Promise<void> {
        await connection.execute(
            "INSERT INTO Usuario (CPF, Senha, Email, Adotante, Nome, Endereco, Telefone, Nascimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                usuario.getCpf(),
                usuario.getSenha(),
                usuario.getEmail(),
                usuario.getAdotante(),
                usuario.getNome(),
                usuario.getEndereco(),
                usuario.getTelefone(),
                usuario.getNascimento()
            ]
        );
    }

    public async listar(): Promise<Usuario[]> {
        const [rows] = await connection.query<UsuarioRow[]>(
            "SELECT CPF, Senha, Email, Adotante, Nome, Endereco, Telefone, Nascimento FROM Usuario"
        );
        return rows.map((row) => this.criarUsuario(row));
    }

    public async buscarPorCpf(cpf: string): Promise<Usuario | undefined> {
        const [rows] = await connection.execute<UsuarioRow[]>(
            "SELECT CPF, Senha, Email, Adotante, Nome, Endereco, Telefone, Nascimento FROM Usuario WHERE CPF = ?",
            [cpf]
        );
        const row = rows[0];
        return row ? this.criarUsuario(row) : undefined;
    }

    public async buscarPorEmail(email: string): Promise<Usuario | undefined> {
        const [rows] = await connection.execute<UsuarioRow[]>(
            "SELECT CPF, Senha, Email, Adotante, Nome, Endereco, Telefone, Nascimento FROM Usuario WHERE Email = ?",
            [email]
        );
        const row = rows[0];
        return row ? this.criarUsuario(row) : undefined;
    }

    public async alterar(usuario: Usuario): Promise<void> {
        await connection.execute(
            "UPDATE Usuario SET Senha = ?, Email = ?, Adotante = ?, Nome = ?, Endereco = ?, Telefone = ?, Nascimento = ? WHERE CPF = ?",
            [
                usuario.getSenha(),
                usuario.getEmail(),
                usuario.getAdotante(),
                usuario.getNome(),
                usuario.getEndereco(),
                usuario.getTelefone(),
                usuario.getNascimento(),
                usuario.getCpf()
            ]
        );
    }

    public async remover(cpf: string): Promise<void> {
        await connection.execute("DELETE FROM Usuario WHERE CPF = ?", [cpf]);
    }

    private criarUsuario(row: UsuarioRow): Usuario {
        return new Usuario(
            row.CPF,
            row.Senha,
            row.Email,
            row.Adotante,
            row.Nome,
            row.Endereco,
            row.Telefone,
            row.Nascimento
        );
    }
}