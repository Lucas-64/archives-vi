import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { criarManipuladoresInvestigacoes } from "../investigacoes/rotas";
import { criarBancoDeTeste, codigoPg, type BancoDeTeste } from "../testes/banco";
import { criarManipuladoresPublicacoes } from "../publicacoes/rotas";
import { criarManipuladoresMisterios } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };
const ORIGEM = "http://localhost:3000";
const IMAGEM_BLOB = "https://abc123.public.blob.vercel-storage.com/imagens/capa.png";

let banco: BancoDeTeste;
let relogio = new Date("2026-11-04T15:00:00Z");
const avancar = (ms = 1000) => {
  relogio = new Date(relogio.getTime() + ms);
};
let auth: ReturnType<typeof criarManipuladoresAuth>;
let m: ReturnType<typeof criarManipuladoresMisterios>;
let inv: ReturnType<typeof criarManipuladoresInvestigacoes>;
let pubs: ReturnType<typeof criarManipuladoresPublicacoes>;
let seq = 0;
const unico = () => `m${++seq}`;

type OpReq = { corpo?: unknown; cookie?: string; semCsrf?: boolean; origem?: string };
function req(metodo: string, caminho: string, o: OpReq = {}) {
  const cab: Record<string, string> = { "x-forwarded-for": `10.4.0.${++seq}`, origin: o.origem ?? ORIGEM };
  if (!o.semCsrf) cab["x-requested-with"] = "archives-vi";
  if (o.cookie) cab.cookie = o.cookie;
  const body = o.corpo !== undefined ? JSON.stringify(o.corpo) : undefined;
  if (body !== undefined) cab["content-type"] = "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cab, body });
}
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });

const criarMisterio = (corpo: unknown, cookie?: string, extra: OpReq = {}) =>
  m.criar(req("POST", "/api/v1/misterios", { corpo, cookie, ...extra }), undefined);
const detalheMisterio = (slug: string) => m.detalhe(req("GET", `/api/v1/misterios/${slug}`), ctx(slug));
const listarMisterios = (q = "") => m.listar(req("GET", `/api/v1/misterios${q}`), undefined);
const criarInv = (corpo: unknown, cookie?: string) => inv.criar(req("POST", "/api/v1/investigacoes", { corpo, cookie }), undefined);
const listarInv = (q = "") => inv.listar(req("GET", `/api/v1/investigacoes${q}`), undefined);
const detalheInv = (slug: string) => inv.detalhe(req("GET", `/api/v1/investigacoes/${slug}`), ctx(slug));
const encerrarInv = (slug: string, cookie: string) => inv.encerrar(req("POST", `/api/v1/investigacoes/${slug}/encerrar`, { cookie }), ctx(slug));

const novoMisterio = (extra: Record<string, unknown> = {}) => ({
  titulo: `Mistério ${unico()}`,
  descricao: "Descrição com mais de vinte caracteres, para passar na validação.",
  ...extra,
});
const novaInv = (extra: Record<string, unknown> = {}) => ({
  titulo: `Investigação ${unico()}`,
  descricao: "Descrição com mais de vinte caracteres, para passar na validação.",
  categoria: "symbol",
  teoria: {
    hipotese: "Hipótese com mais de vinte caracteres, para passar na validação.",
    argumentosFavoraveis: ["Primeiro argumento"],
    perguntaCentral: "Isto é coincidência?",
    fontes: ["Fonte demonstrativa"],
  },
  ...extra,
});

async function registrar() {
  const id = unico();
  const r = await auth.cadastro(
    req("POST", "/api/v1/auth/cadastro", { corpo: { usuario: `membro_${id}`, email: `${id}@exemplo.com`, senha: "senha-de-teste-1" } }),
    undefined,
  );
  expect(r.status).toBe(201);
  const c = await r.json();
  return { cookie: (r.headers.get("set-cookie") ?? "").split(";")[0], id: c.usuario.id as string };
}
type Membro = Awaited<ReturnType<typeof registrar>>;

async function abrirMisterio(membro: Membro, extra: Record<string, unknown> = {}) {
  const r = await criarMisterio(novoMisterio(extra), membro.cookie);
  expect(r.status).toBe(201);
  return (await r.json()) as { slug: string; id: string };
}

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const opcoes = { obterDb: () => banco.db, agora: () => relogio, producao: false };
  auth = criarManipuladoresAuth({ ...opcoes, parametrosSenha: BARATO });
  m = criarManipuladoresMisterios(opcoes);
  inv = criarManipuladoresInvestigacoes(opcoes);
  pubs = criarManipuladoresPublicacoes(opcoes);
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("migração 0008_misterios", () => {
  it("cria a tabela, a coluna opcional e as restrições", async () => {
    const tabelas = await banco.pool.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    expect(tabelas.rows.map((r) => r.table_name)).toContain("misterios");
    const col = await banco.pool.query("select is_nullable from information_schema.columns where table_name='investigacoes' and column_name='misterio_id'");
    expect(col.rows[0].is_nullable).toBe("YES");
  });

  it("recusa classificação, status e slug inválidos (23514), slug duplicado (23505) e apagar mistério com investigação (23503)", async () => {
    const membro = await registrar();
    const base = { titulo: "Mistério de banco", descricao: "Descrição com mais de vinte caracteres.", autorId: membro.id };
    const inserir = (extra: Record<string, unknown>) =>
      banco.pool.query(
        "insert into misterios (slug, titulo, descricao, classificacao, status, autor_id) values ($1,$2,$3,$4,$5,$6)",
        [extra.slug ?? unico(), base.titulo, base.descricao, extra.classificacao ?? "curiosidade", extra.status ?? "publicado", base.autorId],
      );
    await expect(inserir({ classificacao: "outra" })).rejects.toSatisfy((e) => codigoPg(e) === "23514");
    await expect(inserir({ status: "rascunho" })).rejects.toSatisfy((e) => codigoPg(e) === "23514");
    await expect(inserir({ slug: "Inválido" })).rejects.toSatisfy((e) => codigoPg(e) === "23514");
    await inserir({ slug: "duplicado-db" });
    await expect(inserir({ slug: "duplicado-db" })).rejects.toSatisfy((e) => codigoPg(e) === "23505");

    const criado = await abrirMisterio(membro);
    expect((await criarInv(novaInv({ misterio: criado.slug }), membro.cookie)).status).toBe(201);
    await expect(banco.pool.query("delete from misterios where id=$1", [criado.id])).rejects.toSatisfy((e) => codigoPg(e) === "23503");
  });
});

describe("POST /misterios", () => {
  it("visitante 401, CSRF e origem de outro site 403, sem gravar nada", async () => {
    const membro = await registrar();
    const antes = (await banco.pool.query("select count(*)::int n from misterios")).rows[0].n;
    expect((await criarMisterio(novoMisterio())).status).toBe(401);
    expect((await criarMisterio(novoMisterio(), membro.cookie, { semCsrf: true })).status).toBe(403);
    expect((await criarMisterio(novoMisterio(), membro.cookie, { origem: "http://outro.exemplo" })).status).toBe(403);
    expect((await banco.pool.query("select count(*)::int n from misterios")).rows[0].n).toBe(antes);
  });

  it("membro cria: 201, Location, autor da sessão, classificação padrão, status publicado e zero abertas", async () => {
    const membro = await registrar();
    const r = await criarMisterio(
      novoMisterio({ titulo: "  Marcas Na Parede  ", video: { url: "https://youtu.be/dQw4w9WgXcQ", titulo: "Trailer" }, imagem: IMAGEM_BLOB }),
      membro.cookie,
    );
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(r.headers.get("location")).toBe("/api/v1/misterios/marcas-na-parede");
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c).toMatchObject({
      slug: "marcas-na-parede",
      titulo: "Marcas Na Parede",
      classificacao: "em-andamento",
      imagem: IMAGEM_BLOB,
      video: { url: "https://youtu.be/dQw4w9WgXcQ", titulo: "Trailer" },
      investigacoesAbertas: 0,
    });
    expect(c.autor.nome).toBeTruthy();
    const linha = (await banco.pool.query("select status, autor_id from misterios where slug=$1", [c.slug])).rows[0];
    expect(linha).toEqual({ status: "publicado", autor_id: membro.id });
  });

  it("aceita cada classificação e recusa valores e campos inventados com 422", async () => {
    const membro = await registrar();
    for (const classificacao of ["em-andamento", "resolvido", "easter-egg", "curiosidade"]) {
      avancar();
      const r = await criarMisterio(novoMisterio({ classificacao }), membro.cookie);
      expect(r.status, classificacao).toBe(201);
      expect((await r.json()).classificacao).toBe(classificacao);
      relogio = new Date(relogio.getTime() + 61_000);
    }
    const invalidos: Record<string, unknown>[] = [
      { classificacao: "outra" },
      { status: "oculto" },
      { slug: "meu-slug" },
      { autor: "outro" },
      { titulo: "ab" },
      { descricao: "curta" },
      { imagem: "https://exemplo.com/capa.jpg" },
      { video: { url: "https://exemplo.com/video" } },
    ];
    for (const extra of invalidos) {
      relogio = new Date(relogio.getTime() + 61_000);
      const r = await criarMisterio({ ...novoMisterio(), ...extra }, membro.cookie);
      expect(r.status, JSON.stringify(extra)).toBe(422);
    }
  });

  it("limita a criação por minuto (429 com Retry-After)", async () => {
    const membro = await registrar();
    for (let i = 0; i < 5; i++) expect((await criarMisterio(novoMisterio(), membro.cookie)).status).toBe(201);
    const r = await criarMisterio(novoMisterio(), membro.cookie);
    expect(r.status).toBe(429);
    expect(r.headers.get("retry-after")).toBeTruthy();
    relogio = new Date(relogio.getTime() + 61_000);
    expect((await criarMisterio(novoMisterio(), membro.cookie)).status).toBe(201);
  });

  it("limita a criação por dia", async () => {
    const membro = await registrar();
    for (let i = 0; i < 20; i++) {
      relogio = new Date(relogio.getTime() + 61_000);
      expect((await criarMisterio(novoMisterio(), membro.cookie)).status, `criação ${i + 1}`).toBe(201);
    }
    relogio = new Date(relogio.getTime() + 61_000);
    expect((await criarMisterio(novoMisterio(), membro.cookie)).status).toBe(429);
    relogio = new Date(relogio.getTime() + 24 * 60 * 60_000);
    expect((await criarMisterio(novoMisterio(), membro.cookie)).status).toBe(201);
  });

  it("slug é único entre mistérios, investigações e publicações", async () => {
    const membro = await registrar();
    const a = await abrirMisterio(membro, { titulo: "Titulo Compartilhado" });
    relogio = new Date(relogio.getTime() + 61_000);
    const b = await abrirMisterio(membro, { titulo: "Titulo Compartilhado" });
    expect(a.slug).toBe("titulo-compartilhado");
    expect(b.slug).not.toBe(a.slug);
    const i = await criarInv(novaInv({ titulo: "Titulo Compartilhado" }), membro.cookie);
    expect(i.status).toBe(201);
    expect((await i.json()).slug).not.toMatch(/^titulo-compartilhado$/);
    // Publicação com o mesmo título também escolhe outro slug.
    const p = await pubs.criar(req("POST", "/api/v1/publicacoes", { corpo: { titulo: "Titulo Compartilhado", corpo: "Texto de publicação com mais de vinte caracteres." }, cookie: membro.cookie }), undefined);
    expect(p.status).toBe(201);
    expect((await p.json()).slug).not.toBe("titulo-compartilhado");
  });
});

describe("GET /misterios e /misterios/{slug}", () => {
  it("detalhe público, 404 para slug inexistente ou inválido e oculto some", async () => {
    const membro = await registrar();
    const criado = await abrirMisterio(membro);
    const r = await detalheMisterio(criado.slug);
    expect(r.status).toBe(200);
    expect((await r.json()).slug).toBe(criado.slug);
    expect((await detalheMisterio("nao-existe")).status).toBe(404);
    expect((await detalheMisterio("Inválido!")).status).toBe(404);

    await banco.pool.query("update misterios set status='oculto' where slug=$1", [criado.slug]);
    expect((await detalheMisterio(criado.slug)).status).toBe(404);
    const lista = await (await listarMisterios("?limite=50")).json();
    expect(lista.itens.map((x: { slug: string }) => x.slug)).not.toContain(criado.slug);
  });

  it("lista com filtro por classificação, ordem do mais recente e cursor", async () => {
    const membro = await registrar();
    const criados: string[] = [];
    for (const classificacao of ["easter-egg", "curiosidade", "easter-egg"]) {
      relogio = new Date(relogio.getTime() + 61_000);
      criados.push((await abrirMisterio(membro, { classificacao })).slug);
    }
    const eggs = await (await listarMisterios("?classificacao=easter-egg&limite=50")).json();
    const slugs = eggs.itens.map((x: { slug: string }) => x.slug);
    expect(slugs).toContain(criados[0]);
    expect(slugs).toContain(criados[2]);
    expect(slugs).not.toContain(criados[1]);
    expect(slugs.indexOf(criados[2])).toBeLessThan(slugs.indexOf(criados[0]));
    expect(eggs.itens.every((x: { classificacao: string }) => x.classificacao === "easter-egg")).toBe(true);
    expect((await listarMisterios("?classificacao=outra")).status).toBe(422);

    const p1 = await (await listarMisterios("?limite=2")).json();
    expect(p1.itens).toHaveLength(2);
    expect(p1.proximoCursor).toBeTruthy();
    const p2 = await (await listarMisterios(`?limite=2&cursor=${p1.proximoCursor}`)).json();
    expect(p2.itens.length).toBeGreaterThan(0);
    expect(p2.itens.map((x: { id: string }) => x.id)).not.toContain(p1.itens[0].id);
    expect((await listarMisterios("?cursor=lixo")).status).toBe(400);
  });
});

describe("vínculo mistério → investigação", () => {
  it("investigação vinculada aparece no detalhe e na lista; sem vínculo continua válida (D6)", async () => {
    const autorMisterio = await registrar();
    const autor = await registrar();
    const mis = await abrirMisterio(autorMisterio, { titulo: "Mistério Vinculado" });

    const livre = await criarInv(novaInv(), autor.cookie);
    expect(livre.status).toBe(201);
    expect((await livre.json()).misterio).toBeUndefined();

    const r = await criarInv(novaInv({ misterio: mis.slug }), autor.cookie);
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(c.misterio).toEqual({ slug: mis.slug, titulo: "Mistério Vinculado" });
    const linha = (await banco.pool.query("select misterio_id from investigacoes where slug=$1", [c.slug])).rows[0];
    expect(linha.misterio_id).toBe(mis.id);

    const d = await (await detalheInv(c.slug)).json();
    expect(d.misterio).toEqual({ slug: mis.slug, titulo: "Mistério Vinculado" });
    const lista = await (await listarInv("?limite=50")).json();
    expect(lista.itens.find((x: { slug: string }) => x.slug === c.slug).misterio.slug).toBe(mis.slug);
  });

  it("mistério inexistente, oculto ou slug inválido dá 422 e não grava a investigação", async () => {
    const autor = await registrar();
    const mis = await abrirMisterio(autor);
    await banco.pool.query("update misterios set status='oculto' where slug=$1", [mis.slug]);
    const antes = (await banco.pool.query("select count(*)::int n from investigacoes")).rows[0].n;
    for (const misterio of ["nao-existe", mis.slug, "Inválido!"]) {
      const r = await criarInv(novaInv({ misterio }), autor.cookie);
      expect(r.status, misterio).toBe(422);
    }
    expect((await criarInv(novaInv({ misterio: mis.slug }), autor.cookie)).status).toBe(422);
    expect((await banco.pool.query("select count(*)::int n from investigacoes")).rows[0].n).toBe(antes);
  });

  it("PATCH não aceita trocar o mistério", async () => {
    const autor = await registrar();
    const mis = await abrirMisterio(autor);
    const c = await (await criarInv(novaInv(), autor.cookie)).json();
    const r = await inv.editar(req("PATCH", `/api/v1/investigacoes/${c.slug}`, { corpo: { misterio: mis.slug }, cookie: autor.cookie }), ctx(c.slug));
    expect(r.status).toBe(422);
  });

  it("GET /investigacoes?misterio= lista só as vinculadas, com cursor; mistério inexistente dá 404", async () => {
    const dono = await registrar();
    const mis = await abrirMisterio(dono);
    const outro = await abrirMisterio(dono);
    const membros = [await registrar(), await registrar(), await registrar()];
    const vinculadas: string[] = [];
    for (const membro of membros) {
      avancar();
      vinculadas.push((await (await criarInv(novaInv({ misterio: mis.slug }), membro.cookie)).json()).slug);
    }
    const alheia = await (await criarInv(novaInv({ misterio: outro.slug }), (await registrar()).cookie)).json();

    const todas = await (await listarInv(`?misterio=${mis.slug}&limite=50`)).json();
    expect(todas.itens.map((x: { slug: string }) => x.slug).sort()).toEqual([...vinculadas].sort());
    expect(todas.itens.map((x: { slug: string }) => x.slug)).not.toContain(alheia.slug);

    const p1 = await (await listarInv(`?misterio=${mis.slug}&limite=2`)).json();
    expect(p1.itens).toHaveLength(2);
    const p2 = await (await listarInv(`?misterio=${mis.slug}&limite=2&cursor=${p1.proximoCursor}`)).json();
    expect(p2.itens).toHaveLength(1);
    expect(p2.proximoCursor).toBeNull();

    expect((await listarInv("?misterio=nao-existe")).status).toBe(404);
    expect((await listarInv("?misterio=Inválido!")).status).toBe(422);
  });

  it("investigacoesAbertas conta só as não encerradas pelo autor (D4) e cai ao encerrar", async () => {
    const dono = await registrar();
    const mis = await abrirMisterio(dono);
    const a = await registrar();
    const b = await registrar();
    expect((await (await detalheMisterio(mis.slug)).json()).investigacoesAbertas).toBe(0);
    const ia = await (await criarInv(novaInv({ misterio: mis.slug }), a.cookie)).json();
    await criarInv(novaInv({ misterio: mis.slug }), b.cookie);
    await criarInv(novaInv(), a.cookie); // sem vínculo: não conta
    expect((await (await detalheMisterio(mis.slug)).json()).investigacoesAbertas).toBe(2);

    expect((await encerrarInv(ia.slug, a.cookie)).status).toBe(200);
    expect((await (await detalheMisterio(mis.slug)).json()).investigacoesAbertas).toBe(1);
    const lista = await (await listarMisterios("?limite=50")).json();
    expect(lista.itens.find((x: { slug: string }) => x.slug === mis.slug).investigacoesAbertas).toBe(1);
    // A investigação encerrada continua listada no mistério.
    const todas = await (await listarInv(`?misterio=${mis.slug}`)).json();
    expect(todas.itens).toHaveLength(2);
  });

  it("criações simultâneas vinculadas ao mesmo mistério contam sem perda", async () => {
    const dono = await registrar();
    const mis = await abrirMisterio(dono);
    const membros = await Promise.all([registrar(), registrar(), registrar(), registrar(), registrar()]);
    const respostas = await Promise.all(membros.map((membro) => criarInv(novaInv({ misterio: mis.slug }), membro.cookie)));
    expect(respostas.map((r) => r.status)).toEqual([201, 201, 201, 201, 201]);
    expect((await (await detalheMisterio(mis.slug)).json()).investigacoesAbertas).toBe(5);
  });

  it("o limite de 3 abertas por membro vale também para investigações vinculadas", async () => {
    const dono = await registrar();
    const mis = await abrirMisterio(dono);
    const autor = await registrar();
    for (let i = 0; i < 3; i++) expect((await criarInv(novaInv({ misterio: mis.slug }), autor.cookie)).status).toBe(201);
    expect((await criarInv(novaInv({ misterio: mis.slug }), autor.cookie)).status).toBe(409);
  });
});
