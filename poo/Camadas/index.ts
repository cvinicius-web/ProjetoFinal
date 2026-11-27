import { EspecieRepository } from "./Repositories/EspecieRepository"
import { EspecieService } from "./Services/EspecieService"
import { AnimalRepository } from "./Repositories/AnimalRepository"
import { AnimalService } from "./Services/AnimalService"
import { UsuarioRepository } from "./Repositories/UsuarioRepository"
import { UsuarioService } from "./Services/UsuarioService"
import { PedidoAdocaoRepository } from "./Repositories/PedidoAdocaoRepository"
import { PedidoAdocaoService } from "./Services/PedidoAdocaoService"

const especieRepo = new EspecieRepository()
const animalRepo = new AnimalRepository()
const usuarioRepo = new UsuarioRepository()
const pedidoRepo = new PedidoAdocaoRepository()

const especieService = new EspecieService(especieRepo)
const animalService = new AnimalService(especieRepo, animalRepo)
const usuarioService = new UsuarioService(usuarioRepo)
const pedidoService = new PedidoAdocaoService(pedidoRepo, animalRepo)

const especie = especieService.cadastrarEspecie(1, "Cachorro")

const usuario = usuarioService.cadastrarUsuario("12345678901", "senha123", "joao@email.com", "Sim", "João da Silva", "Rua A, 123", "11999999999", "01/01/2000");

const animal = animalService.cadastrarAnimal(1, "Rex", "Médio", "Macho", "2026-05-10", 3, 1)
const pedido = pedidoService.cadastrarPedido(1, "Pendente", "2026-06-06", 1)

console.log(especieService.listarEspecies())
console.log(usuarioService.listarUsuarios())
console.log(animalService.listarAnimais())
console.log(pedidoService.listarPedidos())