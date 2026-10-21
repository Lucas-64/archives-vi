import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { LIMITES } from "../auth/limiteTaxa";
import { comentarios, evidencias, publicacoes } from "../db/esquema";
import { criarManipuladoresInvestigacoes } from "../investigacoes/rotas";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { req, registrarMembro, unico, type Membro } from "../testes/http";
import { normalizarBusca } from "../servicos/usuarios";
import { criarManipuladoresUsuarios } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };

let banco: BancoDeTeste;
let relogio = new Date("2026-10-21T12:00:00Z");
const avancar = (ms = 1000) => {
  relogio = new Date(relogio.getTime() + ms);
};
let auth: ReturnType<typeof criarManipuladoresAuth>;
let inv: ReturnType<typeof criarManipuladoresInvestigacoes>;
let h: ReturnType<typeof criarManipuladoresUsuarios>;

const ctx = (usuario: string) => ({ params: Promise.resolve({ usuario }) });
const criadores = (q = "", cookie?: string) => h.criadores(req("GET", `/api/v1/criadores${q}`, { cookie }), undefined);
const perfil = (usuario: string) => h.perfil(req("GET", `/api/v1/usuarios/${usuario}`), ctx(usuario));
const pubsDe = (usuario: string, q = "", cookie?: string) => h.publicacoes(req("GET", `/api/v1/usuarios/${usuario}/publicacoes${q}`, { cookie }), ctx(usuario));
const invsDe = (usuario: string, q = "", cookie?: string) => h.investigacoes(req("GET", `/api/v1/usuarios/${usuario}/investigacoes${q}`, { cookie }), ctx(usuario));
const editar = (corpo: unknown, cookie?: string, extra: Parameters<typeof req>[2] = {}) =>
  h.editarPerfil(req("PATCH", "/api/v1/me/perfil", { corpo, cookie, ...extra }), undefined);

const novaInv = () => ({
  titulo: `Investigação ${unico()}`,
  descricao: "Descrição com mais de vinte caracteres, para passar na validação.",
  categoria: "symbol",
  teoria: { hipotese: "Hipótese com mais de vinte caracteres, para passar na validação.", argumentosFavoraveis: ["a"], perguntaCentral: "Isto é coincidência?", fontes: [] },
});
async function abrirInv(dono: Membro) {
  const r = await inv.criar(req("POST", "/api/v1/investigacoes", { corpo: novaInv(), cookie: dono.cookie }), undefined);
  expect(r.status).toBe(201);
  return (await r.json()).slug as string;
}
async function publicar(autor: Membro, sobrescrever: Partial<typeof publicacoes.$inferInsert> = {}) {
  const slug = `pub-${unico()}`;
  await banco.db.insert(publicacoes).values({ slug, titulo: `Título ${slug}`, resumo: "r", corpo: "c", tipo: "teoria", autorId: autor.id, ...sobrescrever });
  return slug;
}
const idPub = async (slug: string) => (await banco.pool.query("select id from publicacoes where slug=$1", [slug])).rows[0].id as string;
const idInv = async (slug: string) => (await banco.pool.query("select id from investigacoes where slug=$1", [slug])).rows[0].id as string;
const nome = (m: Membro, n: string) => banco.pool.query("update usuarios set nome=$2 where id=$1", [m.id, n]);
const corpoDe = async (r: Response) => r.json();

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const opcoes = { obterDb: () => banco.db, agora: () => relogio, producao: false };
  auth = criarManipuladoresAuth({ ...opcoes, parametrosSenha: BARATO });
  inv = criarManipuladoresInvestigacoes(opcoes);
  h = criarManipuladoresUsuarios(opcoes);
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("normalizarBusca", () => {
  it("remove acentos, ignora maiúsculas e mapeia letras sem decomposição", () => {
    expect(normalizarBusca("JOÃO Çedilha")).toBe("joao cedilha");
    expect(normalizarBusca("Łukasz Øvre Đorđe Iı")).toBe("lukasz ovre dorde ii");
    expect(normalizarBusca("")).toBe("");
  });
});

describe("GET /usuarios/{usuario}", () => {
  it("perfil público sem campos privados e com indicadores reais (só conteúdo público)", async () => {
    const a = await registrarMembro(auth);
    const outro = await registrarMembro(auth);
    const slugInv = await abrirInv(a);
    await publicar(a);
    await publicar(a);
    await publicar(a, { status: "oculto" });
    const slugOutro = await publicar(outro);
    const slugOculta = await publicar(outro, { status: "oculto" });
    const invId = await idInv(slugInv);
    await banco.db.insert(evidencias).values([
      { investigacaoId: invId, autorId: a.id, origem: "referencia_textual", titulo: "Aceita", descricao: "Descrição de teste da evidência.", status: "aceita", decididaPorId: outro.id, decididaEm: relogio },
      { investigacaoId: invId, autorId: a.id, origem: "referencia_textual", titulo: "Pendente", descricao: "Descrição de teste da evidência.", status: "pendente" },
    ]);
    await banco.db.insert(comentarios).values([
      { publicacaoId: await idPub(slugOutro), autorId: a.id, texto: "visível" },
      { publicacaoId: await idPub(slugOculta), autorId: a.id, texto: "em publicação oculta" },
    ]);

    const r = await perfil(a.usuario);
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const c = await corpoDe(r);
    expect(c).toEqual({
      usuario: a.usuario,
      nome: a.usuario,
      bio: "",
      avatar: null,
      criadoEm: expect.any(String),
      indicadores: { publicacoes: 2, investigacoes: 1, evidenciasAceitas: 1, comentarios: 1 },
    });
    const texto = JSON.stringify(c);
    for (const proibido of [a.email, a.id, "papel", "senha", "hash", "demonstrativo", "email"]) expect(texto).not.toContain(proibido);
  });

  it("conta sem atividade tem perfil com zeros; inexistente e malformado dão 404", async () => {
    const m = await registrarMembro(auth);
    expect((await corpoDe(await perfil(m.usuario))).indicadores).toEqual({ publicacoes: 0, investigacoes: 0, evidenciasAceitas: 0, comentarios: 0 });
    expect((await perfil("ninguem_assim")).status).toBe(404);
    expect((await perfil("Nome Inválido!")).status).toBe(404);
    expect((await perfil("ab")).status).toBe(404);
  });
});

describe("GET /criadores", () => {
  it("só lista quem tem publicação publicada ou investigação; ordem alfabética estável e paginação por cursor", async () => {
    const tag = `zz${unico()}`.toLowerCase();
    const mk = async (sufixo: string) => {
      const m = await registrarMembro(auth);
      await banco.pool.query("update usuarios set usuario=$2 where id=$1", [m.id, `${tag}_${sufixo}`]);
      return { ...m, usuario: `${tag}_${sufixo}` };
    };
    const com1 = await mk("a");
    const com2 = await mk("b");
    const com3 = await mk("c");
    const semNada = await mk("d");
    const soOculta = await mk("e");
    await publicar(com1);
    await abrirInv(com2);
    await publicar(com3);
    await publicar(soOculta, { status: "oculto" });
    void semNada;

    const r = await criadores(`?q=${tag}`);
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const c = await corpoDe(r);
    expect(c.itens.map((i: { usuario: string }) => i.usuario)).toEqual([com1.usuario, com2.usuario, com3.usuario]);

    const p1 = await corpoDe(await criadores(`?q=${tag}&limite=2`));
    expect(p1.itens).toHaveLength(2);
    expect(p1.proximoCursor).toEqual(expect.any(String));
    const p2 = await corpoDe(await criadores(`?q=${tag}&limite=2&cursor=${p1.proximoCursor}`));
    expect(p2.itens.map((i: { usuario: string }) => i.usuario)).toEqual([com3.usuario]);
    expect(p2.proximoCursor).toBeNull();
  });

  it("lista vazia é 200 com itens []; busca sem resultado também", async () => {
    const r = await criadores(`?q=${"x".repeat(40)}`);
    expect(r.status).toBe(200);
    expect(await corpoDe(r)).toEqual({ itens: [], proximoCursor: null });
  });

  it("busca por nome ignora acento e maiúsculas, casa o usuário e trata % e _ como texto literal", async () => {
    const m = await registrarMembro(auth);
    await publicar(m);
    await nome(m, "Ângela Ørsted Çarvalho");
    for (const q of ["angela", "ÂNGELA", "orsted", "carvalho", "çarv", "ø"]) {
      const c = await corpoDe(await criadores(`?q=${encodeURIComponent(q)}`));
      expect(c.itens.map((i: { usuario: string }) => i.usuario), q).toContain(m.usuario);
    }
    const porUsuario = await corpoDe(await criadores(`?q=${m.usuario.toUpperCase()}`));
    expect(porUsuario.itens.map((i: { usuario: string }) => i.usuario)).toContain(m.usuario);
    // `%` e `_` são literais: "membr_" não casa "membro_…" (um `_` curinga casaria).
    for (const q of ["%", "a%a", "\\", "membr_"]) {
      const c = await corpoDe(await criadores(`?q=${encodeURIComponent(q)}`));
      expect(c.itens.map((i: { usuario: string }) => i.usuario), q).not.toContain(m.usuario);
    }
  });

  it("validações: limite 51 → 422; cursor adulterado → 400; q longo → 422; tabelas SQL e JS concordam", async () => {
    expect((await criadores("?limite=51")).status).toBe(422);
    expect((await criadores("?limite=0")).status).toBe(422);
    expect((await criadores("?cursor=%25%25%25")).status).toBe(400);
    expect((await criadores(`?cursor=${Buffer.from(JSON.stringify({ usuario: "X!" })).toString("base64url")}`)).status).toBe(400);
    expect((await criadores(`?q=${"a".repeat(61)}`)).status).toBe(422);

    // O lado do banco (`translate`) precisa dar o mesmo resultado que a função da aplicação.
    const amostra = [..."ÁÀÂÃÄÅĀĂĄÇĆČĎÉÈÊËĒĚĘÍÌÎÏĪÑŃŇÓÒÔÕÖŐŌŔŘŚŠŞŤÚÙÛÜŪŮŰÝŸŹŽŻĹĽĞØŁĐıİ"];
    for (let i = 0; i < amostra.length; i += 25) {
      const trecho = amostra.slice(i, i + 25).join("");
      for (const nomeGravado of [trecho, trecho.toLowerCase()]) {
        const m = await registrarMembro(auth);
        await publicar(m);
        await nome(m, nomeGravado);
        const c = await corpoDe(await criadores(`?q=${encodeURIComponent(normalizarBusca(trecho))}`));
        expect(c.itens.map((i: { usuario: string }) => i.usuario), trecho).toContain(m.usuario);
      }
    }
  });

  it("cada item traz indicadores reais e nenhum dado privado", async () => {
    const m = await registrarMembro(auth);
    await publicar(m);
    await publicar(m);
    const c = await corpoDe(await criadores(`?q=${m.usuario}`));
    expect(c.itens).toHaveLength(1);
    expect(c.itens[0].indicadores.publicacoes).toBe(2);
    expect(JSON.stringify(c)).not.toContain(m.email);
  });
});

describe("listas do usuário", () => {
  it("publicações: só as publicadas do autor, 404 para usuário inexistente, lista vazia é 200", async () => {
    const a = await registrarMembro(auth);
    const b = await registrarMembro(auth);
    const visivel = await publicar(a);
    const oculta = await publicar(a, { status: "oculto" });
    await publicar(b);
    const c = await corpoDe(await pubsDe(a.usuario));
    expect(c.itens.map((i: { slug: string }) => i.slug)).toEqual([visivel]);
    expect(JSON.stringify(c)).not.toContain(oculta);
    expect(await corpoDe(await pubsDe((await registrarMembro(auth)).usuario))).toEqual({ itens: [], proximoCursor: null });
    expect((await pubsDe("ninguem_assim")).status).toBe(404);
    expect((await pubsDe("Nome Inválido!")).status).toBe(404);
  });

  it("publicações: paginação estável e validações herdadas", async () => {
    const a = await registrarMembro(auth);
    const slugs: string[] = [];
    for (let i = 0; i < 3; i++) {
      avancar();
      slugs.push(await publicar(a, { criadoEm: relogio }));
    }
    const p1 = await corpoDe(await pubsDe(a.usuario, "?limite=2"));
    expect(p1.itens).toHaveLength(2);
    const p2 = await corpoDe(await pubsDe(a.usuario, `?limite=2&cursor=${p1.proximoCursor}`));
    expect([...p1.itens, ...p2.itens].map((i: { slug: string }) => i.slug).sort()).toEqual([...slugs].sort());
    expect(p2.proximoCursor).toBeNull();
    expect((await pubsDe(a.usuario, "?limite=51")).status).toBe(422);
    expect((await pubsDe(a.usuario, "?cursor=lixo")).status).toBe(400);
  });

  it("investigações: só as do autor; 404 para inexistente; vazia é 200", async () => {
    const a = await registrarMembro(auth);
    const b = await registrarMembro(auth);
    const s1 = await abrirInv(a);
    await abrirInv(b);
    const c = await corpoDe(await invsDe(a.usuario));
    expect(c.itens.map((i: { slug: string }) => i.slug)).toEqual([s1]);
    expect(await corpoDe(await invsDe((await registrarMembro(auth)).usuario))).toEqual({ itens: [], proximoCursor: null });
    expect((await invsDe("ninguem_assim")).status).toBe(404);
    expect((await invsDe(a.usuario, "?limite=51")).status).toBe(422);
  });
});

describe("PATCH /me/perfil", () => {
  it("visitante 401; sessão inválida 401; sem CSRF 403 (nada muda)", async () => {
    const m = await registrarMembro(auth);
    expect((await editar({ nome: "Novo" })).status).toBe(401);
    expect((await editar({ nome: "Novo" }, "sessao=invalida")).status).toBe(401);
    expect((await editar({ nome: "Novo" }, m.cookie, { semCsrf: true })).status).toBe(403);
    expect((await editar({ nome: "Novo" }, m.cookie, { origem: "http://outro.exemplo" })).status).toBe(403);
    expect((await corpoDe(await perfil(m.usuario))).nome).toBe(m.usuario);
  });

  it("edita nome e bio, devolve o usuário privado, aparece no perfil público e atualiza atualizado_em", async () => {
    const m = await registrarMembro(auth);
    avancar();
    const r = await editar({ nome: "  Nome Novo  ", bio: " Minha bio " }, m.cookie);
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const u = (await corpoDe(r)).usuario;
    expect(u).toMatchObject({ id: m.id, usuario: m.usuario, email: m.email, nome: "Nome Novo", bio: "Minha bio", papel: "membro" });
    expect(await corpoDe(await perfil(m.usuario))).toMatchObject({ nome: "Nome Novo", bio: "Minha bio" });
    expect(new Date((await banco.pool.query("select atualizado_em from usuarios where id=$1", [m.id])).rows[0].atualizado_em).toISOString()).toBe(relogio.toISOString());
  });

  it("bio vazia limpa a bio; reenviar os mesmos valores é no-op (não mexe em atualizado_em)", async () => {
    const m = await registrarMembro(auth);
    avancar();
    expect((await editar({ bio: "algo" }, m.cookie)).status).toBe(200);
    const antes = (await banco.pool.query("select atualizado_em from usuarios where id=$1", [m.id])).rows[0].atualizado_em.toISOString();
    avancar(60_000);
    const r = await editar({ bio: "algo" }, m.cookie);
    expect(r.status).toBe(200);
    expect((await banco.pool.query("select atualizado_em from usuarios where id=$1", [m.id])).rows[0].atualizado_em.toISOString()).toBe(antes);
    expect((await corpoDe(await editar({ bio: "" }, m.cookie))).usuario.bio).toBe("");
  });

  it("campos proibidos, vazios e fora dos limites dão 422 e nada muda", async () => {
    const m = await registrarMembro(auth);
    const proibidos = [{ usuario: "outro_nome" }, { email: "x@y.com" }, { papel: "admin" }, { senha: "senha-de-teste-9" }, { avatar: "http://x" }, { id: m.id }, { demonstrativo: true }, { nome: "Ok", papel: "admin" }];
    for (const c of proibidos) expect((await editar(c, m.cookie)).status, JSON.stringify(c)).toBe(422);
    for (const c of [{}, { nome: "" }, { nome: "   " }, { nome: "a".repeat(61) }, { bio: "a".repeat(241) }, { nome: 5 }, { bio: null }, { nome: "com\u0000controle" }, { bio: "com\u0007controle" }]) {
      expect((await editar(c, m.cookie)).status, JSON.stringify(c)).toBe(422);
    }
    expect((await editar(undefined, m.cookie, { bruto: "null" })).status).toBe(422);
    const limites = await editar({ nome: "a".repeat(60), bio: "b".repeat(240) }, m.cookie);
    expect(limites.status).toBe(200);
    const { rows } = await banco.pool.query("select usuario, email, papel from usuarios where id=$1", [m.id]);
    expect(rows[0]).toEqual({ usuario: m.usuario, email: m.email, papel: "membro" });
  });

  it("corpo malformado 400, tipo errado 415, corpo grande 413", async () => {
    const m = await registrarMembro(auth);
    expect((await editar(undefined, m.cookie, { bruto: "{nao json" })).status).toBe(400);
    expect((await editar(undefined, m.cookie, { bruto: JSON.stringify({ bio: "x".repeat(3000) }) })).status).toBe(413);
    const r = await h.editarPerfil(
      new Request("http://localhost:3000/api/v1/me/perfil", {
        method: "PATCH",
        headers: { origin: "http://localhost:3000", "x-requested-with": "archives-vi", cookie: m.cookie, "content-type": "text/plain" },
        body: "{}",
      }),
      undefined,
    );
    expect(r.status).toBe(415);
  });

  it("só edita a própria conta (sem parâmetro de usuário) e não afeta as outras", async () => {
    const a = await registrarMembro(auth);
    const b = await registrarMembro(auth);
    expect((await editar({ nome: "Só A" }, a.cookie)).status).toBe(200);
    expect((await corpoDe(await perfil(b.usuario))).nome).toBe(b.usuario);
    expect((await corpoDe(await perfil(a.usuario))).nome).toBe("Só A");
  });

  it("limite de edição: a 11ª em um minuto dá 429 com Retry-After", async () => {
    const m = await registrarMembro(auth);
    for (let i = 0; i < LIMITES.perfilEditarMembro.limite; i++) expect((await editar({ bio: `v${i}` }, m.cookie)).status).toBe(200);
    const r = await editar({ bio: "demais" }, m.cookie);
    expect(r.status).toBe(429);
    expect(r.headers.get("retry-after")).toBeTruthy();
    avancar(61_000);
    expect((await editar({ bio: "depois" }, m.cookie)).status).toBe(200);
  });

  it("edições simultâneas se enfileiram: terminam todas, o resultado final é uma delas", async () => {
    const m = await registrarMembro(auth);
    const valores = ["a", "b", "c", "d", "e"];
    const rs = await Promise.all(valores.map((v) => editar({ bio: v }, m.cookie)));
    expect(rs.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
    const { rows } = await banco.pool.query("select bio from usuarios where id=$1", [m.id]);
    expect(valores).toContain(rows[0].bio);
  });
});
