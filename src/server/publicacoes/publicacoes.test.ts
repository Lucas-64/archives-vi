import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { publicacaoTags, publicacaoTermos, publicacoes, usuarios } from "../db/esquema";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { criarManipuladoresPublicacoes } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };
const ORIGEM = "http://localhost:3000";
const SENHA = "senha-de-teste-1";

let banco: BancoDeTeste;
let relogio = new Date("2026-10-20T15:00:00Z");
let auth: ReturnType<typeof criarManipuladoresAuth>;
let h: ReturnType<typeof criarManipuladoresPublicacoes>;
let seq = 0;
const unico = () => `p${++seq}`;

function req(metodo: string, caminho: string, o: { corpo?: unknown; bruto?: string; cookie?: string; semCsrf?: boolean; origem?: string; ip?: string } = {}) {
  const cab: Record<string, string> = { "x-forwarded-for": o.ip ?? `10.1.0.${++seq}`, origin: o.origem ?? ORIGEM };
  if (!o.semCsrf) cab["x-requested-with"] = "archives-vi";
  if (o.cookie) cab.cookie = o.cookie;
  let body: string | undefined;
  if (o.bruto !== undefined) body = o.bruto;
  else if (o.corpo !== undefined) body = JSON.stringify(o.corpo);
  if (body !== undefined) cab["content-type"] = "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cab, body });
}

const contexto = (slug: string) => ({ params: Promise.resolve({ slug }) });
const criar = (corpo: unknown, cookie?: string, extra: Parameters<typeof req>[2] = {}) =>
  h.criar(req("POST", "/api/v1/publicacoes", { corpo, cookie, ...extra }), undefined);
const listar = (query = "") => h.listar(req("GET", `/api/v1/publicacoes${query}`), undefined);
const detalhe = (slug: string) => h.detalhe(req("GET", `/api/v1/publicacoes/${slug}`), contexto(slug));
const relacionadas = (slug: string, query = "") =>
  h.relacionadas(req("GET", `/api/v1/publicacoes/${slug}/relacionadas${query}`), contexto(slug));

const TEXTO = "Este é o texto de uma teoria com mais de vinte caracteres.";
const teoria = (extra: Record<string, unknown> = {}) => ({ titulo: `Teoria ${unico()}`, corpo: TEXTO, ...extra });

async function registrar() {
  const id = unico();
  const r = await auth.cadastro(
    req("POST", "/api/v1/auth/cadastro", { corpo: { usuario: `membro_${id}`, email: `${id}@exemplo.com`, senha: SENHA } }),
    undefined,
  );
  expect(r.status).toBe(201);
  const cookie = (r.headers.get("set-cookie") ?? "").split(";")[0];
  return { cookie, usuario: `membro_${id}`, email: `${id}@exemplo.com`, id: (await r.json()).usuario.id as string };
}

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  auth = criarManipuladoresAuth({ obterDb: () => banco.db, agora: () => relogio, parametrosSenha: BARATO, producao: false });
  h = criarManipuladoresPublicacoes({ obterDb: () => banco.db, agora: () => relogio, producao: false });
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("POST /publicacoes", () => {
  it("visitante recebe 401 sem que a teoria seja gravada", async () => {
    const r = await criar(teoria());
    expect(r.status).toBe(401);
    const { rows } = await banco.pool.query("select count(*)::int as n from publicacoes");
    expect(rows[0].n).toBe(0);
  });

  it("sem cabeçalho CSRF ou com origem de outro site: 403", async () => {
    const m = await registrar();
    expect((await criar(teoria(), m.cookie, { semCsrf: true })).status).toBe(403);
    expect((await criar(teoria(), m.cookie, { origem: "http://outro.exemplo" })).status).toBe(403);
  });

  it("membro cria: 201, autor da sessão, tipo teoria, resumo, slug, data de São Paulo e Location", async () => {
    const m = await registrar();
    relogio = new Date("2026-10-21T01:30:00Z"); // 22:30 de 20/10 em São Paulo
    const r = await criar({ titulo: "  Letreiro da Praia: Mistério!  ", corpo: `  ${TEXTO}  ` }, m.cookie);
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(r.headers.get("location")).toBe("/api/v1/publicacoes/letreiro-da-praia-misterio");
    expect(c).toMatchObject({
      slug: "letreiro-da-praia-misterio",
      titulo: "Letreiro da Praia: Mistério!",
      resumo: TEXTO,
      corpo: TEXTO,
      tipo: "teoria",
      data: "2026-10-20",
      autor: { usuario: m.usuario },
      tags: [],
      termos: [],
      comentarios: 0,
      curtidas: 0,
      euCurti: false,
    });
    const linha = (await banco.pool.query("select criado_em, autor_id from publicacoes where slug = $1", [c.slug])).rows[0];
    expect(linha.autor_id).toBe(m.id);
    expect(new Date(linha.criado_em).toISOString()).toBe("2026-10-21T01:30:00.000Z");
    relogio = new Date("2026-10-20T15:00:00Z");
  });

  it("rejeita campos proibidos no corpo com 422 e nada é gravado", async () => {
    const m = await registrar();
    const antes = (await banco.pool.query("select count(*)::int as n from publicacoes")).rows[0].n;
    for (const extra of [{ tipo: "investigacao" }, { autorId: m.id }, { autor: "outro" }, { status: "oculto" }, { slug: "meu-slug" }, { data: "2020-01-01" }, { tags: ["locais-mapas"] }]) {
      const r = await criar(teoria(extra), m.cookie);
      const c = await r.json();
      expect(r.status).toBe(422);
      expect(c.erro.codigo).toBe("validacao");
      expect(Object.values(c.erro.campos).flat()).toContain("Campo não permitido.");
    }
    expect((await banco.pool.query("select count(*)::int as n from publicacoes")).rows[0].n).toBe(antes);
  });

  it.each([
    ["título curto", { titulo: "ab" }],
    ["título só espaços", { titulo: "     " }],
    ["título longo", { titulo: "a".repeat(121) }],
    ["corpo curto", { corpo: "curto" }],
    ["corpo longo", { corpo: "a".repeat(2001) }],
    ["NUL no corpo", { corpo: `${TEXTO}\u0000` }],
    ["controle no título", { titulo: "Título\u0007 ruim" }],
    ["título não string", { titulo: 123 }],
    ["corpo ausente", { corpo: undefined }],
  ])("422 para %s", async (_n, extra) => {
    const m = await registrar();
    const r = await criar({ ...teoria(), ...extra }, m.cookie);
    expect(r.status).toBe(422);
  });

  it("corpo que não é JSON: 400; tipo de conteúdo errado: 415; grande demais: 413", async () => {
    const m = await registrar();
    expect((await h.criar(req("POST", "/api/v1/publicacoes", { bruto: "{ruim", cookie: m.cookie }), undefined)).status).toBe(400);
    const texto = new Request(`${ORIGEM}/api/v1/publicacoes`, {
      method: "POST",
      headers: { origin: ORIGEM, "x-requested-with": "archives-vi", cookie: m.cookie, "content-type": "text/plain" },
      body: "x",
    });
    expect((await h.criar(texto, undefined)).status).toBe(415);
    expect((await h.criar(req("POST", "/api/v1/publicacoes", { bruto: JSON.stringify({ titulo: "t".repeat(30_000) }), cookie: m.cookie }), undefined)).status).toBe(413);
  });

  it("títulos iguais geram slugs diferentes", async () => {
    const m = await registrar();
    const titulo = `Mesmo título ${unico()}`;
    const a = await (await criar({ titulo, corpo: TEXTO }, m.cookie)).json();
    const b = await (await criar({ titulo, corpo: TEXTO }, m.cookie)).json();
    expect(a.slug).not.toBe(b.slug);
    expect(b.slug.startsWith(a.slug)).toBe(true);
  });

  it("11ª criação no minuto: 429 com Retry-After; outro membro não é afetado; janela renova", async () => {
    const m = await registrar();
    const outro = await registrar();
    for (let i = 0; i < 10; i++) expect((await criar(teoria(), m.cookie)).status).toBe(201);
    const r = await criar(teoria(), m.cookie);
    expect(r.status).toBe(429);
    expect(Number(r.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await criar(teoria(), outro.cookie)).status).toBe(201);
    relogio = new Date(relogio.getTime() + 61_000);
    expect((await criar(teoria(), m.cookie)).status).toBe(201);
  });

  it("concorrência: 20 criações simultâneas do mesmo membro dão exatamente 10 × 201 e 10 × 429", async () => {
    const m = await registrar();
    const antes = (await banco.pool.query("select count(*)::int as n from publicacoes where autor_id = $1", [m.id])).rows[0].n;
    const respostas = await Promise.all(Array.from({ length: 20 }, () => criar(teoria(), m.cookie)));
    const status = respostas.map((r) => r.status);
    expect(status.filter((s) => s === 201)).toHaveLength(10);
    expect(status.filter((s) => s === 429)).toHaveLength(10);
    const depois = (await banco.pool.query("select count(*)::int as n from publicacoes where autor_id = $1", [m.id])).rows[0].n;
    expect(depois - antes).toBe(10);
  });

  it("concorrência: criações simultâneas com o mesmo título terminam com slugs únicos", async () => {
    const m = await registrar();
    const titulo = `Colisão ${unico()}`;
    const respostas = await Promise.all(Array.from({ length: 8 }, () => criar({ titulo, corpo: TEXTO }, m.cookie)));
    expect(respostas.map((r) => r.status)).toEqual(Array(8).fill(201));
    const slugs = await Promise.all(respostas.map(async (r) => (await r.json()).slug));
    expect(new Set(slugs).size).toBe(8);
  });
});

describe("leitura", () => {
  let autorA: string;
  let autorB: string;
  const dados: { id: string; slug: string }[] = [];

  beforeAll(async () => {
    // Banco isolado para a leitura: dados controlados, com empates deliberados de data e de instante.
    await banco.pool.query("truncate publicacao_termos, publicacao_tags, publicacoes cascade");
    const [a, b] = await banco.db
      .insert(usuarios)
      .values([
        { usuario: "autor_a", email: "a@exemplo.com", senhaHash: "x", nome: "Autora A", bio: "bio secreta" },
        { usuario: "autor_b", email: "b@exemplo.com", senhaHash: "x", nome: "Autor B" },
      ])
      .returning();
    autorA = a.id;
    autorB = b.id;

    const base = new Date("2026-10-10T12:00:00.000Z");
    // 12 publicações em 3 dias; dentro de cada dia, 2 pares com o MESMO criado_em (desempate por id).
    const linhas = Array.from({ length: 12 }, (_, i) => {
      const dia = 10 + Math.floor(i / 4);
      const instante = new Date(base.getTime() + Math.floor(i / 2) * 60_000);
      return {
        slug: `item-${String(i).padStart(2, "0")}`,
        titulo: `Item ${i}`,
        resumo: `Resumo ${i}`,
        corpo: i % 3 === 0 ? null : `Corpo ${i}`,
        tipo: (i % 3 === 0 ? "investigacao" : "teoria") as "teoria" | "investigacao",
        autorId: i % 2 === 0 ? autorA : autorB,
        data: `2026-10-${dia}`,
        criadoEm: instante,
        atualizadoEm: instante,
      };
    });
    const criadas = await banco.db.insert(publicacoes).values(linhas).returning();
    dados.push(...criadas.map((c) => ({ id: c.id, slug: c.slug })));
    const porSlug = new Map(criadas.map((c) => [c.slug, c.id]));
    await banco.db.insert(publicacaoTags).values([
      { publicacaoId: porSlug.get("item-00")!, tagId: "locais-mapas" },
      { publicacaoId: porSlug.get("item-00")!, tagId: "ovnis-extraterrestres" },
      { publicacaoId: porSlug.get("item-01")!, tagId: "locais-mapas" },
    ]);
    await banco.db.insert(publicacaoTermos).values([
      { publicacaoId: porSlug.get("item-00")!, ordem: 1, termo: "segundo" },
      { publicacaoId: porSlug.get("item-00")!, ordem: 0, termo: "primeiro" },
    ]);
    // Oculta: nunca aparece.
    await banco.db.insert(publicacoes).values({ slug: "escondida", titulo: "Escondida", resumo: "x", corpo: "x", tipo: "teoria", autorId: autorA, status: "oculto" });
  });

  async function todasAsPaginas(limite: number, query = "") {
    const slugs: string[] = [];
    let cursor: string | null = null;
    let paginas = 0;
    do {
      const q = `?limite=${limite}${query}${cursor ? `&cursor=${cursor}` : ""}`;
      const r = await listar(q);
      expect(r.status).toBe(200);
      const c = await r.json();
      slugs.push(...c.itens.map((i: { slug: string }) => i.slug));
      cursor = c.proximoCursor;
      paginas += 1;
      expect(paginas).toBeLessThan(50);
    } while (cursor);
    return { slugs, paginas };
  }

  it("ordena por data, criado_em e id decrescentes", async () => {
    const c = await (await listar("?limite=50")).json();
    const slugs: string[] = c.itens.map((i: { slug: string }) => i.slug);
    expect(slugs).toHaveLength(12);
    expect(slugs).not.toContain("escondida");
    const datas = c.itens.map((i: { data: string }) => i.data);
    expect(datas).toEqual([...datas].sort().reverse());
    const esperado = (
      await banco.pool.query("select slug from publicacoes where status = 'publicado' order by data desc, criado_em desc, id desc")
    ).rows.map((l) => l.slug);
    expect(slugs).toEqual(esperado);
  });

  it("páginas consecutivas não duplicam nem omitem, mesmo com empates (limites 1, 2, 3, 5)", async () => {
    const completo = (await (await listar("?limite=50")).json()).itens.map((i: { slug: string }) => i.slug);
    for (const limite of [1, 2, 3, 5]) {
      const { slugs, paginas } = await todasAsPaginas(limite);
      expect(slugs).toEqual(completo);
      expect(new Set(slugs).size).toBe(12);
      expect(paginas).toBe(Math.ceil(12 / limite));
    }
  });

  it("o cursor traz data, criadoEm com microssegundos (UTC) e id", async () => {
    const c = await (await listar("?limite=2")).json();
    expect(c.proximoCursor).toBeTruthy();
    const interno = JSON.parse(Buffer.from(c.proximoCursor, "base64url").toString("utf8"));
    expect(Object.keys(interno).sort()).toEqual(["criadoEm", "data", "id"]);
    expect(interno.criadoEm).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/);
  });

  it("uma inserção nova durante a paginação não duplica nem omite itens já previstos", async () => {
    const primeira = await (await listar("?limite=4")).json();
    const vistos: string[] = primeira.itens.map((i: { slug: string }) => i.slug);
    await banco.db.insert(publicacoes).values({ slug: "recem-chegada", titulo: "Recém chegada", resumo: "x", corpo: "x", tipo: "teoria", autorId: autorA, data: "2026-12-01" });
    let cursor: string | null = primeira.proximoCursor;
    while (cursor) {
      const c = await (await listar(`?limite=4&cursor=${cursor}`)).json();
      vistos.push(...c.itens.map((i: { slug: string }) => i.slug));
      cursor = c.proximoCursor;
    }
    expect(new Set(vistos).size).toBe(vistos.length);
    expect(vistos).toHaveLength(12);
    await banco.pool.query("delete from publicacoes where slug = 'recem-chegada'");
  });

  it("filtros: tipo, tag, autor e combinações", async () => {
    const teorias = await (await listar("?tipo=teoria&limite=50")).json();
    expect(teorias.itens.every((i: { tipo: string }) => i.tipo === "teoria")).toBe(true);
    expect(teorias.itens).toHaveLength(8);

    const mapas = await (await listar("?tag=locais-mapas&limite=50")).json();
    expect(mapas.itens.map((i: { slug: string }) => i.slug).sort()).toEqual(["item-00", "item-01"]);

    const deB = await (await listar("?autor=autor_b&limite=50")).json();
    expect(deB.itens).toHaveLength(6);
    expect(deB.itens.every((i: { autor: { usuario: string } }) => i.autor.usuario === "autor_b")).toBe(true);

    const comb = await (await listar("?autor=AUTOR_A&tipo=investigacao&limite=50")).json();
    expect(comb.itens.every((i: { tipo: string; autor: { usuario: string } }) => i.tipo === "investigacao" && i.autor.usuario === "autor_a")).toBe(true);

    const nenhum = await (await listar("?autor=ninguem_aqui")).json();
    expect(nenhum).toEqual({ itens: [], proximoCursor: null });
  });

  it("paginação respeita os filtros", async () => {
    const { slugs } = await todasAsPaginas(2, "&tipo=teoria");
    expect(slugs).toHaveLength(8);
    expect(new Set(slugs).size).toBe(8);
  });

  it("parâmetros inválidos: 422 para tipo, tag e limite acima de 50; 400 para cursor adulterado", async () => {
    expect((await listar("?tipo=outro")).status).toBe(422);
    expect((await listar("?tag=nao-existe")).status).toBe(422);
    expect((await listar("?limite=51")).status).toBe(422);
    expect((await listar("?limite=0")).status).toBe(422);
    expect((await listar("?cursor=%%%")).status).toBe(400);
    const falso = Buffer.from(JSON.stringify({ data: "2026-02-31", criadoEm: "2026-10-10T12:00:00.000000Z", id: dados[0].id })).toString("base64url");
    const r = await listar(`?cursor=${falso}`);
    expect(r.status).toBe(400);
    const extra = Buffer.from(JSON.stringify({ data: "2026-10-10", criadoEm: "2026-10-10T12:00:00Z", id: dados[0].id, x: 1 })).toString("base64url");
    expect((await listar(`?cursor=${extra}`)).status).toBe(400);
  });

  it("detalhe devolve o contrato público: temas em ordem do catálogo, termos por ordem, sem dados sensíveis", async () => {
    const r = await detalhe("item-00");
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c.tags).toEqual(["ovnis-extraterrestres", "locais-mapas"]);
    expect(c.termos).toEqual(["primeiro", "segundo"]);
    expect(c.corpo).toBeNull();
    expect(c.autor).toEqual({ nome: "Autora A", usuario: "autor_a" });
    const texto = JSON.stringify(c);
    for (const proibido of ["email", "senha", "hash", "bio", "a@exemplo.com", "autorId", "status", "criadoEm"]) {
      expect(texto).not.toContain(proibido);
    }
    expect(Object.keys(c).sort()).toEqual(["autor", "comentarios", "corpo", "curtidas", "data", "euCurti", "id", "imagem", "resumo", "slug", "tags", "termos", "tipo", "titulo"]);
  });

  it("a listagem também não expõe campos fora do contrato", async () => {
    const c = await (await listar("?limite=50")).json();
    const texto = JSON.stringify(c);
    for (const proibido of ["a@exemplo.com", "senha", "bio secreta"]) expect(texto).not.toContain(proibido);
  });

  it("inexistente, oculta e slug malformado dão o mesmo 404", async () => {
    const respostas = await Promise.all([detalhe("nao-existe"), detalhe("escondida"), detalhe("Slug Inválido!")]);
    const corpos = await Promise.all(respostas.map((r) => r.json()));
    expect(respostas.map((r) => r.status)).toEqual([404, 404, 404]);
    expect(new Set(corpos.map((c) => `${c.erro.codigo}|${c.erro.mensagem}`)).size).toBe(1);
    expect((await relacionadas("escondida")).status).toBe(404);
    expect((await relacionadas("nao-existe")).status).toBe(404);
  });

  it("relacionadas: mesmo tipo, sem a própria publicação, sem ocultas, respeitando o limite", async () => {
    const r = await relacionadas("item-01");
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(c.itens).toHaveLength(3);
    expect(c.itens.every((i: { slug: string; tipo: string }) => i.slug !== "item-01" && i.tipo === "teoria")).toBe(true);
    expect(c.itens.map((i: { slug: string }) => i.slug)).not.toContain("escondida");
    expect((await (await relacionadas("item-01", "?limite=5")).json()).itens).toHaveLength(5);
    expect((await relacionadas("item-01", "?limite=11")).status).toBe(422);
  });
});
