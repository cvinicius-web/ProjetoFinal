export class Usuario {
    constructor(
        private cpf: string,
        private senha: string,
        private email: string,
        private adotante: string,
        private nome: string,
        private endereco: string,
        private telefone: string,
        private nascimento: string
    ) {}

    getCpf(): string {
        return this.cpf;
    }

    getSenha(): string {
        return this.senha;
    }

    getEmail(): string {
        return this.email;
    }

    getAdotante(): string {
        return this.adotante;
    }

    getNome(): string {
        return this.nome;
    }

    getEndereco(): string {
        return this.endereco;
    }

    getTelefone(): string {
        return this.telefone;
    }

    getNascimento(): string {
        return this.nascimento;
    }
}