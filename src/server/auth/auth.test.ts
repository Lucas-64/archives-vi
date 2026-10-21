import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { sessoes, usuarios } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { configuracaoCookie } from "./cookie";
import { exigirPapel, exigirSessao } from "./guarda";
import { criarManipuladoresAuth } from "./rotas";
import { hashSenha, verificarSenha } from "./senha";
import { INATIVIDADE_MAXIMA_MS, VIDA_ABSOLUTA_MS, removerSessoesInvalidas, revogarSessoesDoUsuario } from "./sessao";
import { hashToken } from "./token";

const BARATO = { N: 1024, r: 8, p: 1 };
const ORIGEM = "http://localhost:3000";
const SENHA = "senha-de-teste-1";

let banco: BancoDeTeste;
let relogio = new Date("2026-10-20T12:00:00Z");
const avancar = (ms: number) => {
  relogio = new Date(relogio.getTime() + ms);
};

function criarHandlers(opcoes: { producao?: boolean } = {}) {
  return criarManipuladoresAuth({
    obterDb: () => banco.db,
    agora: () => relogio,
    parametrosSenha: BARATO,
    producao: opcoes.producao ?? false,
  });
}

let h: ReturnType<typeof criarHandlers>;
let sequencia = 0;
const unico = () => `u${++sequencia}`;

interface OpcoesReq {
  cabecalhos?: Record<string, string>;
  ip?: string;
  semOrigem?: boolean;
  semCsrf?: boolean;
  bruto?: string;
  tipo?: string;
}

function requisicao(metodo: string, caminho: string, corpo?: unknown, o: OpcoesReq = {}): Request {
  const cabecalhos: Record<string, string> = { "x-forwarded-for": o.ip ?? `10.0.0.${++sequencia}`, ...o.cabecalhos };
  if (!o.semOrigem) cabecalhos.origin ??= ORIGEM;
  if (!o.semCsrf) cabecalhos["x-requested-with"] = "archives-vi";
  let body: string | undefined;
  if (o.bruto !== undefined) body = o.bruto;
  else if (corpo !== undefined) body = JSON.stringify(corpo);
  if (body !== undefined) cabecalhos["content-type"] = o.tipo ?? "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cabecalhos, body });
}

const cadastrar = (corpo: unknown, o?: OpcoesReq) => h.cadastro(requisicao("POST", "/api/v1/auth/cadastro", corpo, o), undefined);
const entrar = (corpo: unknown, o?: OpcoesReq) => h.entrar(requisicao("POST", "/api/v1/auth/entrar", corpo, o), undefined);
const sair = (cookie?: string, o?: OpcoesReq) =>
  h.sair(requisicao("POST", "/api/v1/auth/sair", undefined, { ...o, cabecalhos: { ...o?.cabecalhos, ...(cookie ? { cookie } : {}) } }), undefined);
const eu = (cookie?: string) =>
  h.eu(requisicao("GET", "/api/v1/auth/eu", undefined, { cabecalhos: cookie ? { cookie } : {} }), undefined);

function novoCadastro(sobrescrever: Record<string, unknown> = {}) {
  const id = unico();
  return { usuario: `membro_${id}`, email: `${id}@exemplo.com`, senha: SENHA, ...sobrescrever };
}

function cookieDe(resposta: Response, nome = "sessao"): string {
  const setCookie = resposta.headers.get("set-cookie") ?? "";
  const trecho = setCookie.split(";")[0];
  expect(trecho.startsWith(`${nome}=`)).toBe(true);
  return trecho;
}

async function registrar(sobrescrever: Record<string, unknown> = {}) {
  const dados = novoCadastro(sobrescrever);
  const resposta = await cadastrar(dados);
  expect(resposta.status).toBe(201);
  return { dados, cookie: cookieDe(resposta), corpo: await resposta.json() };
}

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  h = criarHandlers();
});

afterAll(async () => {
  await banco?.encerrar();
});

describe("cadastro", () => {
  it("cria o usuário, devolve o perfil privado e abre uma sessão com cookie seguro", async () => {
    const dados = novoCadastro({ nome: "  Maria Teste  " });
    const resposta = await cadastrar(dados);
    const corpo = await resposta.json();

    expect(resposta.status).toBe(201);
    expect(resposta.headers.get("cache-control")).toBe("no-store");
    expect(resposta.headers.get("location")).toBe("/api/v1/auth/eu");
    expect(corpo.usuario).toMatchObject({
      usuario: dados.usuario,
      email: dados.email,
      nome: "Maria Teste",
      bio: "",
      avatar: null,
      papel: "membro",
    });
    expect(corpo.usuario.id).toMatch(/^[0-9a-f-]{36}$/);

    const cookie = resposta.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${VIDA_ABSOLUTA_MS / 1000}`);
    expect(cookie).toContain("Expires=");
    expect(cookie).not.toContain("Secure");
  });

  it("não devolve hash, token nem dados internos no corpo", async () => {
    const resposta = await cadastrar(novoCadastro());
    const texto = await resposta.text();
    expect(texto).not.toMatch(/senha|hash|scrypt|token/i);
  });

  it("guarda a senha só como hash scrypt e o token só como SHA-256", async () => {
    const { dados, cookie } = await registrar();
    const token = cookie.split("=")[1];

    const [usuario] = await banco.db.select().from(usuarios).where(eq(usuarios.email, dados.email));
    expect(usuario.senhaHash.startsWith("scrypt$")).toBe(true);
    expect(usuario.senhaHash).not.toContain(dados.senha);
    expect(await verificarSenha(dados.senha, usuario.senhaHash)).toBe(true);

    const [sessao] = await banco.db.select().from(sessoes).where(eq(sessoes.usuarioId, usuario.id));
    expect(sessao.tokenHash).toBe(hashToken(token));
    expect(sessao.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    const emTextoPuro = await banco.pool.query("select 1 from sessoes where token_hash = $1 or agente = $1", [token]);
    expect(emTextoPuro.rowCount).toBe(0);
  });

  it("normaliza usuario e e-mail para minúsculas e usa usuario como nome quando nome não vem", async () => {
    const id = unico();
    const resposta = await cadastrar({ usuario: `Maiusc_${id}`, email: `Pessoa.${id}@Exemplo.COM`, senha: SENHA });
    const corpo = await resposta.json();
    expect(corpo.usuario.usuario).toBe(`maiusc_${id}`);
    expect(corpo.usuario.email).toBe(`pessoa.${id}@exemplo.com`);
    expect(corpo.usuario.nome).toBe(`maiusc_${id}`);
  });

  it("trata nome vazio como ausente", async () => {
    const dados = novoCadastro({ nome: "   " });
    const corpo = await (await cadastrar(dados)).json();
    expect(corpo.usuario.nome).toBe(dados.usuario);
  });

  it.each([
    ["senha curta", { senha: "curta" }, "senha"],
    ["senha longa demais", { senha: "a".repeat(129) }, "senha"],
    ["e-mail inválido", { email: "sem-arroba" }, "email"],
    ["usuario com espaço", { usuario: "com espaco" }, "usuario"],
    ["usuario curto", { usuario: "ab" }, "usuario"],
    ["usuario com 31 caracteres", { usuario: "a".repeat(31) }, "usuario"],
    ["nome com 61 caracteres", { nome: "n".repeat(61) }, "nome"],
  ])("rejeita %s com 422 e aponta o campo", async (_d, extra, campo) => {
    const resposta = await cadastrar(novoCadastro(extra));
    const corpo = await resposta.json();
    expect(resposta.status).toBe(422);
    expect(corpo.erro.codigo).toBe("validacao");
    expect(corpo.erro.campos).toHaveProperty(campo);
    expect(corpo.erro.idRequisicao).toMatch(/^req_/);
  });

  it("rejeita campos extras (papel, id) e não cria nada: sem escalada de privilégio", async () => {
    const dados = novoCadastro({ papel: "admin", id: "00000000-0000-4000-8000-000000000000" });
    const resposta = await cadastrar(dados);
    expect(resposta.status).toBe(422);
    expect((await resposta.json()).erro.campos).toMatchObject({ papel: "Campo não permitido.", id: "Campo não permitido." });
    const existe = await banco.pool.query("select 1 from usuarios where email = $1", [dados.email]);
    expect(existe.rowCount).toBe(0);
  });

  it("corpo malformado = 400, tipo errado = 415, corpo gigante = 413", async () => {
    expect((await cadastrar(undefined, { bruto: "{quebrado", tipo: "application/json" })).status).toBe(400);
    expect((await cadastrar(undefined, { bruto: "a=1", tipo: "text/plain" })).status).toBe(415);
    expect((await cadastrar(undefined, { bruto: JSON.stringify({ x: "y".repeat(20_000) }) })).status).toBe(413);
  });

  it("nome de usuário repetido: 409 apontando o campo usuario", async () => {
    const { dados } = await registrar();
    const resposta = await cadastrar(novoCadastro({ usuario: dados.usuario.toUpperCase() }));
    const corpo = await resposta.json();
    expect(resposta.status).toBe(409);
    expect(corpo.erro.codigo).toBe("conflito");
    expect(corpo.erro.campos).toEqual({ usuario: "Este nome de usuário já está em uso." });
  });

  it("e-mail repetido: 409 genérico, sem campos e sem repetir o e-mail", async () => {
    const { dados } = await registrar();
    const resposta = await cadastrar(novoCadastro({ email: dados.email.toUpperCase() }));
    const texto = await resposta.text();
    const corpo = JSON.parse(texto);
    expect(resposta.status).toBe(409);
    expect(corpo.erro).not.toHaveProperty("campos");
    expect(corpo.erro.mensagem).toBe("Não foi possível criar a conta com esses dados.");
    expect(texto).not.toContain(dados.email);
  });

  it("dois cadastros simultâneos do mesmo usuário: um cria, o outro recebe 409 (não 500)", async () => {
    const base = novoCadastro();
    const [a, b] = await Promise.all([cadastrar(base), cadastrar({ ...base, email: `outro-${base.email}` })]);
    expect([a.status, b.status].sort()).toEqual([201, 409]);
  });
});

describe("proteção contra CSRF (Origin e cabeçalho)", () => {
  it.each([
    ["sem Origin", { semOrigem: true }],
    ["sem X-Requested-With", { semCsrf: true }],
    ["Origin de outro site", { cabecalhos: { origin: "https://evil.example" } }],
  ])("cadastro, entrar e sair recusam requisição %s com 403", async (_d, o) => {
    const dados = novoCadastro();
    const cadastro = await cadastrar(dados, o);
    expect(cadastro.status).toBe(403);
    expect((await cadastro.json()).erro.codigo).toBe("sem_permissao");
    expect((await entrar({ email: dados.email, senha: dados.senha }, o)).status).toBe(403);
    expect((await sair(undefined, o)).status).toBe(403);
    const existe = await banco.pool.query("select 1 from usuarios where email = $1", [dados.email]);
    expect(existe.rowCount).toBe(0);
  });
});

describe("entrar", () => {
  it("autentica com e-mail e senha corretos (e-mail sem diferenciar maiúsculas) e abre nova sessão", async () => {
    const { dados } = await registrar();
    const resposta = await entrar({ email: dados.email.toUpperCase(), senha: dados.senha });
    const corpo = await resposta.json();
    expect(resposta.status).toBe(200);
    expect(corpo.usuario.usuario).toBe(dados.usuario);
    expect(resposta.headers.get("set-cookie")).toContain("HttpOnly");
    expect(resposta.headers.get("cache-control")).toBe("no-store");
    const linhas = await banco.pool.query("select count(*)::int as n from sessoes s join usuarios u on u.id = s.usuario_id where u.email = $1", [dados.email]);
    expect(linhas.rows[0].n).toBe(2);
  });

  it("senha errada e e-mail inexistente dão a MESMA resposta 401", async () => {
    const { dados } = await registrar();
    const errada = await entrar({ email: dados.email, senha: "senha-errada-123" });
    const inexistente = await entrar({ email: `nao-existe-${unico()}@exemplo.com`, senha: "senha-errada-123" });
    const a = await errada.json();
    const b = await inexistente.json();

    expect(errada.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(a.erro.codigo).toBe("nao_autenticado");
    expect(a.erro.mensagem).toBe("E-mail ou senha incorretos.");
    expect({ ...a.erro, idRequisicao: "" }).toEqual({ ...b.erro, idRequisicao: "" });
    expect(errada.headers.get("set-cookie")).toBeNull();
    expect(inexistente.headers.get("set-cookie")).toBeNull();
  });

  it("valida a entrada (422) e não revela a política de senha", async () => {
    expect((await entrar({ email: "x" , senha: "y" })).status).toBe(422);
    expect((await entrar({ email: "a@b.co" })).status).toBe(422);
    const longa = await entrar({ email: "a@b.co", senha: "z".repeat(500) });
    expect(longa.status).toBe(422);
    expect((await longa.json()).erro.campos.senha).toBe("E-mail ou senha incorretos.");
    expect((await entrar({ email: "a@b.co", senha: "x", papel: "admin" })).status).toBe(422);
  });

  it("regrava o hash quando os parâmetros do scrypt mudaram", async () => {
    const { dados } = await registrar();
    const antigo = await hashSenha(dados.senha, { N: 512, r: 8, p: 1 });
    await banco.db.update(usuarios).set({ senhaHash: antigo }).where(eq(usuarios.email, dados.email));

    expect((await entrar({ email: dados.email, senha: dados.senha })).status).toBe(200);
    const [depois] = await banco.db.select().from(usuarios).where(eq(usuarios.email, dados.email));
    expect(depois.senhaHash).not.toBe(antigo);
    expect(depois.senhaHash.startsWith("scrypt$1024$8$1$")).toBe(true);
    expect(await verificarSenha(dados.senha, depois.senhaHash)).toBe(true);
  });
});

describe("limite de tentativas", () => {
  it("bloqueia a 6ª tentativa de login do mesmo IP no minuto, com Retry-After, e libera na janela seguinte", async () => {
    const ip = "198.51.100.7";
    const { dados } = await registrar();
    for (let i = 0; i < 5; i++) {
      expect((await entrar({ email: dados.email, senha: "errada-errada-1" }, { ip })).status).toBe(401);
    }
    const bloqueada = await entrar({ email: dados.email, senha: dados.senha }, { ip });
    const corpo = await bloqueada.json();
    expect(bloqueada.status).toBe(429);
    expect(corpo.erro.codigo).toBe("limite_excedido");
    expect(Number(bloqueada.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(Number(bloqueada.headers.get("retry-after"))).toBeLessThanOrEqual(60);

    avancar(61_000);
    expect((await entrar({ email: dados.email, senha: dados.senha }, { ip })).status).toBe(200);
  });

  it("limita por e-mail mesmo trocando de IP (10 por hora)", async () => {
    const { dados } = await registrar();
    for (let i = 0; i < 10; i++) {
      expect((await entrar({ email: dados.email, senha: "errada-errada-1" })).status).toBe(401);
    }
    expect((await entrar({ email: dados.email, senha: dados.senha })).status).toBe(429);
    avancar(60 * 60_000 + 1000);
    expect((await entrar({ email: dados.email, senha: dados.senha })).status).toBe(200);
  });

  it("limita cadastros por IP (5 por minuto)", async () => {
    const ip = "198.51.100.8";
    for (let i = 0; i < 5; i++) expect((await cadastrar(novoCadastro(), { ip })).status).toBe(201);
    const bloqueado = await cadastrar(novoCadastro(), { ip });
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.headers.get("retry-after")).not.toBeNull();
    avancar(61_000);
  });

  it("concorrência: 20 logins simultâneos do mesmo IP (e-mails distintos) dão exatamente 5 respostas processadas e 15 × 429", async () => {
    const ip = "198.51.100.50";
    const contas = [];
    for (let i = 0; i < 20; i++) contas.push((await registrar()).dados);
    const respostas = await Promise.all(contas.map((c) => entrar({ email: c.email, senha: c.senha }, { ip })));
    const status = respostas.map((r) => r.status);
    // Credenciais corretas: as 5 processadas devem ser 200; as demais, bloqueadas antes de qualquer verificação.
    expect(status.filter((s) => s === 200)).toHaveLength(5);
    expect(status.filter((s) => s === 429)).toHaveLength(15);
    expect(status.filter((s) => s !== 200 && s !== 429)).toHaveLength(0);
    for (const r of respostas.filter((x) => x.status === 429)) expect(r.headers.get("retry-after")).not.toBeNull();
    // Só as 5 aceitas abriram sessão.
    const abertas = await Promise.all(
      contas.map(async (c) => Number((await banco.pool.query("select count(*) from sessoes s join usuarios u on u.id = s.usuario_id where u.email = $1", [c.email])).rows[0].count)),
    );
    // Cada cadastro já abriu 1 sessão; o login aceito abre mais uma.
    expect(abertas.filter((n) => n === 2)).toHaveLength(5);
    expect(abertas.filter((n) => n === 1)).toHaveLength(15);
    avancar(61_000);
  });

  it("concorrência: 20 logins simultâneos do mesmo e-mail com IPs distintos dão exatamente 10 processados e 10 × 429", async () => {
    const { dados } = await registrar();
    const respostas = await Promise.all(
      Array.from({ length: 20 }, (_, i) => entrar({ email: dados.email, senha: "errada-errada-1" }, { ip: `192.0.2.${i + 1}` })),
    );
    const status = respostas.map((r) => r.status);
    expect(status.filter((s) => s === 401)).toHaveLength(10);
    expect(status.filter((s) => s === 429)).toHaveLength(10);
    avancar(60 * 60_000 + 1000);
  });

  it("não guarda IP nem e-mail em texto no contador", async () => {
    const ip = "203.0.113.99";
    const { dados } = await registrar();
    await entrar({ email: dados.email, senha: dados.senha }, { ip });
    const { rows } = await banco.pool.query("select chave from limites_taxa");
    expect(rows.length).toBeGreaterThan(0);
    for (const { chave } of rows) {
      expect(chave).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});

describe("GET /auth/eu", () => {
  it("devolve o usuário com cookie válido", async () => {
    const { dados, cookie } = await registrar();
    const resposta = await eu(cookie);
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("cache-control")).toBe("no-store");
    expect((await resposta.json()).usuario).toMatchObject({ usuario: dados.usuario, email: dados.email });
  });

  it("visitante recebe 200 com usuario null (não 401)", async () => {
    const resposta = await eu();
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({ usuario: null });
  });

  it("token inventado, adulterado ou malformado: null, e o cookie ruim é apagado", async () => {
    const { cookie } = await registrar();
    const token = cookie.split("=")[1];
    const adulterado = `sessao=${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`;
    for (const ruim of [adulterado, `sessao=${"x".repeat(43)}`, "sessao=lixo"]) {
      const resposta = await eu(ruim);
      expect(await resposta.json()).toEqual({ usuario: null });
      expect(resposta.headers.get("set-cookie")).toContain("Max-Age=0");
    }
  });

  it("nunca expõe hash de senha, token ou id de sessão", async () => {
    const { cookie } = await registrar();
    const texto = await (await eu(cookie)).text();
    expect(texto).not.toMatch(/senha|hash|scrypt|sess/i);
  });

  it("a sessão expira por inatividade (30 dias) e por vida absoluta (90 dias)", async () => {
    const { cookie } = await registrar();
    avancar(INATIVIDADE_MAXIMA_MS - 60_000);
    expect((await (await eu(cookie)).json()).usuario).not.toBeNull();
    // o uso acima renovou a janela deslizante; passar da inatividade a partir dele expira
    avancar(INATIVIDADE_MAXIMA_MS + 60_000);
    expect(await (await eu(cookie)).json()).toEqual({ usuario: null });

    const outra = (await registrar()).cookie;
    // usa a cada 29 dias: a janela desliza, mas o limite absoluto de 90 dias é definitivo
    for (let i = 0; i < 3; i++) {
      avancar(29 * 24 * 3600_000);
      expect((await (await eu(outra)).json()).usuario).not.toBeNull();
    }
    avancar(4 * 24 * 3600_000); // 3*29+4 = 91 dias desde a criação
    expect(await (await eu(outra)).json()).toEqual({ usuario: null });
  });

  it("a renovação deslizante nunca passa do limite absoluto", async () => {
    const { cookie } = await registrar();
    const token = cookie.split("=")[1];
    avancar(80 * 24 * 3600_000);
    await eu(cookie);
    const { rows } = await banco.pool.query("select expira_em, expira_absoluta_em from sessoes where token_hash = $1", [hashToken(token)]);
    expect(new Date(rows[0].expira_em).getTime()).toBeLessThanOrEqual(new Date(rows[0].expira_absoluta_em).getTime());
  });

  it("não grava a cada requisição: só renova depois de 5 minutos", async () => {
    const { cookie } = await registrar();
    const token = cookie.split("=")[1];
    const ler = async () =>
      (await banco.pool.query("select ultimo_uso_em from sessoes where token_hash = $1", [hashToken(token)])).rows[0].ultimo_uso_em.getTime();
    const inicial = await ler();
    avancar(60_000);
    await eu(cookie);
    expect(await ler()).toBe(inicial);
    avancar(5 * 60_000);
    await eu(cookie);
    expect(await ler()).toBe(relogio.getTime());
  });
});

describe("sair", () => {
  it("revoga a sessão no banco, apaga o cookie e a sessão deixa de valer", async () => {
    const { cookie } = await registrar();
    const token = cookie.split("=")[1];
    const resposta = await sair(cookie);

    expect(resposta.status).toBe(204);
    expect(await resposta.text()).toBe("");
    expect(resposta.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(resposta.headers.get("cache-control")).toBe("no-store");

    const { rows } = await banco.pool.query("select revogada_em from sessoes where token_hash = $1", [hashToken(token)]);
    expect(rows[0].revogada_em).not.toBeNull();
    expect(await (await eu(cookie)).json()).toEqual({ usuario: null });
  });

  it("é idempotente e funciona sem sessão", async () => {
    const { cookie } = await registrar();
    expect((await sair(cookie)).status).toBe(204);
    expect((await sair(cookie)).status).toBe(204);
    expect((await sair()).status).toBe(204);
  });

  it("encerrar uma sessão não encerra as outras do mesmo usuário", async () => {
    const { dados, cookie } = await registrar();
    const segunda = cookieDe(await entrar({ email: dados.email, senha: dados.senha }));
    await sair(cookie);
    expect((await (await eu(segunda)).json()).usuario).not.toBeNull();
  });

  it("revogar todas as sessões do usuário invalida todas", async () => {
    const { dados, cookie } = await registrar();
    const segunda = cookieDe(await entrar({ email: dados.email, senha: dados.senha }));
    const [usuario] = await banco.db.select().from(usuarios).where(eq(usuarios.email, dados.email));
    await revogarSessoesDoUsuario(banco.db, usuario.id, relogio);
    expect(await (await eu(cookie)).json()).toEqual({ usuario: null });
    expect(await (await eu(segunda)).json()).toEqual({ usuario: null });
  });

  it("removerSessoesInvalidas apaga expiradas e revogadas e mantém as válidas", async () => {
    const { cookie: valida } = await registrar();
    const { cookie: revogada } = await registrar();
    await sair(revogada);
    avancar(1000);
    await removerSessoesInvalidas(banco.db, relogio);
    expect((await (await eu(valida)).json()).usuario).not.toBeNull();
    const { rows } = await banco.pool.query("select 1 from sessoes where token_hash = $1", [hashToken(revogada.split("=")[1])]);
    expect(rows).toHaveLength(0);
  });
});

describe("cookie em produção", () => {
  it("usa __Host- e Secure, e só reconhece o cookie com esse nome", async () => {
    const prod = criarHandlers({ producao: true });
    const dados = novoCadastro();
    const resposta = await prod.cadastro(requisicao("POST", "/api/v1/auth/cadastro", dados), undefined);
    const setCookie = resposta.headers.get("set-cookie") ?? "";
    expect(resposta.status).toBe(201);
    expect(setCookie).toMatch(/^__Host-sessao=/);
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).not.toContain("Domain");

    const nome = configuracaoCookie(true).nome;
    const token = setCookie.split(";")[0].split("=")[1];
    const comNome = await prod.eu(requisicao("GET", "/api/v1/auth/eu", undefined, { cabecalhos: { cookie: `${nome}=${token}` } }), undefined);
    expect((await comNome.json()).usuario).not.toBeNull();
    const semPrefixo = await prod.eu(requisicao("GET", "/api/v1/auth/eu", undefined, { cabecalhos: { cookie: `sessao=${token}` } }), undefined);
    expect(await semPrefixo.json()).toEqual({ usuario: null });
  });
});

describe("guardas de autenticação e autorização", () => {
  const cookie = configuracaoCookie(false);
  const comCookie = (valor?: string) =>
    new Request(`${ORIGEM}/x`, { headers: valor ? { cookie: valor } : {} });

  it("exigirSessao: sem cookie, token inválido ou revogado = 401; válido = usuário", async () => {
    await expect(exigirSessao(banco.db, comCookie(), cookie, relogio)).rejects.toMatchObject({ codigo: "nao_autenticado", status: 401 });
    await expect(exigirSessao(banco.db, comCookie("sessao=lixo"), cookie, relogio)).rejects.toBeInstanceOf(ErroApi);

    const { dados, cookie: valor } = await registrar();
    const sessao = await exigirSessao(banco.db, comCookie(valor), cookie, relogio);
    expect(sessao.usuario.usuario).toBe(dados.usuario);
    await sair(valor);
    await expect(exigirSessao(banco.db, comCookie(valor), cookie, relogio)).rejects.toMatchObject({ status: 401 });
  });

  it("exigirPapel: membro recebe 403 em rota de admin; admin passa; o papel vem do banco, não do cliente", async () => {
    const { dados, cookie: valor } = await registrar();
    await expect(exigirPapel(banco.db, comCookie(valor), cookie, ["admin"], relogio)).rejects.toMatchObject({ codigo: "sem_permissao", status: 403 });
    await expect(exigirPapel(banco.db, comCookie(), cookie, ["admin"], relogio)).rejects.toMatchObject({ status: 401 });

    await banco.db.update(usuarios).set({ papel: "admin" }).where(eq(usuarios.email, dados.email));
    const sessao = await exigirPapel(banco.db, comCookie(valor), cookie, ["admin", "moderador"], relogio);
    expect(sessao.usuario.papel).toBe("admin");
  });
});

describe("registro de erros", () => {
  it("falha inesperada vira 500 genérico e o log não contém a senha enviada", async () => {
    const quebrado = criarManipuladoresAuth({
      obterDb: () => {
        throw new Error("falha de conexão simulada");
      },
      agora: () => relogio,
      parametrosSenha: BARATO,
    });
    const espiao = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const resposta = await quebrado.entrar(requisicao("POST", "/api/v1/auth/entrar", { email: "a@b.co", senha: "senha-super-secreta" }), undefined);
      const texto = await resposta.text();
      expect(resposta.status).toBe(500);
      expect(texto).not.toContain("conexão");
      const registros = espiao.mock.calls.flat().join(" ");
      expect(registros).not.toContain("senha-super-secreta");
    } finally {
      espiao.mockRestore();
    }
  });
});
