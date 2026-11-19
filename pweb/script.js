const USAR_API = false;
const API_URL = "http://localhost:3000/api";

const STORAGE_KEY = "abrigo_patinhas_usuarios";
const ANIMAIS_KEY = "abrigo_patinhas_animais";
const SESSAO_KEY = "abrigo_patinhas_sessao";

const USUARIOS_INICIAIS = [
  { id: 1, nome: "Maria Silva", cpf: "123.456.789-00", email: "maria@gmail.com", senha: "123456", nascimento: "10/05/2000", sexo: "Feminino", telefone: "99999-0000", endereco: "Maceió - AL", adotante: "Sim" },
  { id: 2, nome: "João Santos", cpf: "987.654.321-00", email: "joao@gmail.com", senha: "123456", nascimento: "15/08/1998", sexo: "Masculino", telefone: "98888-0000", endereco: "Rio Largo - AL", adotante: "Não" },
  { id: 3, nome: "Ana Costa", cpf: "456.789.123-00", email: "ana@gmail.com", senha: "123456", nascimento: "20/03/2002", sexo: "Feminino", telefone: "97777-0000", endereco: "Maceió - AL", adotante: "Sim" }
];

/* ================= CONTROLE DE PERFIL (ADMIN / ADOTANTE / VISITANTE) ================= */
function obterSessao() {
  return JSON.parse(localStorage.getItem(SESSAO_KEY)) || null;
}

function obterPerfilAtual() {
  const sessao = obterSessao();
  if (!sessao) return "visitante";
  return sessao.adotante === "Sim" ? "adotante" : "admin";
}

function verificarPermissaoPagina() {
  const pagina = window.location.pathname.split("/").pop();
  const perfil = obterPerfilAtual();

  if ((pagina === "cadastro-animal.html" || pagina === "usuarios.html") && perfil !== "admin") {
    alert("Acesso restrito aos usuários administradores do abrigo.");
    window.location.href = "inicio.html";
  }
}

/* ================= SERVIÇO DE USUÁRIOS ================= */
const UsuarioService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_INICIAIS));
    }
  },
  async listar() {
    if (USAR_API) return (await fetch(`${API_URL}/usuarios`)).json();
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  },
  async buscarPorId(id) {
    return (await this.listar()).find((u) => String(u.id) === String(id));
  },
  async criar(dados) {
    if (USAR_API) {
      return (await fetch(`${API_URL}/usuarios`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados)
      })).json();
    }
    const lista = await this.listar();
    lista.push({ ...dados, id: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  },
  async atualizar(id, dados) {
    if (USAR_API) {
      return (await fetch(`${API_URL}/usuarios/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados)
      })).json();
    }
    const lista = await this.listar();
    const idx = lista.findIndex((u) => String(u.id) === String(id));
    if (idx !== -1) {
      lista[idx] = { ...lista[idx], ...dados, id: lista[idx].id };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }
  },
  async remover(id) {
    if (USAR_API) return fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
    const lista = (await this.listar()).filter((u) => String(u.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  },
  async autenticar(email, senha) {
    if (USAR_API) {
      const r = await fetch(`${API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha })
      });
      return r.ok ? r.json() : null;
    }
    return (await this.listar()).find((u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
  }
};

/* ================= SERVIÇO DE ANIMAIS ================= */
const AnimalService = {
  async listar() {
    if (USAR_API) return (await fetch(`${API_URL}/animais`)).json();
    return JSON.parse(localStorage.getItem(ANIMAIS_KEY)) || [];
  },
  async criar(dados) {
    if (USAR_API) {
      return (await fetch(`${API_URL}/animais`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados)
      })).json();
    }
    const lista = await this.listar();
    lista.push({ ...dados, id: Date.now() });
    localStorage.setItem(ANIMAIS_KEY, JSON.stringify(lista));
  },
  async remover(id) {
    if (USAR_API) return fetch(`${API_URL}/animais/${id}`, { method: "DELETE" });
    const lista = (await this.listar()).filter((a) => String(a.id) !== String(id));
    localStorage.setItem(ANIMAIS_KEY, JSON.stringify(lista));
  }
};

/* ================= INICIALIZAÇÃO ================= */
document.addEventListener("DOMContentLoaded", () => {
  UsuarioService.init();
  verificarPermissaoPagina();
  montarSidebar();
  iniciarLogin();
  iniciarVitrineAnimais();
  iniciarCadastroAnimal();
  iniciarTabela();
  iniciarCadastro();
});

/* ================= MENU VERTICAL POR PERFIL ================= */
function montarSidebar() {
  const sidebar = document.getElementById("sidebarContainer");
  if (!sidebar) return;

  const pagina = window.location.pathname.split("/").pop() || "inicio.html";
  const sessao = obterSessao();
  const perfil = obterPerfilAtual();

  // Links exclusivos para Usuário (Admin)
  const linksAdmin = perfil === "admin" ? `
    <a href="cadastro-animal.html" class="nav-item ${pagina === "cadastro-animal.html" ? "active" : ""}">Cadastrar Animal</a>
    <a href="usuarios.html" class="nav-item ${pagina === "usuarios.html" ? "active" : ""}">Usuários Cadastrados</a>
    <a href="cadastro.html" class="nav-item ${pagina === "cadastro.html" ? "active" : ""}">Novo Usuário</a>
  ` : "";

  // Rodapé do menu lateral conforme login
  const rodapeSidebar = sessao ? `
    <div class="user-pill">
      <strong>${sessao.nome}</strong>
      <small>${perfil === "admin" ? "Usuário do Abrigo" : "Adotante"}</small>
    </div>
    <a href="#" id="btnSair" class="nav-item nav-logout">Sair do sistema</a>
  ` : `
    <div class="user-pill">
      <strong>Visitante</strong>
      <small>Modo apenas leitura</small>
    </div>
    <a href="login.html" class="nav-item active" style="text-align:center;">Fazer Login</a>
  `;

  sidebar.innerHTML = `
    <div>
      <div class="sidebar-brand">
        <img src="logo-patinhas.svg" alt="Logo Abrigo Patinhas" />
        <div>
          <h2>Abrigo Patinhas</h2>
          <span>Adoção & Gestão</span>
        </div>
      </div>
      <nav class="nav-menu">
        <a href="inicio.html" class="nav-item ${pagina === "inicio.html" ? "active" : ""}">Início</a>
        <a href="inicio.html#animais" class="nav-item">Animais</a>
        <a href="inicio.html#adocao" class="nav-item">Adoção</a>
        <a href="inicio.html#doacoes" class="nav-item">Doações</a>
        <a href="inicio.html#contato" class="nav-item">Contato</a>
        ${linksAdmin}
      </nav>
    </div>
    <div class="sidebar-footer">${rodapeSidebar}</div>
  `;

  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem(SESSAO_KEY);
      window.location.href = "login.html";
    });
  }
}

/* ================= VITRINE DE ANIMAIS NA TELA INICIAL ================= */
async function iniciarVitrineAnimais() {
  const grid = document.getElementById("listaAnimaisGrid");
  if (!grid) return;

  const perfil = obterPerfilAtual();
  const btnTopo = document.getElementById("btnNovoAnimalTopo");
  if (btnTopo && perfil !== "admin") {
    btnTopo.style.display = "none";
  }

  const animais = await AnimalService.listar();

  if (animais.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p style="margin-bottom: 12px; font-weight: 500;">Nenhum animal cadastrado no momento.</p>
        ${perfil === "admin" ? `<a href="cadastro-animal.html" class="btn btn-primary btn-sm">Cadastrar primeiro animal</a>` : ""}
      </div>
    `;
    return;
  }

  grid.innerHTML = animais.map((a) => {
    let botaoAcaoPerfil = "";
    if (perfil === "admin") {
      botaoAcaoPerfil = `<button class="btn btn-danger btn-sm" onclick="excluirAnimal(${a.id}, '${a.nome}')">Remover</button>`;
    } else if (perfil === "adotante") {
      botaoAcaoPerfil = `<button class="btn btn-primary btn-sm" onclick="solicitarAdocao('${a.nome}')">Quero Adotar</button>`;
    }

    return `
      <div class="pet-card">
        <img src="${a.foto}" alt="${a.nome}" class="pet-photo" />
        <h3>${a.nome}</h3>
        <p>${a.especie} - ${a.idade}</p>
        <div class="pet-actions">
          <button class="btn btn-dark btn-sm" onclick="abrirModalPet('${a.nome}', '${a.especie} (${a.idade}): ${a.descricao.replace(/'/g, "\\'")}')">Saiba mais</button>
          ${botaoAcaoPerfil}
        </div>
      </div>
    `;
  }).join("");

  window.excluirAnimal = async (id, nome) => {
    if (confirm(`Deseja remover ${nome} da lista de adoção?`)) {
      await AnimalService.remover(id);
      iniciarVitrineAnimais();
    }
  };

  window.solicitarAdocao = (nomeAnimal) => {
    const sessao = obterSessao();
    abrirModalPet(
      `Interesse em ${nomeAnimal}`,
      `Olá, ${sessao.nome}! Registramos seu interesse na adoção de ${nomeAnimal}. Nossa equipe entrará em contato pelo telefone ${sessao.telefone} ou e-mail ${sessao.email}.`
    );
  };
}

/* ================= CADASTRO DE ANIMAL COM FOTO ================= */
function iniciarCadastroAnimal() {
  const form = document.getElementById("formCadastroAnimal");
  if (!form) return;

  const inputFoto = document.getElementById("animalFotoArquivo");
  const previewBox = document.getElementById("previewFotoBox");
  const previewImg = document.getElementById("previewFotoImg");
  let fotoBase64 = "";

  inputFoto.addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      fotoBase64 = leitor.result;
      previewImg.src = fotoBase64;
      previewBox.style.display = "block";
    };
    leitor.readAsDataURL(arquivo);
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const dados = {
      nome: document.getElementById("animalNome").value.trim(),
      especie: document.getElementById("animalEspecie").value,
      idade: document.getElementById("animalIdade").value.trim(),
      descricao: document.getElementById("animalDescricao").value.trim(),
      foto: fotoBase64
    };

    await AnimalService.criar(dados);
    window.location.href = "inicio.html";
  };
}

/* ================= LOGIN ================= */
function iniciarLogin() {
  const form = document.getElementById("formLogin");
  if (!form) return;

  const inputSenha = document.getElementById("loginSenha");
  document.getElementById("btnToggleSenha").onclick = () => {
    inputSenha.type = inputSenha.type === "password" ? "text" : "password";
  };

  document.getElementById("btnAbrirRecuperar").onclick = () => {
    document.getElementById("recuperarEmail").value = document.getElementById("loginEmail").value;
    document.getElementById("viewLogin").style.display = "none";
    document.getElementById("viewRecuperar").style.display = "block";
  };

  document.getElementById("btnVoltarLogin").onclick = () => {
    document.getElementById("viewRecuperar").style.display = "none";
    document.getElementById("viewLogin").style.display = "block";
  };

  document.getElementById("formRecuperar").onsubmit = (e) => {
    e.preventDefault();
    const alertRec = document.getElementById("recuperarAlert");
    alertRec.textContent = `Enviamos um link de redefinição para ${document.getElementById("recuperarEmail").value}.`;
    alertRec.classList.add("show");
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const usuario = await UsuarioService.autenticar(
      document.getElementById("loginEmail").value.trim(),
      inputSenha.value.trim()
    );
    if (usuario) {
      localStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
      window.location.href = "inicio.html";
    } else {
      const alertBox = document.getElementById("loginAlert");
      alertBox.textContent = "Email ou senha inválidos. Tente joao@gmail.com (Admin) ou maria@gmail.com (Adotante).";
      alertBox.classList.add("show");
    }
  };
}

/* ================= TABELA E CADASTRO DE USUÁRIOS ================= */
async function iniciarTabela() {
  const tbody = document.getElementById("tabelaUsuariosBody");
  if (!tbody) return;

  const pesquisa = document.getElementById("campoPesquisa");
  const render = async (filtro = "") => {
    const termo = filtro.toLowerCase();
    const lista = (await UsuarioService.listar()).filter((u) =>
      u.nome.toLowerCase().includes(termo) || u.cpf.includes(termo) || u.email.toLowerCase().includes(termo)
    );

    tbody.innerHTML = lista.map((u) => `
      <tr>
        <td><strong>${u.nome}</strong></td>
        <td>${u.cpf}</td>
        <td>${u.email}</td>
        <td>••••••</td>
        <td>${u.nascimento}</td>
        <td>${u.telefone}</td>
        <td>${u.endereco || "-"}</td>
        <td><span class="badge ${u.adotante === "Sim" ? "badge-sim" : "badge-nao"}">${u.adotante}</span></td>
        <td>
          <div class="actions-cell">
            <a href="cadastro.html?id=${u.id}" class="btn btn-primary btn-sm">Atualizar</a>
            <button class="btn btn-danger btn-sm" onclick="excluirUsuario(${u.id}, '${u.nome}')">Remover</button>
          </div>
        </td>
      </tr>
    `).join("");
  };

  document.getElementById("btnPesquisar").onclick = () => render(pesquisa.value);
  pesquisa.oninput = () => render(pesquisa.value);

  window.excluirUsuario = async (id, nome) => {
    if (confirm(`Deseja realmente remover ${nome}?`)) {
      await UsuarioService.remover(id);
      render(pesquisa.value);
    }
  };

  render();
}

async function iniciarCadastro() {
  const form = document.getElementById("formCadastroUsuario");
  if (!form) return;

  const editId = new URLSearchParams(window.location.search).get("id");
  const perfil = obterPerfilAtual();

  // Se for visitante criando a própria conta pelo login, fixa como Adotante
  if (perfil !== "admin" && !editId) {
    const campoAdotante = document.getElementById("cadAdotante");
    if (campoAdotante) {
      campoAdotante.value = "Sim";
      campoAdotante.disabled = true;
    }
  }

  if (editId) {
    document.getElementById("tituloFormularioCadastro").textContent = "Atualizar Usuário";
    const u = await UsuarioService.buscarPorId(editId);
    if (u) {
      ["Nome", "Cpf", "Nascimento", "Sexo", "Telefone", "Endereco", "Email", "Senha", "Adotante"].forEach((campo) => {
        document.getElementById(`cad${campo}`).value = u[campo.toLowerCase()] || "";
      });
    }
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const dados = {
      nome: document.getElementById("cadNome").value.trim(),
      cpf: document.getElementById("cadCpf").value.trim(),
      nascimento: document.getElementById("cadNascimento").value.trim(),
      sexo: document.getElementById("cadSexo").value,
      telefone: document.getElementById("cadTelefone").value.trim(),
      endereco: document.getElementById("cadEndereco").value.trim(),
      email: document.getElementById("cadEmail").value.trim(),
      senha: document.getElementById("cadSenha").value.trim(),
      adotante: document.getElementById("cadAdotante").value
    };
    editId ? await UsuarioService.atualizar(editId, dados) : await UsuarioService.criar(dados);
    window.location.href = perfil === "admin" ? "usuarios.html" : "login.html";
  };
}

function abrirModalPet(titulo, descricao) {
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalDescricao").textContent = descricao;
  document.getElementById("petModal").classList.add("open");
}

function fecharModalPet() {
  document.getElementById("petModal").classList.remove("open");
}