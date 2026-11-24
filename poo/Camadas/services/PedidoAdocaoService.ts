import { PedidoAdocaoRepository } from "../Repositories/PedidoAdocaoRepository"
import { AnimalRepository } from "../Repositories/AnimalRepository"
import { PedidoAdocao } from "../Entities/PedidoAdocao"

export class PedidoAdocaoService {
    constructor(
        private pedidoAdocaoRepository: PedidoAdocaoRepository,
        private animalRepository: AnimalRepository
    ) {}

    cadastrarPedido(

        id_pedido: number, status: string, data: string, id_animal: number): PedidoAdocao {
        
        if (id_pedido <= 0) {
            throw new Error("O ID do pedido deve ser maior que 0")
        }

        const pedidoExiste = this.pedidoAdocaoRepository.buscarPorId(id_pedido)
        if (pedidoExiste) {
            throw new Error("Já existe um pedido de adoção cadastrado com este ID")
        }

        const animalExiste = this.animalRepository.buscarPorId(id_animal)
        if (!animalExiste) {
            throw new Error("O animal informado para o pedido não foi encontrado")
        }
    
        const novoPedido = new PedidoAdocao(
            id_pedido, status, data, animalExiste
        )
        
        this.pedidoAdocaoRepository.salvar(novoPedido)
        return novoPedido
    } 

    listarPedidos(): PedidoAdocao[] {
        return this.pedidoAdocaoRepository.listar() 
    }
}
