import { connection } from "./database/connection.js";
import { EspecieRepository } from "./repositories/EspecieRepository.js";
import { AnimalRepository } from "./repositories/AnimalRepository.js";
import { UsuarioRepository } from "./repositories/UsuarioRepository.js";
import { VacinaRepository } from "./repositories/VacinaRepository.js";
import { AplicacaoVacinaRepository } from "./repositories/AplicacaoVacinaRepository.js";
import { PedidoAdocaoRepository } from "./repositories/PedidoAdocaoRepository.js";

import { EspecieService } from "./services/EspecieService.js";
import { AnimalService } from "./services/AnimalService.js";
import { UsuarioService } from "./services/UsuarioService.js";
import { VacinaService } from "./services/VacinaService.js";
import { AplicacaoVacinaService } from "./services/AplicacaoVacinaService.js";
import { PedidoAdocaoService } from "./services/PedidoAdocaoService.js";

const especieRepository = new EspecieRepository();
const animalRepository = new AnimalRepository();
const usuarioRepository = new UsuarioRepository();
const vacinaRepository = new VacinaRepository();
const aplicacaoRepository = new AplicacaoVacinaRepository();
const pedidoRepository = new PedidoAdocaoRepository();

const especieService = new EspecieService(especieRepository);
const vacinaService = new VacinaService(vacinaRepository);
const aplicacaoService = new AplicacaoVacinaService(aplicacaoRepository, animalRepository, vacinaRepository);
const animalService = new AnimalService(especieRepository, animalRepository, vacinaRepository, aplicacaoRepository);
const usuarioService = new UsuarioService(usuarioRepository);
const pedidoService = new PedidoAdocaoService(pedidoRepository, animalRepository, usuarioRepository);

// Testando consultas no banco Abrigo
const animais = await animalService.listarAnimais();
console.log("Animais cadastrados:", animais.length);

const disponiveis = await animalService.pesquisarDisponiveis(1);
console.log("Cachorros disponíveis:", disponiveis.map((a) => a.getNome()));

const adocoesJan = await pedidoService.contarAdocoesNoMes("2026-01");
console.log("Adoções em Janeiro/2026:", adocoesJan);

await connection.end();