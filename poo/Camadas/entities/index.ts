import { Especie } from "./entities/Especie"
import { EspecieRepository } from "./repositories/EspecieRepository"
import { AnimalRepository } from "./repositories/AnimalRepository"
import { AnimalService } from "./services/AnimalService"
import { VacinaRepository } from "./repositories/VacinaRepository"
import { AplicacaoVacinaRepository } from "./repositories/AplicacaoVacinaRepository"
import { VacinaService } from "./services/VacinaService"

const especieRepo = new EspecieRepository()
const animalRepo = new AnimalRepository()
const vacinaRepo = new VacinaRepository()
const aplicacaoRepo = new AplicacaoVacinaRepository()

const animalService = new AnimalService(especieRepo, animalRepo)
const vacinaService = new VacinaService(vacinaRepo, aplicacaoRepo, animalRepo)

especieRepo.salvar(new Especie(1, "Cachorro"))
animalService.cadastrarAnimal(1, "Rex", 1, 3, "Médio", "Macho", "2026-10-10")

vacinaService.cadastrarVacina(1, "Antirrábica")
vacinaService.registrarAplicacao(1, 1, 1, "2026-11-17", "2027-11-17")

console.log(animalService.listarAnimais())
console.log(vacinaService.listarAplicacoes())