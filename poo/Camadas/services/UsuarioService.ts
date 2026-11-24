import { UsuarioRepository } from "../Repositories/UsuarioRepository"
import { Usuario } from "../Entities/Usuario"

export class UsuarioService {
    constructor(
        private usuarioRepository: UsuarioRepository
    ) {}

    cadastrarUsuario(cpf: string, senha: string, email: string, adotante: string, nome: string, endereco: string, telefone: string, nascimento: string): Usuario {
        
        if (!cpf || cpf.length !== 11) {
            throw new Error("O CPF deve conter exatamente 11 dígitos")
        }

        const cpfExiste = this.usuarioRepository.buscarPorCpf(cpf)
        if (cpfExiste) {
            throw new Error("Já existe um usuário cadastrado com este CPF")
        }

        const emailExiste = this.usuarioRepository.buscarPorEmail(email)
        if (emailExiste) {
            throw new Error("Este e-mail já está sendo utilizado por outro usuário")
        }

        const novoUsuario = new Usuario(cpf,senha,email,adotante,nome,endereco,telefone,nascimento)
        this.usuarioRepository.salvar(novoUsuario)
        return novoUsuario
    } 

    listarUsuarios(): Usuario[] {
        return this.usuarioRepository.listar() 
    }
}
