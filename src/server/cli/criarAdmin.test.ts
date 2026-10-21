import { spawnSync } from "node:child_process";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { verificarSenha } from "../auth/senha";
import { criarManipuladoresAuth } from "../auth/rotas";
import { validarSessao } from "../auth/sessao";
import { usuarios } from "../db/esquema";
import { criarPrimeiroAdmin, ErroBootstrap, ROTULO_BOOTSTRAP, type EntradaPrimeiroAdmin } from "../servicos/admin";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { registrarMembro } from "../testes/http";
import { executarCriarAdmin, lerArgumentos, SAIDA, type EntradaSaida } from "./criarAdmin";

const BARATO = { N: 1024, r: 8, p: 1 };
const SENHA = "senha-do-admin-123";
const banco: BancoDeTeste[] = [];
let n = 0;

async function novoBanco() {
  const b = await criarBancoDeTeste();
  banco.push(b);
  return b;
}
afterAll(async () => {
  for (const b of banco) await b.encerrar();
});

const criar = (b: BancoDeTeste, extra: Partial<Extract<EntradaPrimeiroAdmin, { modo: "criar" }>> = {}) => {
  n += 1;
  return criarPrimeiroAdmin(b.db, { modo: "criar", usuario: `admin_${n}`, email: `admin${n}@exemplo.com`, senha: SENHA, ...extra }, { parametrosSenha: BARATO });
};
const promover = (b: BancoDeTeste, usuario: string) => criarPrimeiroAdmin(b.db, { modo: "promover", usuario });
const erroDe = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e as ErroBootstrap;
  }
  throw new Error("esperava falha");
};
const contar = async (b: BancoDeTeste, tabela: string, onde = "true") => (await b.pool.query(`select count(*)::int n from ${tabela} where ${onde}`)).rows[0].n as number;
const instantaneo = async (b: BancoDeTeste) =>
  JSON.stringify([(await b.pool.query("select id, usuario, email, senha_hash, papel from usuarios order by id")).rows, (await b.pool.query("select * from auditoria order by id")).rows]);

describe("criarPrimeiroAdmin: criar", () => {
  it("cria o administrador, com hash verificável, auditoria sem segredos e sem sessão aberta", async () => {
    const b = await novoBanco();
    const r = await criar(b, { usuario: "Chefe_01 ", email: " Chefe@Exemplo.com ", nome: "Chefe" });
    expect(r).toMatchObject({ usuario: "chefe_01", modo: "criar" });
    const u = (await b.pool.query("select * from usuarios where id=$1", [r.id])).rows[0];
    expect(u).toMatchObject({ papel: "admin", usuario: "chefe_01", email: "chefe@exemplo.com", nome: "Chefe", demonstrativo: false });
    expect(await verificarSenha(SENHA, u.senha_hash)).toBe(true);
    expect(await verificarSenha("outra-senha-qualquer", u.senha_hash)).toBe(false);
    expect(u.senha_hash).not.toContain(SENHA);
    expect(await contar(b, "sessoes")).toBe(0);

    const aud = (await b.pool.query("select * from auditoria")).rows;
    expect(aud).toHaveLength(1);
    expect(aud[0]).toMatchObject({ ator_id: null, ator_rotulo: ROTULO_BOOTSTRAP, acao: "admin.bootstrap", alvo_tipo: "usuario", alvo_id: r.id, antes: null, depois: { papel: "admin", modo: "criar" }, motivo: null });
    const texto = JSON.stringify(aud);
    for (const proibido of [SENHA, "chefe@exemplo.com", u.senha_hash, "scrypt"]) expect(texto).not.toContain(proibido);
  });

  it("o hash gravado permite entrar pela API de login", async () => {
    const b = await novoBanco();
    const r = await criar(b, { usuario: "login_ok", email: "login_ok@exemplo.com" });
    expect(r.usuario).toBe("login_ok");
    const auth = criarManipuladoresAuth({ obterDb: () => b.db, agora: () => new Date(), parametrosSenha: BARATO, producao: false });
    const resposta = await auth.entrar(
      new Request("http://localhost:3000/api/v1/auth/entrar", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000", "x-requested-with": "archives-vi", "x-forwarded-for": "10.7.0.1" },
        body: JSON.stringify({ email: "login_ok@exemplo.com", senha: SENHA }),
      }),
      undefined,
    );
    expect(resposta.status).toBe(200);
    expect((await resposta.json()).usuario.papel).toBe("admin");
  });

  it.each([
    ["senha curta", { senha: "1234567" }, "senha"],
    ["senha longa", { senha: "x".repeat(129) }, "senha"],
    ["senha vazia", { senha: "" }, "senha"],
    ["usuário inválido", { usuario: "a b" }, "usuario"],
    ["usuário curto", { usuario: "ab" }, "usuario"],
    ["e-mail inválido", { email: "sem-arroba" }, "email"],
    ["nome longo", { nome: "x".repeat(61) }, "nome"],
  ])("entrada inválida (%s): recusa sem gravar nada", async (_r, extra, campo) => {
    const b = await novoBanco();
    const e = await erroDe(criar(b, extra));
    expect(e).toBeInstanceOf(ErroBootstrap);
    expect(e.codigo).toBe("entrada_invalida");
    expect(Object.keys(e.campos ?? {})).toContain(campo);
    expect(await contar(b, "usuarios")).toBe(0);
    expect(await contar(b, "auditoria")).toBe(0);
  });

  it("limites de senha exatos (8 e 128) são aceitos", async () => {
    const b = await novoBanco();
    await criar(b, { senha: "12345678" });
    const b2 = await novoBanco();
    await criar(b2, { senha: "x".repeat(128) });
  });

  it("usuário ou e-mail já existentes: conflito, sem criar administrador e sem alterar a conta existente", async () => {
    const b = await novoBanco();
    await b.db.insert(usuarios).values({ usuario: "fulano", email: "fulano@exemplo.com", senhaHash: "x", nome: "Fulano" });
    const antes = await instantaneo(b);
    const porUsuario = await erroDe(criar(b, { usuario: "fulano", email: "novo@exemplo.com" }));
    const porEmail = await erroDe(criar(b, { usuario: "novo", email: "fulano@exemplo.com" }));
    expect([porUsuario.codigo, porEmail.codigo]).toEqual(["conflito", "conflito"]);
    expect(await instantaneo(b)).toBe(antes);
    expect(await contar(b, "usuarios", "papel='admin'")).toBe(0);
  });
});

describe("criarPrimeiroAdmin: já existe administrador", () => {
  it("recusa criar e promover sem alterar NADA (nem usuários, nem auditoria, nem sessões)", async () => {
    const b = await novoBanco();
    await criar(b);
    await b.db.insert(usuarios).values({ usuario: "comum", email: "comum@exemplo.com", senhaHash: "x", nome: "Comum" });
    const antes = await instantaneo(b);
    const e1 = await erroDe(criar(b));
    const e2 = await erroDe(promover(b, "comum"));
    expect([e1.codigo, e2.codigo]).toEqual(["ja_existe_admin", "ja_existe_admin"]);
    expect(await instantaneo(b)).toBe(antes);
  });

  it("mesmo com entrada inválida, a validação vem antes e nada é gravado", async () => {
    const b = await novoBanco();
    await criar(b);
    const e = await erroDe(criar(b, { senha: "curta" }));
    expect(e.codigo).toBe("entrada_invalida");
    expect(await contar(b, "usuarios")).toBe(1);
  });
});

describe("criarPrimeiroAdmin: promover", () => {
  it("promove conta existente, revoga as sessões dela e audita antes/depois sem dados privados", async () => {
    const b = await novoBanco();
    const auth = criarManipuladoresAuth({ obterDb: () => b.db, agora: () => new Date(), parametrosSenha: BARATO, producao: false });
    const m = await registrarMembro(auth);
    const outro = await registrarMembro(auth);
    const token = decodeURIComponent(m.cookie.split("=")[1]);
    expect(await validarSessao(b.db, token)).not.toBeNull();

    const r = await promover(b, m.usuario);
    expect(r).toMatchObject({ id: m.id, usuario: m.usuario, modo: "promover" });
    expect((await b.pool.query("select papel from usuarios where id=$1", [m.id])).rows[0].papel).toBe("admin");
    expect(await validarSessao(b.db, token)).toBeNull();
    // Sessão de outra conta continua valendo.
    expect(await contar(b, "sessoes", `usuario_id='${outro.id}' and revogada_em is null`)).toBe(1);
    const [a] = (await b.pool.query("select * from auditoria")).rows;
    expect(a).toMatchObject({ ator_id: null, ator_rotulo: ROTULO_BOOTSTRAP, acao: "admin.bootstrap", alvo_id: m.id, antes: { papel: "membro" }, depois: { papel: "admin", modo: "promover" } });
    expect(JSON.stringify(a)).not.toContain(m.email);
  });

  it("conta inexistente e nome inválido: recusa sem alterar", async () => {
    const b = await novoBanco();
    expect((await erroDe(promover(b, "ninguem_aqui"))).codigo).toBe("alvo_inexistente");
    expect((await erroDe(promover(b, "Nome Inválido!"))).codigo).toBe("entrada_invalida");
    expect(await contar(b, "auditoria")).toBe(0);
  });
});

describe("criarPrimeiroAdmin: concorrência (PostgreSQL real)", () => {
  it("determinístico: com o bloqueio do bootstrap ocupado, a criação espera e, ao ser liberada, recusa porque já existe administrador", async () => {
    const b = await novoBanco();
    const segurando = await b.pool.connect();
    try {
      await segurando.query("begin");
      await segurando.query("select pg_advisory_xact_lock(hashtextextended('admin:bootstrap', 0))");
      let terminou = false;
      const tentativa = criar(b).then(
        (r) => ({ r }),
        (e) => ({ e }),
      );
      void tentativa.then(() => (terminou = true));
      await new Promise((resolve) => setTimeout(resolve, 600));
      // Sem o bloqueio, a criação já teria terminado (e criado um segundo administrador).
      expect(terminou).toBe(false);
      expect(await contar(b, "usuarios")).toBe(0);
      // Quem segura o bloqueio cria o administrador e libera.
      await segurando.query("insert into usuarios (usuario, email, senha_hash, nome, papel) values ('primeiro','primeiro@exemplo.com','x','Primeiro','admin')");
      await segurando.query("commit");
      const resultado = await tentativa;
      expect(resultado).toHaveProperty("e");
      expect((resultado as { e: ErroBootstrap }).e.codigo).toBe("ja_existe_admin");
      expect(await contar(b, "usuarios", "papel='admin'")).toBe(1);
      expect(await contar(b, "auditoria")).toBe(0);
    } finally {
      segurando.release();
    }
  });

  it("mesma garantia para a promoção: espera o bloqueio e recusa depois", async () => {
    const b = await novoBanco();
    await b.db.insert(usuarios).values({ usuario: "candidato", email: "candidato@exemplo.com", senhaHash: "x", nome: "C" });
    const segurando = await b.pool.connect();
    try {
      await segurando.query("begin");
      await segurando.query("select pg_advisory_xact_lock(hashtextextended('admin:bootstrap', 0))");
      let terminou = false;
      const tentativa = promover(b, "candidato").then(
        (r) => ({ r }),
        (e) => ({ e }),
      );
      void tentativa.then(() => (terminou = true));
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(terminou).toBe(false);
      await segurando.query("insert into usuarios (usuario, email, senha_hash, nome, papel) values ('primeiro','primeiro@exemplo.com','x','Primeiro','admin')");
      await segurando.query("commit");
      expect((((await tentativa) as { e: ErroBootstrap }).e).codigo).toBe("ja_existe_admin");
      expect((await b.pool.query("select papel from usuarios where usuario='candidato'")).rows[0].papel).toBe("membro");
    } finally {
      segurando.release();
    }
  });

  it("5 execuções simultâneas de criação: exatamente um administrador, uma auditoria e 4 recusas", async () => {
    const b = await novoBanco();
    const resultados = await Promise.allSettled(Array.from({ length: 5 }, () => criar(b)));
    const ok = resultados.filter((r) => r.status === "fulfilled");
    const falhas = resultados.filter((r): r is PromiseRejectedResult => r.status === "rejected");
    expect(ok).toHaveLength(1);
    expect(falhas).toHaveLength(4);
    for (const f of falhas) expect((f.reason as ErroBootstrap).codigo).toBe("ja_existe_admin");
    expect(await contar(b, "usuarios", "papel='admin'")).toBe(1);
    expect(await contar(b, "usuarios")).toBe(1);
    expect(await contar(b, "auditoria", "acao='admin.bootstrap'")).toBe(1);
  });

  it("criação e promoções simultâneas misturadas também terminam com um único administrador", async () => {
    const b = await novoBanco();
    const nomes: string[] = [];
    for (let i = 0; i < 3; i++) {
      const nome = `candidato_${i}`;
      nomes.push(nome);
      await b.db.insert(usuarios).values({ usuario: nome, email: `${nome}@exemplo.com`, senhaHash: "x", nome });
    }
    const resultados = await Promise.allSettled([...nomes.map((nome) => promover(b, nome)), criar(b), criar(b)]);
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await contar(b, "usuarios", "papel='admin'")).toBe(1);
    expect(await contar(b, "auditoria", "acao='admin.bootstrap'")).toBe(1);
  });
});

// Orquestração do script com E/S falsa: nada de banco.
function io(opcoes: { terminal: boolean; respostas?: string[] }) {
  const saidas: string[] = [];
  const perguntas: { texto: string; semEco: boolean }[] = [];
  const respostas = [...(opcoes.respostas ?? [])];
  const e: EntradaSaida = {
    temTerminal: opcoes.terminal,
    escrever: (t) => void saidas.push(t),
    escreverErro: (t) => void saidas.push(t),
    perguntar: async (texto, semEco) => {
      perguntas.push({ texto, semEco });
      return respostas.shift() ?? "";
    },
  };
  return { e, saidas, perguntas };
}
const URL_FALSA = "postgresql://x:x@127.0.0.1:1/x";

describe("script admin:criar: argumentos e guardas", () => {
  it("recusa senha na linha de comando, em qualquer forma, sem executar nem ecoar o valor", async () => {
    for (const argv of [["--usuario", "a_b", "--email", "a@b.co", "--senha", "segredo-12345"], ["--usuario", "a_b", "--email", "a@b.co", "--senha=segredo-12345"]]) {
      const chamadas: unknown[] = [];
      const { e, saidas } = io({ terminal: false });
      const codigo = await executarCriarAdmin(argv, { env: { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "x".repeat(10) }, io: e, executar: async (...a) => (chamadas.push(a), { id: "1", usuario: "a_b", modo: "criar" }) });
      expect(codigo).toBe(SAIDA.entradaInvalida);
      expect(chamadas).toHaveLength(0);
      expect(saidas.join("")).not.toContain("segredo-12345");
    }
    expect(lerArgumentos(["--outra"])).toHaveProperty("erro");
    expect(lerArgumentos(["valor-solto"])).toHaveProperty("erro");
    expect(lerArgumentos(["--usuario"])).toHaveProperty("erro");
  });

  it("exige DATABASE_URL, --usuario e --email; --promover não aceita --email", async () => {
    const roda = async (argv: string[], env: Record<string, string>) => {
      const { e } = io({ terminal: false });
      return executarCriarAdmin(argv, { env, io: e, executar: async () => ({ id: "1", usuario: "x", modo: "criar" }) });
    };
    expect(await roda(["--usuario", "abc", "--email", "a@b.co"], { ADMIN_SENHA: "senha-longa-1" })).toBe(SAIDA.entradaInvalida);
    expect(await roda(["--email", "a@b.co"], { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "senha-longa-1" })).toBe(SAIDA.entradaInvalida);
    expect(await roda(["--usuario", "abc"], { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "senha-longa-1" })).toBe(SAIDA.entradaInvalida);
    expect(await roda(["--promover", "--usuario", "abc", "--email", "a@b.co", "--confirmar"], { DATABASE_URL: URL_FALSA })).toBe(SAIDA.entradaInvalida);
  });

  it("em produção exige --confirmar (e não executa sem ele)", async () => {
    const chamadas: unknown[] = [];
    const executar = async (...a: unknown[]) => (chamadas.push(a), { id: "1", usuario: "abc", modo: "criar" });
    const env = { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "senha-longa-1", NODE_ENV: "production" };
    const sem = io({ terminal: false });
    expect(await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co"], { env, io: sem.e, executar })).toBe(SAIDA.cancelado);
    expect(chamadas).toHaveLength(0);
    const com = io({ terminal: false });
    expect(await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co", "--confirmar"], { env, io: com.e, executar })).toBe(SAIDA.ok);
    expect(chamadas).toHaveLength(1);
  });

  it("com terminal: pede a senha duas vezes SEM eco; senhas diferentes cancelam; a senha vai só ao serviço e nunca à saída", async () => {
    const recebidas: EntradaPrimeiroAdmin[] = [];
    const ok = io({ terminal: true, respostas: ["senha-secreta-9", "senha-secreta-9"] });
    const codigo = await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co"], {
      env: { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "deveria-ser-ignorada" },
      io: ok.e,
      executar: async (_u, entrada) => (recebidas.push(entrada), { id: "id-1", usuario: "abc", modo: "criar" }),
    });
    expect(codigo).toBe(SAIDA.ok);
    expect(ok.perguntas).toHaveLength(2);
    expect(ok.perguntas.every((p) => p.semEco)).toBe(true);
    expect(recebidas[0]).toMatchObject({ modo: "criar", senha: "senha-secreta-9" });
    expect(ok.saidas.join("")).not.toContain("senha-secreta-9");
    expect(ok.saidas.join("")).not.toContain("a@b.co");

    const diferente = io({ terminal: true, respostas: ["senha-secreta-9", "outra-senha-99"] });
    const chamadas: unknown[] = [];
    expect(await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co"], { env: { DATABASE_URL: URL_FALSA }, io: diferente.e, executar: async (...a) => (chamadas.push(a), { id: "1", usuario: "abc", modo: "criar" }) })).toBe(SAIDA.entradaInvalida);
    expect(chamadas).toHaveLength(0);
  });

  it("sem terminal: usa ADMIN_SENHA; sem ela, recusa", async () => {
    const recebidas: EntradaPrimeiroAdmin[] = [];
    const executar = async (_u: string, entrada: EntradaPrimeiroAdmin) => (recebidas.push(entrada), { id: "1", usuario: "abc", modo: "criar" });
    const a = io({ terminal: false });
    expect(await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co"], { env: { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "senha-do-ambiente" }, io: a.e, executar })).toBe(SAIDA.ok);
    expect(recebidas[0]).toMatchObject({ senha: "senha-do-ambiente" });
    expect(a.perguntas).toHaveLength(0);
    expect(a.saidas.join("")).not.toContain("senha-do-ambiente");
    const b = io({ terminal: false });
    expect(await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co"], { env: { DATABASE_URL: URL_FALSA }, io: b.e, executar })).toBe(SAIDA.entradaInvalida);
  });

  it("promoção: terminal exige digitar o nome do usuário; sem terminal exige --confirmar", async () => {
    const chamadas: EntradaPrimeiroAdmin[] = [];
    const executar = async (_u: string, entrada: EntradaPrimeiroAdmin) => (chamadas.push(entrada), { id: "1", usuario: "abc", modo: "promover" });
    const env = { DATABASE_URL: URL_FALSA };
    const errado = io({ terminal: true, respostas: ["outro"] });
    expect(await executarCriarAdmin(["--promover", "--usuario", "abc"], { env, io: errado.e, executar })).toBe(SAIDA.cancelado);
    expect(chamadas).toHaveLength(0);
    const certo = io({ terminal: true, respostas: ["ABC "] });
    expect(await executarCriarAdmin(["--promover", "--usuario", "abc"], { env, io: certo.e, executar })).toBe(SAIDA.ok);
    expect(chamadas).toEqual([{ modo: "promover", usuario: "abc" }]);
    const semTerminal = io({ terminal: false });
    expect(await executarCriarAdmin(["--promover", "--usuario", "abc"], { env, io: semTerminal.e, executar })).toBe(SAIDA.cancelado);
    expect(await executarCriarAdmin(["--promover", "--usuario", "abc", "--confirmar"], { env, io: semTerminal.e, executar })).toBe(SAIDA.ok);
  });

  it("códigos de saída: já existe admin = 3; conflito e conta inexistente = 4; entrada inválida = 2; erro inesperado = 1 sem vazar a mensagem", async () => {
    const roda = async (erro: unknown) => {
      const x = io({ terminal: false });
      const codigo = await executarCriarAdmin(["--usuario", "abc", "--email", "a@b.co"], {
        env: { DATABASE_URL: URL_FALSA, ADMIN_SENHA: "senha-longa-1" },
        io: x.e,
        executar: async () => {
          throw erro;
        },
      });
      return { codigo, texto: x.saidas.join("") };
    };
    expect((await roda(new ErroBootstrap("ja_existe_admin", "Já existe um administrador. Nada foi alterado."))).codigo).toBe(3);
    expect((await roda(new ErroBootstrap("conflito", "x"))).codigo).toBe(4);
    expect((await roda(new ErroBootstrap("alvo_inexistente", "x"))).codigo).toBe(4);
    expect((await roda(new ErroBootstrap("entrada_invalida", "x"))).codigo).toBe(2);
    const inesperado = await roda(new Error("connection string postgresql://u:SEGREDO@host/db falhou"));
    expect(inesperado.codigo).toBe(1);
    expect(inesperado.texto).not.toContain("SEGREDO");
  });
});

describe("script admin:criar: processo real (tsx) em banco descartável", () => {
  let b: BancoDeTeste;
  let url: string;
  beforeAll(async () => {
    b = await novoBanco();
    const u = new URL(process.env.TEST_DATABASE_URL as string);
    u.pathname = `/${b.nome}`;
    url = u.toString();
  });

  const rodar = (args: string[], env: Record<string, string>) =>
    spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "src/server/cli/criarAdmin.ts", ...args], {
      env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", DATABASE_URL: url, ...env } as unknown as NodeJS.ProcessEnv,
      encoding: "utf8",
      input: "",
      timeout: 60_000,
    });

  it("primeira execução cria (saída 0); a segunda recusa (saída 3) sem alterar nada; nenhuma saída contém senha, e-mail ou hash", async () => {
    const primeiro = rodar(["--usuario", "dono_real", "--email", "dono.real@exemplo.com"], { ADMIN_SENHA: "senha-via-ambiente-1" });
    expect(primeiro.status, primeiro.stderr).toBe(0);
    const [u] = (await b.pool.query("select * from usuarios")).rows;
    expect(u).toMatchObject({ usuario: "dono_real", papel: "admin" });
    expect(await verificarSenha("senha-via-ambiente-1", u.senha_hash)).toBe(true);
    expect(await contar(b, "auditoria", "acao='admin.bootstrap' and ator_id is null and ator_rotulo='cli:admin:criar'")).toBe(1);

    const antes = await instantaneo(b);
    const segundo = rodar(["--usuario", "outro_admin", "--email", "outro@exemplo.com"], { ADMIN_SENHA: "outra-senha-via-ambiente" });
    expect(segundo.status).toBe(3);
    expect(await instantaneo(b)).toBe(antes);
    for (const saida of [primeiro.stdout + primeiro.stderr, segundo.stdout + segundo.stderr]) {
      for (const proibido of ["senha-via-ambiente-1", "outra-senha-via-ambiente", "dono.real@exemplo.com", "outro@exemplo.com", u.senha_hash]) expect(saida).not.toContain(proibido);
    }
  });

  it("senha na linha de comando é recusada pelo processo (saída 2) e nada é gravado", async () => {
    const antes = await instantaneo(b);
    const r = rodar(["--usuario", "x_y_z", "--email", "xyz@exemplo.com", "--senha", "nao-pode-aqui-1"], {});
    expect(r.status).toBe(2);
    expect(r.stdout + r.stderr).not.toContain("nao-pode-aqui-1");
    expect(await instantaneo(b)).toBe(antes);
  });
});
