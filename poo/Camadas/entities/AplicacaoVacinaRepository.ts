import { AplicacaoVacina } from "../entities/AplicacaoVacina"

export class AplicacaoVacinaRepository {
    private aplicacoes: AplicacaoVacina[] = []

    salvar(aplicacao: AplicacaoVacina): void {
        this.aplicacoes.push(aplicacao)
    }

    listar(): AplicacaoVacina[] {
        return this.aplicacoes
    }
}