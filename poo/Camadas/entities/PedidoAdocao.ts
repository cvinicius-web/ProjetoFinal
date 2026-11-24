import { Animal } from "./Animal"

export class PedidoAdocao {

    constructor(
        private id_pedido: number,
        private status: string, 
        private data: string,
        private id_animal: Animal 
    ) {}

    getIdPedido(): number {
        return this.id_pedido
    }

    getStatus(): string {
        return this.status
    }

    getData(): string {
        return this.data
    }

    getIdAnimal(): Animal {
        return this.id_animal
    }

    atualizarStatus(novoStatus: string): void {
        this.status = novoStatus
    }
}
