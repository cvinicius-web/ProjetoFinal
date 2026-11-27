import { Animal } from "./Animal.js";
import { Usuario } from "./Usuario.js";

export class PedidoAdocao {
    constructor(
        private id_pedido: number,
        private status: string,
        private data: string,
        private animal: Animal,
        private adotante: Usuario
    ) {}

    getIdPedido(): number {
        return this.id_pedido;
    }

    getStatus(): string {
        return this.status;
    }

    getData(): string {
        return this.data;
    }

    getAnimal(): Animal {
        return this.animal;
    }

    getAdotante(): Usuario {
        return this.adotante;
    }

    atualizarStatus(novoStatus: string): void {
        this.status = novoStatus;
    }
}