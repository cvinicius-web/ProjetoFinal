const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const JWT_SECRET = "abrigo_patinhas_chave_secreta_2026";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "pweb")));

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Abrigo"
});

const verificarToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ erro: "Acesso negado. Faça login." });
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ erro: "Sessão expirada." });
  }
};

const apenasAdmin = (req, res, next) => {
  if (req.usuario.adotante !== "Nao" && req.usuario.adotante !== "SuperAdmin") {
    return res.status(403).json({ erro: "Acesso restrito a administradores." });
  }
  next();
};

const normalizarData = (d) => (d.includes("/") ? d.split("/").reverse().join("-") : d);
const limparDigitos = (v) => v.replace(/\D/g, "");

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  const [rows] = await db.query(
    "SELECT CPF, Nome, Email, Telefone, Endereco, Adotante FROM Usuario WHERE Email = ? AND Senha = ?",
    [email, senha]
  );
  if (!rows.length) return res.status(401).json({ erro: "E-mail ou senha inválidos." });

  const u = rows[0];
  const token = jwt.sign(
    { cpf: u.CPF, nome: u.Nome, email: u.Email, adotante: u.Adotante },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.cookie("auth_token", token, { httpOnly: true, sameSite: "lax", maxAge: 7200000 });
  res.json({
    cpf: u.CPF,
    nome: u.Nome,
    email: u.Email,
    telefone: u.Telefone,
    endereco: u.Endereco,
    adotante: u.Adotante
  });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ ok: true });
});

app.get("/api/usuarios", verificarToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Usuario");
  res.json(rows.map(u => ({
    id: u.CPF,
    cpf: u.CPF,
    nome: u.Nome,
    email: u.Email,
    senha: u.Senha,
    nascimento: u.Nascimento,
    telefone: u.Telefone,
    endereco: u.Endereco,
    adotante: u.Adotante
  })));
});

app.post("/api/usuarios", async (req, res) => {
  const { nome, cpf, nascimento, telefone, endereco, email, senha, adotante } = req.body;
  const cpfLimpo = limparDigitos(cpf);
  await db.query(
    "INSERT INTO Usuario (CPF, Senha, Email, Adotante, Nome, Endereco, Telefone, Nascimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [cpfLimpo, senha, email, adotante, nome, endereco, limparDigitos(telefone), normalizarData(nascimento)]
  );
  res.status(201).json({ id: cpfLimpo });
});

app.put("/api/usuarios/:id", verificarToken, async (req, res) => {
  const { nome, nascimento, telefone, endereco, email, senha, adotante } = req.body;
  await db.query(
    "UPDATE Usuario SET Nome=?, Nascimento=?, Telefone=?, Endereco=?, Email=?, Senha=?, Adotante=? WHERE CPF=?",
    [nome, normalizarData(nascimento), limparDigitos(telefone), endereco, email, senha, adotante, req.params.id]
  );
  res.json({ ok: true });
});

app.delete("/api/usuarios/:id", verificarToken, apenasAdmin, async (req, res) => {
  await db.query("DELETE FROM Usuario WHERE CPF = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/especies", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Especie ORDER BY ID_especie ASC");
  res.json(rows.map(e => ({ id: e.ID_especie, nome: e.Nome_especie })));
});

app.post("/api/especies", verificarToken, apenasAdmin, async (req, res) => {
  const [[{ proxId }]] = await db.query("SELECT COALESCE(MAX(ID_especie), 0) + 1 AS proxId FROM Especie");
  await db.query("INSERT INTO Especie (ID_especie, Nome_especie) VALUES (?, ?)", [proxId, req.body.nome]);
  res.status(201).json({ id: proxId, nome: req.body.nome });
});

app.delete("/api/especies/:id", verificarToken, apenasAdmin, async (req, res) => {
  await db.query("DELETE FROM Especie WHERE ID_especie = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/vacinas", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM Vacina ORDER BY ID_vacina ASC");
  res.json(rows.map(v => ({ id: v.ID_vacina, nome: v.Nome_vacina })));
});

app.post("/api/vacinas", verificarToken, apenasAdmin, async (req, res) => {
  const [[{ proxId }]] = await db.query("SELECT COALESCE(MAX(ID_vacina), 0) + 1 AS proxId FROM Vacina");
  await db.query("INSERT INTO Vacina (ID_vacina, Nome_vacina) VALUES (?, ?)", [proxId, req.body.nome]);
  res.status(201).json({ id: proxId, nome: req.body.nome });
});

app.delete("/api/vacinas/:id", verificarToken, apenasAdmin, async (req, res) => {
  await db.query("DELETE FROM Vacina WHERE ID_vacina = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/aplicacoes", async (req, res) => {
  const [rows] = await db.query(`
    SELECT av.ID_animal, av.ID_vacina, av.Data_aplicacao, av.Data_proxima_dose,
           a.Nome AS Nome_animal, v.Nome_vacina
    FROM Aplicacao_vacina av
    JOIN Animal a ON av.ID_animal = a.ID_animal
    JOIN Vacina v ON av.ID_vacina = v.ID_vacina
    ORDER BY av.Data_aplicacao DESC
  `);
  res.json(rows.map(r => ({
    idAnimal: r.ID_animal,
    idVacina: r.ID_vacina,
    animal: r.Nome_animal,
    vacina: r.Nome_vacina,
    dataAplicacao: r.Data_aplicacao,
    dataProximaDose: r.Data_proxima_dose
  })));
});

app.post("/api/aplicacoes", verificarToken, apenasAdmin, async (req, res) => {
  const { idAnimal, idVacina, dataAplicacao, dataProximaDose } = req.body;
  await db.query(
    "INSERT INTO Aplicacao_vacina (ID_animal, ID_vacina, Data_aplicacao, Data_proxima_dose) VALUES (?, ?, ?, ?)",
    [idAnimal, idVacina, dataAplicacao, dataProximaDose]
  );
  res.status(201).json({ ok: true });
});

app.delete("/api/aplicacoes/:idAnimal/:idVacina", verificarToken, apenasAdmin, async (req, res) => {
  await db.query(
    "DELETE FROM Aplicacao_vacina WHERE ID_animal = ? AND ID_vacina = ?",
    [req.params.idAnimal, req.params.idVacina]
  );
  res.json({ ok: true });
});

app.get("/api/animais", async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.*, e.Nome_especie
    FROM Animal a
    JOIN Especie e ON a.ID_especie = e.ID_especie
    ORDER BY a.ID_animal DESC
  `);
  res.json(rows.map(a => ({
    id: a.ID_animal,
    nome: a.Nome,
    especie: a.Nome_especie,
    idEspecie: a.ID_especie,
    porte: a.Porte,
    sexo: a.Sexo,
    situacao: a.Situacao,
    idade: `${a.Idade_estimada} ano(s)`,
    descricao: `Porte ${a.Porte}, ${a.Sexo} - Situação: ${a.Situacao}`,
    foto: a.Foto && (a.Foto.startsWith("data:image") || a.Foto.startsWith("fotos/")) ? a.Foto : "logo-patinhas.svg"
  })));
});

app.post("/api/animais", verificarToken, apenasAdmin, async (req, res) => {
  const { nome, idEspecie, porte, sexo, idade, foto } = req.body;
  const hoje = new Date().toISOString().split("T")[0];
  const [[{ proxId }]] = await db.query("SELECT COALESCE(MAX(ID_animal), 0) + 1 AS proxId FROM Animal");

  await db.query(
    "INSERT INTO Animal (ID_animal, Nome, Porte, Sexo, data_resgate, Situacao, Idade_estimada, ID_especie, Foto) VALUES (?, ?, ?, ?, ?, 'Disponivel', ?, ?, ?)",
    [proxId, nome, porte || "Medio", sexo || "Macho", hoje, parseInt(idade) || 1, idEspecie, foto]
  );
  res.status(201).json({ id: proxId });
});

app.delete("/api/animais/:id", verificarToken, apenasAdmin, async (req, res) => {
  await db.query("DELETE FROM Animal WHERE ID_animal = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/api/pedidos", verificarToken, async (req, res) => {
  const [rows] = await db.query(`
    SELECT p.ID_pedido, p.Status, p.Data, p.CPF, p.ID_animal,
           u.Nome AS Nome_usuario, u.Telefone, u.Email,
           a.Nome AS Nome_animal, e.Nome_especie
    FROM Pedido_adocao p
    JOIN Usuario u ON p.CPF = u.CPF
    JOIN Animal a ON p.ID_animal = a.ID_animal
    JOIN Especie e ON a.ID_especie = e.ID_especie
    ORDER BY p.ID_pedido DESC
  `);
  res.json(rows.map(p => ({
    id: p.ID_pedido,
    status: p.Status,
    data: p.Data,
    cpf: p.CPF,
    adotante: p.Nome_usuario,
    telefone: p.Telefone,
    email: p.Email,
    idAnimal: p.ID_animal,
    animal: p.Nome_animal,
    especie: p.Nome_especie
  })));
});

app.post("/api/pedidos", verificarToken, async (req, res) => {
  const { cpf, idAnimal } = req.body;
  const hoje = new Date().toISOString().split("T")[0];
  const [[{ proxId }]] = await db.query("SELECT COALESCE(MAX(ID_pedido), 0) + 1 AS proxId FROM Pedido_adocao");

  await db.query(
    "INSERT INTO Pedido_adocao (ID_pedido, Status, Data, CPF, ID_animal) VALUES (?, 'Analise', ?, ?, ?)",
    [proxId, hoje, cpf, idAnimal]
  );
  res.status(201).json({ id: proxId });
});

app.put("/api/pedidos/:id", verificarToken, apenasAdmin, async (req, res) => {
  const { status, idAnimal } = req.body;
  await db.query("UPDATE Pedido_adocao SET Status = ? WHERE ID_pedido = ?", [status, req.params.id]);
  if (status === "Aprovado" && idAnimal) {
    await db.query("UPDATE Animal SET Situacao = 'Adotado' WHERE ID_animal = ?", [idAnimal]);
  }
  res.json({ ok: true });
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000/login.html"));