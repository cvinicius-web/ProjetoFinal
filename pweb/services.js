const API_URL = "http://localhost:3000/api";

async function api(rota, metodo = "GET", dados = null) {
  const opcoes = {
    method: metodo,
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  };
  if (dados) opcoes.body = JSON.stringify(dados);
  const res = await fetch(`${API_URL}${rota}`, opcoes);
  if (!res.ok) return null;
  return res.json();
}

const UsuarioService = {
  listar: () => api("/usuarios"),
  buscarPorId: async (id) => (await api("/usuarios"))?.find(u => String(u.id) === String(id)),
  criar: (dados) => api("/usuarios", "POST", dados),
  atualizar: (id, dados) => api(`/usuarios/${id}`, "PUT", dados),
  remover: (id) => api(`/usuarios/${id}`, "DELETE"),
  autenticar: (email, senha) => api("/login", "POST", { email, senha }),
  sair: () => api("/logout", "POST")
};

const AnimalService = {
  listar: () => api("/animais"),
  criar: (dados) => api("/animais", "POST", dados),
  remover: (id) => api(`/animais/${id}`, "DELETE")
};

const EspecieService = {
  listar: () => api("/especies"),
  criar: (dados) => api("/especies", "POST", dados),
  remover: (id) => api(`/especies/${id}`, "DELETE")
};

const VacinaService = {
  listar: () => api("/vacinas"),
  criar: (dados) => api("/vacinas", "POST", dados),
  remover: (id) => api(`/vacinas/${id}`, "DELETE")
};

const AplicacaoService = {
  listar: () => api("/aplicacoes"),
  criar: (dados) => api("/aplicacoes", "POST", dados),
  remover: (idAnimal, idVacina) => api(`/aplicacoes/${idAnimal}/${idVacina}`, "DELETE")
};

const PedidoService = {
  listar: () => api("/pedidos"),
  criar: (dados) => api("/pedidos", "POST", dados),
  atualizarStatus: (id, status, idAnimal) => api(`/pedidos/${id}`, "PUT", { status, idAnimal })
};