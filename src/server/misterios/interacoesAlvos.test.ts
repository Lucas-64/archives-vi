import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { criarManipuladoresInvestigacoes } from "../investigacoes/rotas";
import { criarManipuladoresPublicacoes } from "../publicacoes/rotas";
import { criarManipuladoresInteracoes } from "../publicacoes/rotasInteracoes";
import { semearMisteriosDemonstracao, MISTERIOS_DEMONSTRACAO } from "../cli/seedDemonstracaoMisterios";
import { codigoPg, criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { criarManipuladoresMisterios } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };
const ORIGEM = "http://localhost:3000";

let banco: BancoDeTeste;
let relogio = new Date("2026-11-04T15:00:00Z");
let auth: ReturnType<typeof criarManipuladoresAuth>;
let m: ReturnType<typeof criarManipuladoresMisterios>;
let inv: ReturnType<typeof criarManipuladoresInvestigacoes>;
let it_: ReturnType<typeof criarManipuladoresInteracoes>;
let pubs: ReturnType<typeof criarManipuladoresPublicacoes>;
let seq = 0;
const unico = () => `c${++seq}`;

type OpReq = { corpo?: unknown; cookie?: string; semCsrf?: boolean };
function req(metodo: string, caminho: string, o: OpReq = {}) {
  const cab: Record<string, string> = { "x-forwarded-for": `10.5.0.${++seq}`, origin: ORIGEM };
  if (!o.semCsrf) cab["x-requested-with"] = "archives-vi";
  if (o.cookie) cab.cookie = o.cookie;
  const body = o.corpo !== undefined ? JSON.stringify(o.corpo) : undefined;
  if (body !== undefined) cab["content-type"] = "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cab, body });
}
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });
const avancarMin = () => {
  relogio = new Date(relogio.getTime() + 61_000);
};

async function registrar() {
  const id = unico();
  const r = await auth.cadastro(
    req("POST", "/api/v1/auth/cadastro", { corpo: { usuario: `membro_${id}`, email: `${id}@exemplo.com`, senha: "senha-de-teste-1" } }),
    undefined,
  );
  expect(r.status).toBe(201);
  const c = await r.json();
  return { cookie: (r.headers.get("set-cookie") ?? "").split(";")[0], id: c.usuario.id as string, usuario: `membro_${id}` };
}
type Membro = Awaited<ReturnType<typeof registrar>>;

async function novoMisterio(membro: Membro) {
  avancarMin();
  const r = await m.criar(
    req("POST", "/api/v1/misterios", { corpo: { titulo: `Mistério ${unico()}`, descricao: "Descrição com mais de vinte caracteres, ok." }, cookie: membro.cookie }),
    undefined,
  );
  expect(r.status).toBe(201);
  return (await r.json()) as { slug: string; id: string };
}
async function novaInv(membro: Membro, extra: Record<string, unknown> = {}) {
  const r = await inv.criar(
    req("POST", "/api/v1/investigacoes", {
      cookie: membro.cookie,
      corpo: {
        titulo: `Investigação ${unico()}`,
        descricao: "Descrição com mais de vinte caracteres, ok.",
        categoria: "symbol",
        teoria: { hipotese: "Hipótese com mais de vinte caracteres, ok.", argumentosFavoraveis: [], perguntaCentral: "Será que sim?", fontes: [] },
        ...extra,
      },
    }),
    undefined,
  );
  expect(r.status).toBe(201);
  return (await r.json()) as { slug: string; id: string };
}
const comentar = (alvo: string, texto: string, cookie?: string) =>
  it_.criarComentario(req("POST", "/api/v1/comentarios", { corpo: { alvo, texto }, cookie }), undefined);
const listarC = (alvo: string, q = "") => it_.listarComentarios(req("GET", `/api/v1/comentarios?alvo=${encodeURIComponent(alvo)}${q}`), undefined);
const curtirInv = (slug: string, cookie?: string) => it_.curtirInvestigacao(req("PUT", `/api/v1/investigacoes/${slug}/curtida`, { cookie }), ctx(slug));
const descurtirInv = (slug: string, cookie?: string) => it_.descurtirInvestigacao(req("DELETE", `/api/v1/investigacoes/${slug}/curtida`, { cookie }), ctx(slug));

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const opcoes = { obterDb: () => banco.db, agora: () => relogio, producao: false };
  auth = criarManipuladoresAuth({ ...opcoes, parametrosSenha: BARATO });
  m = criarManipuladoresMisterios(opcoes);
  inv = criarManipuladoresInvestigacoes(opcoes);
  it_ = criarManipuladoresInteracoes(opcoes);
  pubs = criarManipuladoresPublicacoes(opcoes);
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("migração 0009: um alvo por comentário", () => {
  it("recusa comentário sem alvo ou com dois alvos (23514)", async () => {
    const u = await registrar();
    const mis = await novoMisterio(u);
    const i = await novaInv(u);
    const inserir = (mid: string | null, iid: string | null) =>
      banco.pool.query("insert into comentarios (misterio_id, investigacao_id, autor_id, texto) values ($1,$2,$3,'x')", [mid, iid, u.id]);
    await expect(inserir(null, null)).rejects.toSatisfy((e) => codigoPg(e) === "23514");
    await expect(inserir(mis.id, i.id)).rejects.toSatisfy((e) => codigoPg(e) === "23514");
    await inserir(mis.id, null);
  });
});

describe("comentários no mistério e na investigação", () => {
  for (const tipo of ["misterio", "investigacao"] as const) {
    it(`${tipo}: visitante 401, membro comenta, lista em ordem cronológica, alvos separados`, async () => {
      const u = await registrar();
      const criar = tipo === "misterio" ? novoMisterio : novaInv;
      const a = await criar(u);
      const b = await criar(u).catch(() => a);
      expect((await comentar(`${tipo}:${a.slug}`, "oi")).status).toBe(401);
      const r1 = await comentar(`${tipo}:${a.slug}`, "  Primeiro  ", u.cookie);
      expect(r1.status).toBe(201);
      expect(await r1.json()).toMatchObject({ texto: "Primeiro", autor: { usuario: u.usuario } });
      relogio = new Date(relogio.getTime() + 1000);
      expect((await comentar(`${tipo}:${a.slug}`, "Segundo", u.cookie)).status).toBe(201);
      const lista = await (await listarC(`${tipo}:${a.slug}`)).json();
      expect(lista.itens.map((c: { texto: string }) => c.texto)).toEqual(["Primeiro", "Segundo"]);
      if (b.slug !== a.slug) expect((await (await listarC(`${tipo}:${b.slug}`)).json()).itens).toHaveLength(0);
      const pag = await (await listarC(`${tipo}:${a.slug}`, "&limite=1")).json();
      expect(pag.itens).toHaveLength(1);
      expect(pag.proximoCursor).toBeTruthy();
      expect((await listarC(`${tipo}:inexistente`)).status).toBe(404);
      expect((await listarC(`${tipo}:Inválido`)).status).toBe(422);
    });
  }

  it("mistério oculto não aceita nem lista comentários; texto inválido dá 422", async () => {
    const u = await registrar();
    const mis = await novoMisterio(u);
    expect((await comentar(`misterio:${mis.slug}`, "", u.cookie)).status).toBe(422);
    await banco.pool.query("update misterios set status='oculto' where slug=$1", [mis.slug]);
    expect((await comentar(`misterio:${mis.slug}`, "oi", u.cookie)).status).toBe(404);
    expect((await listarC(`misterio:${mis.slug}`)).status).toBe(404);
  });

  it("as contagens aparecem em GET /misterios e GET /investigacoes", async () => {
    const u = await registrar();
    const mis = await novoMisterio(u);
    const i = await novaInv(u);
    await comentar(`misterio:${mis.slug}`, "a", u.cookie);
    await comentar(`misterio:${mis.slug}`, "b", u.cookie);
    await comentar(`investigacao:${i.slug}`, "c", u.cookie);
    expect((await (await m.detalhe(req("GET", `/api/v1/misterios/${mis.slug}`), ctx(mis.slug))).json()).comentarios).toBe(2);
    const d = await (await inv.detalhe(req("GET", `/api/v1/investigacoes/${i.slug}`), ctx(i.slug))).json();
    expect(d.comentarios).toBe(1);
  });

  it("publicações continuam funcionando com o novo alvo genérico", async () => {
    const u = await registrar();
    const p = await pubs.criar(req("POST", "/api/v1/publicacoes", { corpo: { titulo: `Pub ${unico()}`, corpo: "Texto de publicação com mais de vinte caracteres." }, cookie: u.cookie }), undefined);
    const { slug } = await p.json();
    expect((await comentar(`publicacao:${slug}`, "ok", u.cookie)).status).toBe(201);
    expect((await (await listarC(`publicacao:${slug}`)).json()).itens).toHaveLength(1);
  });
});

describe("curtida de investigação", () => {
  it("exige sessão e CSRF, é idempotente e individual", async () => {
    const a = await registrar();
    const b = await registrar();
    const i = await novaInv(a);
    expect((await curtirInv(i.slug)).status).toBe(401);
    expect((await it_.curtirInvestigacao(req("PUT", `/api/v1/investigacoes/${i.slug}/curtida`, { cookie: a.cookie, semCsrf: true }), ctx(i.slug))).status).toBe(403);
    expect(await (await curtirInv(i.slug, a.cookie)).json()).toEqual({ curtidas: 1, euCurti: true });
    expect(await (await curtirInv(i.slug, a.cookie)).json()).toEqual({ curtidas: 1, euCurti: true });
    expect(await (await curtirInv(i.slug, b.cookie)).json()).toEqual({ curtidas: 2, euCurti: true });
    expect(await (await descurtirInv(i.slug, a.cookie)).json()).toEqual({ curtidas: 1, euCurti: false });
    expect(await (await descurtirInv(i.slug, a.cookie)).json()).toEqual({ curtidas: 1, euCurti: false });
    expect((await curtirInv("nao-existe", a.cookie)).status).toBe(404);
  });

  it("curtidas simultâneas do mesmo membro não duplicam; euCurti vem na leitura com sessão", async () => {
    const a = await registrar();
    const i = await novaInv(a);
    await Promise.all([curtirInv(i.slug, a.cookie), curtirInv(i.slug, a.cookie), curtirInv(i.slug, a.cookie)]);
    expect((await banco.pool.query("select count(*)::int n from investigacao_curtidas where investigacao_id=$1", [i.id])).rows[0].n).toBe(1);
    const visto = await (await inv.detalhe(req("GET", `/api/v1/investigacoes/${i.slug}`, { cookie: a.cookie }), ctx(i.slug))).json();
    expect(visto).toMatchObject({ curtidas: 1, euCurti: true });
    const anonimo = await (await inv.detalhe(req("GET", `/api/v1/investigacoes/${i.slug}`), ctx(i.slug))).json();
    expect(anonimo).toMatchObject({ curtidas: 1, euCurti: false });
  });
});

describe("filtro autor", () => {
  it("GET /misterios?autor= e GET /investigacoes?autor= filtram pela conta; inexistente 404, inválido 422", async () => {
    const a = await registrar();
    const b = await registrar();
    const ma = await novoMisterio(a);
    await novoMisterio(b);
    const ia = await novaInv(a);
    await novaInv(b);
    const lm = await (await m.listar(req("GET", `/api/v1/misterios?autor=${a.usuario}`), undefined)).json();
    expect(lm.itens.map((x: { slug: string }) => x.slug)).toEqual([ma.slug]);
    const li = await (await inv.listar(req("GET", `/api/v1/investigacoes?autor=${a.usuario}`), undefined)).json();
    expect(li.itens.map((x: { slug: string }) => x.slug)).toEqual([ia.slug]);
    expect((await m.listar(req("GET", "/api/v1/misterios?autor=ninguem_assim"), undefined)).status).toBe(404);
    expect((await inv.listar(req("GET", "/api/v1/investigacoes?autor=ninguem_assim"), undefined)).status).toBe(404);
    expect((await m.listar(req("GET", "/api/v1/misterios?autor=Inv%C3%A1lido"), undefined)).status).toBe(422);
  });
});

describe("seed de demonstração (D8)", () => {
  it("cria um mistério por classificação com investigações vinculadas, é idempotente e conta abertas", async () => {
    const r1 = await semearMisteriosDemonstracao(banco.db);
    expect(r1.criados.length).toBeGreaterThan(MISTERIOS_DEMONSTRACAO.length);
    const r2 = await semearMisteriosDemonstracao(banco.db);
    expect(r2.criados).toEqual([]);
    const cls = (await banco.pool.query("select distinct classificacao from misterios where slug = any($1)", [MISTERIOS_DEMONSTRACAO.map((x) => x.slug)])).rows.map((x) => x.classificacao).sort();
    expect(cls).toEqual(["curiosidade", "easter-egg", "em-andamento", "resolvido"]);
    const mural = await (await m.detalhe(req("GET", "/api/v1/misterios/downtown-mural-symbols"), ctx("downtown-mural-symbols"))).json();
    expect(mural.investigacoesAbertas).toBe(1); // a outra está encerrada
    const lista = await (await inv.listar(req("GET", "/api/v1/investigacoes?misterio=downtown-mural-symbols"), undefined)).json();
    expect(lista.itens).toHaveLength(2);
  });
});
