import { PedidoAdocaoRepository } from "../repositories/PedidoAdocaoRepository.js";
import { AnimalRepository } from "../repositories/AnimalRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { PedidoAdocao } from "../entities/PedidoAdocao.js";

export class PedidoAdocaoService {
    constructor(
        private pedidoAdocaoRepository: PedidoAdocaoRepository,
        private animalRepository: AnimalRepository,
        private usuarioRepository: UsuarioRepository
    ) {}

    public async cadastrarPedido(
        id_pedido: number,
        data: string,
        id_animal: number,
        cpf_adotante: string
    ): Promise<PedidoAdocao> {
        if (id_pedido <= 0) {
            throw new Error("O ID do pedido deve ser maior que 0");
        }

        const pedidoExiste = await this.pedidoAdocaoRepository.buscarPorId(id_pedido);
        if (pedidoExiste) {
            throw new Error("Já existe um pedido de adoção cadastrado com este ID");
        }

        const animal = await this.animalRepository.buscarPorId(id_animal);
        if (!animal) {
            throw new Error("O animal informado para o pedido não foi encontrado");
        }

        const sit = animal.getSituacao().toLowerCase();
        if (sit !== "disponivel" && sit !== "disponível") {
            throw new Error("Apenas animais com situação 'Disponivel' podem receber pedidos de adoção");
        }

        const adotante = await this.usuarioRepository.buscarPorCpf(cpf_adotante);
        if (!adotante) {
            throw new Error("Adotante não encontrado");
        }

        const anoAtual = Number(data.slice(0, 4));
        const anoNascimento = Number(adotante.getNascimento().slice(0, 4));
        if (anoAtual - anoNascimento < 18) {
            throw new Error("O adotante precisa ser maior de 18 anos para realizar um pedido de adoção");
        }

        const novoPedido = new PedidoAdocao(id_pedido, "Analise", data, animal, adotante);
        await this.pedidoAdocaoRepository.salvar(novoPedido);
        return novoPedido;
    }

    public async analisarPedido(id_pedido: number, novoStatus: string): Promise<PedidoAdocao> {
        const pedido = await this.pedidoAdocaoRepository.buscarPorId(id_pedido);
        if (!pedido) {
            throw new Error("Pedido de adoção não encontrado");
        }

        pedido.atualizarStatus(novoStatus);
        await this.pedidoAdocaoRepository.alterar(pedido);

        if (novoStatus.toLowerCase() === "aprovado") {
            const animal = pedido.getAnimal();
            animal.atualizarSituacao("Adotado");
            await this.animalRepository.alterar(animal);

            const outrosPedidos = await this.pedidoAdocaoRepository.buscarPorAnimal(animal.getId());
            for (const outro of outrosPedidos) {
                if (
                    outro.getIdPedido() !== pedido.getIdPedido() &&
                    outro.getStatus().toLowerCase() !== "recusado"
                ) {
                    outro.atualizarStatus("Recusado");
                    await this.pedidoAdocaoRepository.alterar(outro);
                }
            }
        }

        return pedido;
    }

    public async removerPedido(id_pedido: number): Promise<void> {
        const pedido = await this.pedidoAdocaoRepository.buscarPorId(id_pedido);
        if (!pedido) {
            throw new Error("Pedido não encontrado");
        }
        await this.pedidoAdocaoRepository.remover(id_pedido);
    }

    public async contarAdocoesNoMes(anoMes: string): Promise<number> {
        let total = 0;
        const todos = await this.pedidoAdocaoRepository.listar();

        for (const pedido of todos) {
            const aprovado = pedido.getStatus().toLowerCase() === "aprovado";
            const mesmoMes = pedido.getData().slice(0, 7) === anoMes;
            if (aprovado && mesmoMes) {
                total++;
            }
        }

        return total;
    }

    public async listarPedidos(): Promise<PedidoAdocao[]> {
        return await this.pedidoAdocaoRepository.listar();
    }
}