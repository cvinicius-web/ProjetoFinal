import { Usuario } from "../Entities/Usuario"

export class UsuarioRepository {

    private usuarios: Usuario[] = []

    salvar(usuario: Usuario): void {
        this.usuarios.push(usuario)
    }

    listar(): Usuario[] {
        return this.usuarios
    }

    buscarPorCpf(cpf: string): Usuario | undefined {
        return this.usuarios.find((u) => u.getCpf() === cpf)
    }

    buscarPorEmail(email: string): Usuario | undefined {
        return this.usuarios.find((u) => u.getEmail().toLowerCase() === email.toLowerCase())
    }
}
