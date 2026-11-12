const EspecieRepository = require('./repositories')
const EspecieService = require('./services')

const repo = new EspecieRepository()
const service = new EspecieService(repo)

service.cadastrarEspecie(1, "Canina")
service.cadastrarEspecie(2, "Felina")

console.log(service.listarEspécies())
