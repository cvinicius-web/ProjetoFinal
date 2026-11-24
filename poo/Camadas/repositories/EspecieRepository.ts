import { Especie } from "../Entities/Especie"

export class EspecieRepository {

    private especies: Especie[] = []

    salvar(especie: Especie): void {
        this.especies.push(especie)
    }

    listar(): Especie[] {
        return this.especies
    }

    buscarPorId(id: number): Especie | undefined {
        return this.especies.find((e) => e.getIdEspecie() === id)
    }
}
