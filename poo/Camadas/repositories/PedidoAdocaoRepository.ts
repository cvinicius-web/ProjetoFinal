import { PedidoAdocao } from "../Entities/PedidoAdocao"

export class PedidoAdocaoRepository {

    private pedidos: PedidoAdocao[] = []

    salvar(pedido: PedidoAdocao): void {
        this.pedidos.push(pedido)
    }

    listar(): PedidoAdocao[] {
        return this.pedidos
    }

    buscarPorId(id: number): PedidoAdocao | undefined {
        return this.pedidos.find((p) => p.getIdPedido() === id)
    }
}
