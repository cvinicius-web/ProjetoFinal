const SESSAO_KEY = "abrigo_patinhas_sessao";
const $ = (id) => document.getElementById(id);
const obterSessao = () => JSON.parse(localStorage.getItem(SESSAO_KEY)) || null;
const ehGestor = (p) => p === "admin" || p === "super-admin";

function obterPerfilAtual() {
  const s = obterSessao();
  if (!s) return "visitante";
  return s.adotante === "SuperAdmin" ? "super-admin" : s.adotante === "Nao" ? "admin" : "adotante";
}

function verificarPermissaoPagina() {
  const pagina = window.location.pathname.split("/").pop();
  const perfil = obterPerfilAtual();

  if ((pagina === "cadastro-animal.html" || pagina === "cadastros-gerais.html") && !ehGestor(perfil)) {
    alert("Acesso restrito aos administradores do abrigo.");
    window.location.href = "inicio.html";
  }
  if (pagina === "usuarios.html" && perfil !== "super-admin") {
    alert("Acesso restrito ao Super-Admin.");
    window.location.href = "inicio.html";
  }
  if (pagina === "adocoes.html" && perfil === "visitante") {
    alert("Faça login para acessar os pedidos de adoção.");
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  verificarPermissaoPagina();
  montarSidebar();
  iniciarLogin();
  iniciarVitrineAnimais();
  iniciarCadastroAnimal();
  iniciarCadastrosGerais();
  iniciarPedidosAdocao();
  iniciarTabela();
  iniciarCadastro();
});

function montarSidebar() {
  const sidebar = $("sidebarContainer");
  if (!sidebar) return;

  const pagina = window.location.pathname.split("/").pop() || "inicio.html";
  const sessao = obterSessao();
  const perfil = obterPerfilAtual();
  const ativo = (href) => (pagina === href ? "active" : "");
  const cargos = { "super-admin": "Super Administrador", admin: "Administrador", adotante: "Adotante" };

  sidebar.innerHTML = `
    <div>
      <div class="sidebar-brand">
        <img src="logo-patinhas.svg" alt="Logo Abrigo Patinhas" />
        <div><h2>Abrigo Patinhas</h2><span>Adoção & Gestão</span></div>
      </div>
      <nav class="nav-menu">
        <a href="inicio.html" class="nav-item ${ativo("inicio.html")}">Início</a>
        <a href="inicio.html#animais" class="nav-item">Animais</a>
        ${perfil !== "visitante" ? `<a href="adocoes.html" class="nav-item ${ativo("adocoes.html")}">Pedidos de Adoção</a>` : ""}
        ${ehGestor(perfil) ? `
          <a href="cadastro-animal.html" class="nav-item ${ativo("cadastro-animal.html")}">Cadastrar Animal</a>
          <a href="cadastros-gerais.html" class="nav-item ${ativo("cadastros-gerais.html")}">Espécies e Vacinas</a>
        ` : ""}
        ${perfil === "super-admin" ? `
          <a href="usuarios.html" class="nav-item ${ativo("usuarios.html")}">Usuários</a>
          <a href="cadastro.html" class="nav-item ${ativo("cadastro.html")}">Cadastrar Admin</a>
        ` : ""}
      </nav>
    </div>
    <div class="sidebar-footer">
      ${sessao ? `
        <div class="user-pill"><strong>${sessao.nome}</strong><small>${cargos[perfil]}</small></div>
        <a href="#" id="btnSair" class="nav-item nav-logout">Sair do sistema</a>
      ` : `
        <div class="user-pill"><strong>Visitante</strong><small>Modo apenas leitura</small></div>
        <a href="login.html" class="nav-item active" style="text-align:center;">Sair</a>
      `}
    </div>
  `;

  if ($("btnSair")) {
    $("btnSair").onclick = async (e) => {
      e.preventDefault();
      await UsuarioService.sair();
      localStorage.removeItem(SESSAO_KEY);
      window.location.href = "login.html";
    };
  }
}

async function iniciarVitrineAnimais() {
  const grid = $("listaAnimaisGrid");
  if (!grid) return;

  const perfil = obterPerfilAtual();
  if ($("btnNovoAnimalTopo") && !ehGestor(perfil)) $("btnNovoAnimalTopo").style.display = "none";

  const animais = (await AnimalService.listar()) || [];
  if (!animais.length) {
    grid.innerHTML = `<div class="empty-state"><p>Nenhum animal cadastrado no momento.</p></div>`;
    return;
  }

  grid.innerHTML = animais.map(a => {
    const acao = ehGestor(perfil)
      ? `<button class="btn btn-danger btn-sm" onclick="excluirAnimal(${a.id}, '${a.nome}')">Remover</button>`
      : perfil === "adotante" && a.situacao === "Disponivel"
        ? `<a href="adocoes.html?animal=${a.id}" class="btn btn-primary btn-sm">Quero Adotar</a>`
        : "";

    return `
      <div class="pet-card">
        <img src="${a.foto}" alt="${a.nome}" class="pet-photo" />
        <h3>${a.nome}</h3>
        <p>${a.especie} - ${a.idade}</p>
        <p><span class="badge ${a.situacao === "Disponivel" ? "badge-sim" : "badge-nao"}">${a.situacao}</span></p>
        <div class="pet-actions">
          <button class="btn btn-dark btn-sm" onclick="abrirModalPet('${a.nome}', '${a.especie} (${a.idade}): ${a.descricao.replace(/'/g, "\\'")}')">Saiba mais</button>
          ${acao}
        </div>
      </div>
    `;
  }).join("");

  window.excluirAnimal = async (id, nome) => {
    if (confirm(`Deseja remover ${nome}?`)) {
      await AnimalService.remover(id);
      iniciarVitrineAnimais();
    }
  };
}

async function iniciarCadastroAnimal() {
  const form = $("formCadastroAnimal");
  if (!form) return;

  const especies = (await EspecieService.listar()) || [];
  $("animalEspecie").innerHTML = especies.map(e => `<option value="${e.id}">${e.nome}</option>`).join("");

  let fotoBase64 = "";
  $("animalFotoArquivo").onchange = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      fotoBase64 = leitor.result;
      $("previewFotoImg").src = fotoBase64;
      $("previewFotoBox").style.display = "block";
    };
    leitor.readAsDataURL(arquivo);
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    await AnimalService.criar({
      nome: $("animalNome").value.trim(),
      idEspecie: $("animalEspecie").value,
      idade: $("animalIdade").value,
      porte: $("animalPorte").value,
      sexo: $("animalSexo").value,
      foto: fotoBase64
    });
    window.location.href = "inicio.html";
  };
}

async function iniciarCadastrosGerais() {
  const seletor = $("tipoCadastroIntegrado");
  if (!seletor) return;

  const forms = { especie: $("formEspecie"), vacina: $("formVacina"), aplicacao: $("formAplicacao") };

  const atualizarTela = async () => {
    const tipo = seletor.value;
    Object.keys(forms).forEach(k => (forms[k].style.display = k === tipo ? "block" : "none"));

    if (tipo === "especie" || tipo === "vacina") {
      const ehEsp = tipo === "especie";
      $("tituloTabelaIntegrada").textContent = ehEsp ? "Espécies Cadastradas" : "Vacinas Cadastradas";
      $("theadIntegrada").innerHTML = "<tr><th>ID</th><th>Nome</th><th>Ações</th></tr>";
      const lista = (await (ehEsp ? EspecieService : VacinaService).listar()) || [];
      $("tbodyIntegrada").innerHTML = lista.map(i => `
        <tr><td>${i.id}</td><td><strong>${i.nome}</strong></td><td><button class="btn btn-danger btn-sm" onclick="removerItem('${tipo}', ${i.id})">Remover</button></td></tr>
      `).join("");
    } else {
      $("tituloTabelaIntegrada").textContent = "Histórico de Aplicação de Vacinas";
      $("theadIntegrada").innerHTML = "<tr><th>Animal</th><th>Vacina</th><th>Aplicação</th><th>Próxima Dose</th><th>Ações</th></tr>";
      const [animais, vacinas, aplicacoes] = await Promise.all([AnimalService.listar(), VacinaService.listar(), AplicacaoService.listar()]);
      $("aplAnimal").innerHTML = (animais || []).map(a => `<option value="${a.id}">${a.nome} (${a.especie})</option>`).join("");
      $("aplVacina").innerHTML = (vacinas || []).map(v => `<option value="${v.id}">${v.nome}</option>`).join("");
      $("tbodyIntegrada").innerHTML = (aplicacoes || []).map(ap => `
        <tr>
          <td><strong>${ap.animal}</strong></td>
          <td>${ap.vacina}</td>
          <td>${String(ap.dataAplicacao).split("T")[0]}</td>
          <td>${String(ap.dataProximaDose).split("T")[0]}</td>
          <td><button class="btn btn-danger btn-sm" onclick="removerAplicacao(${ap.idAnimal}, ${ap.idVacina})">Remover</button></td>
        </tr>
      `).join("");
    }
  };

  seletor.onchange = atualizarTela;

  forms.especie.onsubmit = async (e) => {
    e.preventDefault();
    await EspecieService.criar({ nome: $("nomeEspecie").value.trim() });
    forms.especie.reset();
    atualizarTela();
  };

  forms.vacina.onsubmit = async (e) => {
    e.preventDefault();
    await VacinaService.criar({ nome: $("nomeVacina").value.trim() });
    forms.vacina.reset();
    atualizarTela();
  };

  forms.aplicacao.onsubmit = async (e) => {
    e.preventDefault();
    await AplicacaoService.criar({
      idAnimal: $("aplAnimal").value,
      idVacina: $("aplVacina").value,
      dataAplicacao: $("aplData").value,
      dataProximaDose: $("aplProxima").value
    });
    forms.aplicacao.reset();
    atualizarTela();
  };

  window.removerItem = async (tipo, id) => {
    if (!confirm("Deseja remover este registro?")) return;
    await (tipo === "especie" ? EspecieService : VacinaService).remover(id);
    atualizarTela();
  };

  window.removerAplicacao = async (idAnimal, idVacina) => {
    if (confirm("Remover este registro?")) {
      await AplicacaoService.remover(idAnimal, idVacina);
      atualizarTela();
    }
  };

  atualizarTela();
}

async function iniciarPedidosAdocao() {
  const tbody = $("tabelaPedidosBody");
  if (!tbody) return;

  const sessao = obterSessao();
  const perfil = obterPerfilAtual();

  if (perfil === "adotante") {
    $("boxSolicitarAdocao").style.display = "block";
    $("thAcoesPedidos").style.display = "none";
    $("tituloPedidosAdocao").textContent = "Meus Pedidos de Adoção";

    const disponiveis = ((await AnimalService.listar()) || []).filter(a => a.situacao === "Disponivel");
    $("pedidoAnimal").innerHTML = disponiveis.map(a => `<option value="${a.id}">${a.nome} — ${a.especie} (${a.idade})</option>`).join("");

    const animalParam = new URLSearchParams(window.location.search).get("animal");
    if (animalParam) $("pedidoAnimal").value = animalParam;

    $("formPedidoAdocao").onsubmit = async (e) => {
      e.preventDefault();
      await PedidoService.criar({ cpf: sessao.cpf, idAnimal: $("pedidoAnimal").value });
      alert("Pedido de adoção enviado!");
      renderPedidos();
    };
  }

  const renderPedidos = async () => {
    let pedidos = (await PedidoService.listar()) || [];
    if (perfil === "adotante") pedidos = pedidos.filter(p => String(p.cpf) === String(sessao.cpf));

    tbody.innerHTML = pedidos.map(p => `
      <tr>
        <td>#${p.id}</td>
        <td><strong>${p.animal}</strong> (${p.especie})</td>
        <td>${p.adotante}</td>
        <td>${p.telefone}</td>
        <td>${String(p.data).split("T")[0]}</td>
        <td><span class="badge ${p.status === "Aprovado" ? "badge-sim" : "badge-nao"}">${p.status}</span></td>
        ${ehGestor(perfil) ? `<td><div class="actions-cell"><button class="btn btn-primary btn-sm" onclick="alterarStatusPedido(${p.id}, 'Aprovado', ${p.idAnimal})">Aprovar</button><button class="btn btn-danger btn-sm" onclick="alterarStatusPedido(${p.id}, 'Recusado', ${p.idAnimal})">Recusar</button></div></td>` : ""}
      </tr>
    `).join("");
  };

  window.alterarStatusPedido = async (id, status, idAnimal) => {
    await PedidoService.atualizarStatus(id, status, idAnimal);
    renderPedidos();
  };

  renderPedidos();
}

function iniciarLogin() {
  const form = $("formLogin");
  if (!form) return;

  const inputSenha = $("loginSenha");
  $("btnToggleSenha").onclick = () => (inputSenha.type = inputSenha.type === "password" ? "text" : "password");
  $("btnAbrirRecuperar").onclick = () => {
    $("recuperarEmail").value = $("loginEmail").value;
    $("viewLogin").style.display = "none";
    $("viewRecuperar").style.display = "block";
  };
  $("btnVoltarLogin").onclick = () => {
    $("viewRecuperar").style.display = "none";
    $("viewLogin").style.display = "block";
  };
  $("formRecuperar").onsubmit = (e) => {
    e.preventDefault();
    $("recuperarAlert").textContent = `Enviamos um link de redefinição para ${$("recuperarEmail").value}.`;
    $("recuperarAlert").classList.add("show");
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const usuario = await UsuarioService.autenticar($("loginEmail").value.trim(), inputSenha.value.trim());
    if (usuario) {
      localStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
      window.location.href = "inicio.html";
    } else {
      $("loginAlert").textContent = "Email ou senha inválidos.";
      $("loginAlert").classList.add("show");
    }
  };
}

async function iniciarTabela() {
  const tbody = $("tabelaUsuariosBody");
  if (!tbody) return;

  const pesquisa = $("campoPesquisa");
  const labels = { SuperAdmin: "Super-Admin", Nao: "Admin", Sim: "Adotante" };

  const render = async (filtro = "") => {
    const termo = filtro.toLowerCase();
    const lista = ((await UsuarioService.listar()) || []).filter(
      u => u.nome.toLowerCase().includes(termo) || u.cpf.includes(termo) || u.email.toLowerCase().includes(termo)
    );

    tbody.innerHTML = lista.map(u => `
      <tr>
        <td><strong>${u.nome}</strong></td>
        <td>${u.cpf}</td>
        <td>${u.email}</td>
        <td>${String(u.nascimento).split("T")[0]}</td>
        <td>${u.telefone}</td>
        <td>${u.endereco || "-"}</td>
        <td><span class="badge ${u.adotante === "Sim" ? "badge-sim" : "badge-nao"}">${labels[u.adotante] || "Adotante"}</span></td>
        <td>
          <div class="actions-cell">
            <a href="cadastro.html?id=${u.id}" class="btn btn-primary btn-sm">Atualizar</a>
            ${u.adotante !== "SuperAdmin" ? `<button class="btn btn-danger btn-sm" onclick="excluirUsuario('${u.id}', '${u.nome}')">Remover</button>` : ""}
          </div>
        </td>
      </tr>
    `).join("");
  };

  $("btnPesquisar").onclick = () => render(pesquisa.value);
  pesquisa.oninput = () => render(pesquisa.value);
  window.excluirUsuario = async (id, nome) => {
    if (confirm(`Deseja remover ${nome}?`)) {
      await UsuarioService.remover(id);
      render(pesquisa.value);
    }
  };
  render();
}

async function iniciarCadastro() {
  const form = $("formCadastroUsuario");
  if (!form) return;

  const editId = new URLSearchParams(window.location.search).get("id");
  const perfil = obterPerfilAtual();

  if (perfil !== "super-admin") {
    if ($("grupoPerfilUsuario")) $("grupoPerfilUsuario").style.display = "none";
    if ($("cadAdotante")) $("cadAdotante").value = "Sim";
    if ($("btnVoltarCadastro")) $("btnVoltarCadastro").href = "login.html";
  } else {
    if ($("cadAdotante")) $("cadAdotante").value = "Nao";
    if ($("btnVoltarCadastro")) $("btnVoltarCadastro").href = "usuarios.html";
  }

  if (editId) {
    $("tituloFormularioCadastro").textContent = "Atualizar Usuário";
    const u = await UsuarioService.buscarPorId(editId);
    if (u) {
      $("cadNome").value = u.nome || "";
      $("cadCpf").value = u.cpf || "";
      $("cadCpf").readOnly = true;
      $("cadNascimento").value = String(u.nascimento).split("T")[0] || "";
      $("cadTelefone").value = u.telefone || "";
      $("cadEndereco").value = u.endereco || "";
      $("cadEmail").value = u.email || "";
      $("cadSenha").value = u.senha || "";
      $("cadAdotante").value = u.adotante || "Sim";
    }
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const dados = {
      nome: $("cadNome").value.trim(),
      cpf: $("cadCpf").value.trim(),
      nascimento: $("cadNascimento").value,
      telefone: $("cadTelefone").value.trim(),
      endereco: $("cadEndereco").value.trim(),
      email: $("cadEmail").value.trim(),
      senha: $("cadSenha").value.trim(),
      adotante: perfil === "super-admin" ? $("cadAdotante").value : "Sim"
    };
    editId ? await UsuarioService.atualizar(editId, dados) : await UsuarioService.criar(dados);
    window.location.href = perfil === "super-admin" ? "usuarios.html" : "login.html";
  };
}

const abrirModalPet = (titulo, descricao) => {
  $("modalTitulo").textContent = titulo;
  $("modalDescricao").textContent = descricao;
  $("petModal").classList.add("open");
};

const fecharModalPet = () => $("petModal").classList.remove("open");