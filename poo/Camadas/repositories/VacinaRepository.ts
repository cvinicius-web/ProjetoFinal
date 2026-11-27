import { Vacina } from "../Entities/Vacina"

export class VacinaRepository {

    private vacinas: Vacina[] = []

    salvar(vacina: Vacina): void {
        this.vacinas.push(vacina)
    }

    listar(): Vacina[] {
        return this.vacinas
    }

    buscarPorId(id: number): Vacina | undefined {
        return this.vacinas.find((v) => v.getIdVacina() === id)
    }
}