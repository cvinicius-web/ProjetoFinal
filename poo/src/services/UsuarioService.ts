import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { Usuario } from "../entities/Usuario.js";

export class UsuarioService {
    constructor(
        private usuarioRepository: UsuarioRepository
    ) {}

    public async cadastrarUsuario(
        cpf: string,
        senha: string,
        email: string,
        adotante: string,
        nome: string,
        endereco: string,
        telefone: string,
        nascimento: string
    ): Promise<Usuario> {
        if (!cpf || cpf.length !== 11) {
            throw new Error("O CPF deve conter exatamente 11 dígitos");
        }

        const cpfExiste = await this.usuarioRepository.buscarPorCpf(cpf);
        if (cpfExiste) {
            throw new Error("Já existe um usuário cadastrado com este CPF");
        }

        const emailExiste = await this.usuarioRepository.buscarPorEmail(email);
        if (emailExiste) {
            throw new Error("Este e-mail já está sendo utilizado por outro usuário");
        }

        const novoUsuario = new Usuario(cpf, senha, email, adotante, nome, endereco, telefone, nascimento);
        await this.usuarioRepository.salvar(novoUsuario);
        return novoUsuario;
    }

    public async alterarUsuario(
        cpf: string,
        senha: string,
        email: string,
        adotante: string,
        nome: string,
        endereco: string,
        telefone: string,
        nascimento: string
    ): Promise<Usuario> {
        const usuarioExiste = await this.usuarioRepository.buscarPorCpf(cpf);
        if (!usuarioExiste) {
            throw new Error("Usuário não encontrado");
        }

        const usuarioAtualizado = new Usuario(cpf, senha, email, adotante, nome, endereco, telefone, nascimento);
        await this.usuarioRepository.alterar(usuarioAtualizado);
        return usuarioAtualizado;
    }

    public async removerUsuario(cpf: string): Promise<void> {
        const usuarioExiste = await this.usuarioRepository.buscarPorCpf(cpf);
        if (!usuarioExiste) {
            throw new Error("Usuário não encontrado");
        }
        await this.usuarioRepository.remover(cpf);
    }

    public async listarUsuarios(): Promise<Usuario[]> {
        return await this.usuarioRepository.listar();
    }
}