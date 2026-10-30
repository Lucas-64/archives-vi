import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { investigacaoHistorico, investigacoes, usuarios } from "../db/esquema";
import { criarManipuladoresPublicacoes } from "../publicacoes/rotas";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { criarManipuladoresInvestigacoes } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };
const ORIGEM = "http://localhost:3000";

let banco: BancoDeTeste;
let relogio = new Date("2026-10-20T15:00:00Z");
const avancar = (ms = 1000) => {
  relogio = new Date(relogio.getTime() + ms);
};
let auth: ReturnType<typeof criarManipuladoresAuth>;
let pubs: ReturnType<typeof criarManipuladoresPublicacoes>;
let h: ReturnType<typeof criarManipuladoresInvestigacoes>;
let seq = 0;
const unico = () => `v${++seq}`;

type OpReq = { corpo?: unknown; bruto?: string; cookie?: string; semCsrf?: boolean; origem?: string };
function req(metodo: string, caminho: string, o: OpReq = {}) {
  const cab: Record<string, string> = { "x-forwarded-for": `10.3.0.${++seq}`, origin: o.origem ?? ORIGEM };
  if (!o.semCsrf) cab["x-requested-with"] = "archives-vi";
  if (o.cookie) cab.cookie = o.cookie;
  let body: string | undefined;
  if (o.bruto !== undefined) body = o.bruto;
  else if (o.corpo !== undefined) body = JSON.stringify(o.corpo);
  if (body !== undefined) cab["content-type"] = "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cab, body });
}
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });

const criar = (corpo: unknown, cookie?: string, extra: OpReq = {}) => h.criar(req("POST", "/api/v1/investigacoes", { corpo, cookie, ...extra }), undefined);
const editar = (slug: string, corpo: unknown, cookie?: string) => h.editar(req("PATCH", `/api/v1/investigacoes/${slug}`, { corpo, cookie }), ctx(slug));
const estado = (slug: string, corpo: unknown, cookie?: string) => h.mudarEstado(req("PATCH", `/api/v1/investigacoes/${slug}/estado`, { corpo, cookie }), ctx(slug));
const encerrar = (slug: string, cookie?: string) => h.encerrar(req("POST", `/api/v1/investigacoes/${slug}/encerrar`, { cookie }), ctx(slug));
const detalhe = (slug: string, cookie?: string) => h.detalhe(req("GET", `/api/v1/investigacoes/${slug}`, { cookie }), ctx(slug));
const listar = (q = "", cookie?: string) => h.listar(req("GET", `/api/v1/investigacoes${q}`, { cookie }), undefined);
const historico = (slug: string, q = "") => h.historico(req("GET", `/api/v1/investigacoes/${slug}/historico${q}`), ctx(slug));

const nova = (extra: Record<string, unknown> = {}) => ({
  titulo: `Investigação ${unico()}`,
  descricao: "Descrição com mais de vinte caracteres, para passar na validação.",
  categoria: "symbol",
  teoria: {
    hipotese: "Hipótese com mais de vinte caracteres, para passar na validação.",
    argumentosFavoraveis: ["Primeiro argumento", "Segundo argumento"],
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
  return { cookie: (r.headers.get("set-cookie") ?? "").split(";")[0], usuario: `membro_${id}`, email: `${id}@exemplo.com`, id: c.usuario.id as string };
}
type Membro = Awaited<ReturnType<typeof registrar>>;

async function abrir(m: Membro, extra: Record<string, unknown> = {}) {
  const r = await criar(nova(extra), m.cookie);
  expect(r.status).toBe(201);
  return (await r.json()) as { slug: string; id: string };
}
const linhasHistorico = async (slug: string) =>
  (await banco.pool.query("select h.tipo, h.titulo, h.resumo from investigacao_historico h join investigacoes i on i.id = h.investigacao_id where i.slug=$1 order by h.criado_em, h.id", [slug])).rows;
const linha = async (slug: string) => (await banco.pool.query("select * from investigacoes where slug=$1", [slug])).rows[0];

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  auth = criarManipuladoresAuth({ obterDb: () => banco.db, agora: () => relogio, parametrosSenha: BARATO, producao: false });
  pubs = criarManipuladoresPublicacoes({ obterDb: () => banco.db, agora: () => relogio, producao: false });
  h = criarManipuladoresInvestigacoes({ obterDb: () => banco.db, agora: () => relogio, producao: false });
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("POST /investigacoes", () => {
  it("visitante 401 e nada é gravado; CSRF e origem de outro site 403", async () => {
    const m = await registrar();
    const antes = (await banco.pool.query("select count(*)::int n from investigacoes")).rows[0].n;
    expect((await criar(nova())).status).toBe(401);
    expect((await criar(nova(), m.cookie, { semCsrf: true })).status).toBe(403);
    expect((await criar(nova(), m.cookie, { origem: "http://outro.exemplo" })).status).toBe(403);
    // `imagem` existe, mas só aceita a URL do Blob devolvida pelo envio (ADR-043): URL livre dá 422.
    for (const imagem of ["x.png", "https://exemplo.com/capa.jpg"]) {
      const r = await criar(nova({ imagem }), m.cookie);
      expect(r.status, imagem).toBe(422);
      expect(Object.values((await r.json()).erro.campos).join(" ")).toContain("Envie a imagem pelo campo de upload.");
    }
    expect((await banco.pool.query("select count(*)::int n from investigacoes")).rows[0].n).toBe(antes);
  });

  it("membro cria: 201, autor da sessão, status investigating, estado em_andamento, sem campos inventados", async () => {
    const m = await registrar();
    const r = await criar(nova({ titulo: "  Luzes sobre a Praia  ", localizacao: "Vice Beach", tags: ["ovnis-extraterrestres", "locais-mapas"], video: { url: "https://youtu.be/dQw4w9WgXcQ", titulo: "Trailer" } }), m.cookie);
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(r.headers.get("location")).toBe("/api/v1/investigacoes/luzes-sobre-a-praia");
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c).toMatchObject({
      slug: "luzes-sobre-a-praia",
      titulo: "Luzes sobre a Praia",
      imagem: null,
      status: "investigating",
      estado: "em_andamento",
      encerradaPeloAutor: false,
      categoria: "symbol",
      localizacao: "Vice Beach",
      tags: ["ovnis-extraterrestres", "locais-mapas"],
      video: { url: "https://youtu.be/dQw4w9WgXcQ", titulo: "Trailer" },
      possuiDetalhe: true,
      autor: { usuario: m.usuario },
      criadoEm: relogio.toISOString(),
      atualizadoEm: relogio.toISOString(),
      contagemEvidencias: 0,
      contagens: { revisoes: 0, evidencias: 0 },
      permissoes: { podeGerenciar: true, podeSugerirEvidencia: true, podeModerar: false },
    });
    // D-D: nada que dependa de tabelas inexistentes.
    for (const ausente of ["sintese", "evidencias", "participantes", "comentarios"]) expect(c).not.toHaveProperty(ausente);
    // Task 7 (D-K): os campos que dependiam da tabela de evidências agora existem; os demais seguem omitidos.
    expect(c.permissoes).not.toHaveProperty("podeComentar");
    expect(c.contagens).not.toHaveProperty("participantes");
    expect(c.contagens).not.toHaveProperty("comentarios");
    expect((await linha(c.slug)).autor_id).toBe(m.id);
    expect(await linhasHistorico(c.slug)).toMatchObject([{ tipo: "criada", titulo: "Investigação criada" }]);
  });

  it("recusa campos proibidos (422) sem gravar", async () => {
    const m = await registrar();
    const antes = (await banco.pool.query("select count(*)::int n from investigacoes")).rows[0].n;
    for (const extra of [{ status: "confirmed" }, { estado: "contestada" }, { autor: "outro" }, { autorId: m.id }, { slug: "meu-slug" }, { encerradaPeloAutor: true }, { permissoes: { podeGerenciar: true } }]) {
      const r = await criar(nova(extra), m.cookie);
      expect(r.status, JSON.stringify(extra)).toBe(422);
      expect(Object.values((await r.json()).erro.campos).join(" ")).toContain("Campo não permitido.");
    }
    expect((await banco.pool.query("select count(*)::int n from investigacoes")).rows[0].n).toBe(antes);
  });

  it.each([
    ["título curto", { titulo: "ab" }],
    ["título só espaços", { titulo: "    " }],
    ["descrição curta", { descricao: "curta" }],
    ["descrição longa", { descricao: "a".repeat(501) }],
    ["categoria inválida", { categoria: "outra" }],
    ["localização longa", { localizacao: "a".repeat(81) }],
    ["tema desconhecido", { tags: ["nao-existe"] }],
    ["temas repetidos", { tags: ["locais-mapas", "locais-mapas"] }],
    ["vídeo que não é do YouTube", { video: { url: "https://exemplo.com/v" } }],
    ["vídeo com campo extra", { video: { url: "https://youtu.be/dQw4w9WgXcQ", x: 1 } }],
    ["teoria ausente", { teoria: undefined }],
    ["hipótese curta", { teoria: { hipotese: "curta", argumentosFavoraveis: [], perguntaCentral: "Pergunta?", fontes: [] } }],
    ["11 fontes", { teoria: { hipotese: "Hipótese com mais de vinte caracteres.", argumentosFavoraveis: [], perguntaCentral: "Pergunta?", fontes: Array(11).fill("f") } }],
    ["fonte vazia", { teoria: { hipotese: "Hipótese com mais de vinte caracteres.", argumentosFavoraveis: [], perguntaCentral: "Pergunta?", fontes: [""] } }],
    ["NUL na hipótese", { teoria: { hipotese: "Hipótese com mais de vinte\u0000 caracteres.", argumentosFavoraveis: [], perguntaCentral: "Pergunta?", fontes: [] } }],
    ["campo extra na teoria", { teoria: { hipotese: "Hipótese com mais de vinte caracteres.", argumentosFavoraveis: [], perguntaCentral: "Pergunta?", fontes: [], extra: 1 } }],
  ])("422 para %s", async (_n, extra) => {
    const m = await registrar();
    expect((await criar({ ...nova(), ...extra }, m.cookie)).status).toBe(422);
  });

  it("corpo que não é JSON 400; texto puro 415; grande demais 413", async () => {
    const m = await registrar();
    expect((await h.criar(req("POST", "/api/v1/investigacoes", { bruto: "{ruim", cookie: m.cookie }), undefined)).status).toBe(400);
    expect((await h.criar(req("POST", "/api/v1/investigacoes", { bruto: JSON.stringify({ titulo: "t".repeat(40_000) }), cookie: m.cookie }), undefined)).status).toBe(413);
  });

  it("slug: colisão com outra investigação e com publicação ganha sufixo; a regra é a mesma das publicações", async () => {
    const m = await registrar();
    const titulo = `Rótulo comum ${unico()}`;
    const a = await (await criar(nova({ titulo }), m.cookie)).json();
    const m2 = await registrar();
    const b = await (await criar(nova({ titulo }), m2.cookie)).json();
    expect(b.slug).not.toBe(a.slug);
    expect(b.slug).toMatch(new RegExp(`^${a.slug}-[0-9a-f]{8}$`));

    // Investigação primeiro, publicação depois: a publicação desvia do slug já ocupado.
    const m3 = await registrar();
    const t2 = `Mesmo título entre tipos ${unico()}`;
    const inv = await (await criar(nova({ titulo: t2 }), m3.cookie)).json();
    const pub = await (await pubs.criar(req("POST", "/api/v1/publicacoes", { corpo: { titulo: t2, corpo: "Texto com mais de vinte caracteres, ok." }, cookie: m3.cookie }), undefined)).json();
    expect(pub.slug).not.toBe(inv.slug);
    expect(pub.slug.startsWith(inv.slug)).toBe(true);

    // Publicação primeiro, investigação depois: a investigação desvia.
    const m4 = await registrar();
    const t3 = `Publicação veio antes ${unico()}`;
    const pub2 = await (await pubs.criar(req("POST", "/api/v1/publicacoes", { corpo: { titulo: t3, corpo: "Texto com mais de vinte caracteres, ok." }, cookie: m4.cookie }), undefined)).json();
    const inv2 = await (await criar(nova({ titulo: t3 }), m4.cookie)).json();
    expect(inv2.slug).not.toBe(pub2.slug);
    const conjunto = (await banco.pool.query("select slug from publicacoes union all select slug from investigacoes")).rows.map((r) => r.slug);
    expect(new Set(conjunto).size).toBe(conjunto.length);
  });

  it("slugs únicos quando uma publicação e uma investigação com o mesmo título são criadas ao mesmo tempo", async () => {
    const m = await registrar();
    const m2 = await registrar();
    const titulo = `Corrida entre tipos ${unico()}`;
    const [ri, rp] = await Promise.all([
      criar(nova({ titulo }), m.cookie),
      pubs.criar(req("POST", "/api/v1/publicacoes", { corpo: { titulo, corpo: "Texto com mais de vinte caracteres, ok." }, cookie: m2.cookie }), undefined),
    ]);
    expect([ri.status, rp.status]).toEqual([201, 201]);
    expect((await ri.json()).slug).not.toBe((await rp.json()).slug);
  });
});

describe("limite de 3 investigações abertas", () => {
  it("a 4ª aberta dá 409; encerrar libera uma vaga; outro membro não é afetado", async () => {
    const m = await registrar();
    const outro = await registrar();
    const abertas = [];
    for (let i = 0; i < 3; i++) abertas.push(await abrir(m));
    const r = await criar(nova(), m.cookie);
    expect(r.status).toBe(409);
    expect((await r.json()).erro.codigo).toBe("conflito");
    expect((await criar(nova(), outro.cookie)).status).toBe(201);
    expect((await encerrar(abertas[0].slug, m.cookie)).status).toBe(200);
    expect((await criar(nova(), m.cookie)).status).toBe(201);
    expect((await criar(nova(), m.cookie)).status).toBe(409);
  });

  it("concorrência: 10 criações simultâneas do mesmo membro dão exatamente 3 × 201 e 7 × 409", async () => {
    const m = await registrar();
    const respostas = await Promise.all(Array.from({ length: 10 }, () => criar(nova(), m.cookie)));
    const status = respostas.map((r) => r.status);
    expect(status.filter((s) => s === 201)).toHaveLength(3);
    expect(status.filter((s) => s === 409)).toHaveLength(7);
    expect((await banco.pool.query("select count(*)::int n from investigacoes where autor_id=$1", [m.id])).rows[0].n).toBe(3);
    // Sem registro de histórico órfão: um por investigação criada.
    expect((await banco.pool.query("select count(*)::int n from investigacao_historico where autor_id=$1", [m.id])).rows[0].n).toBe(3);
  });

  it("concorrência: vários membros criando ao mesmo tempo não interferem entre si", async () => {
    const membros = await Promise.all(Array.from({ length: 4 }, () => registrar()));
    const respostas = await Promise.all(membros.flatMap((m) => Array.from({ length: 5 }, () => criar(nova(), m.cookie))));
    for (const m of membros) {
      expect((await banco.pool.query("select count(*)::int n from investigacoes where autor_id=$1", [m.id])).rows[0].n).toBe(3);
    }
    expect(respostas.filter((r) => r.status === 201)).toHaveLength(12);
    expect(respostas.filter((r) => r.status === 409)).toHaveLength(8);
  });
});

describe("leitura", () => {
  let dono: Membro;
  let outro: Membro;
  const slugs: string[] = [];

  beforeAll(async () => {
    await banco.pool.query("truncate investigacao_historico, investigacao_tags, investigacoes cascade");
    dono = await registrar();
    outro = await registrar();
    // 9 investigações com atualizado_em em grupos de 3 IGUAIS (empate), criadas direto no banco.
    const base = new Date("2026-10-10T12:00:00.000Z");
    const categorias = ["sighting", "location", "symbol"] as const;
    const linhas = Array.from({ length: 9 }, (_, i) => ({
      slug: `lista-${i}`,
      titulo: `Lista ${i}`,
      descricao: "Descrição com mais de vinte caracteres.",
      categoria: categorias[i % 3],
      hipotese: "Hipótese com mais de vinte caracteres.",
      perguntaCentral: "Pergunta?",
      autorId: i % 2 === 0 ? dono.id : outro.id,
      criadoEm: base,
      atualizadoEm: new Date(base.getTime() + Math.floor(i / 3) * 60_000),
    }));
    const criadas = await banco.db.insert(investigacoes).values(linhas).returning({ slug: investigacoes.slug, id: investigacoes.id });
    slugs.push(...criadas.map((c) => c.slug));
    await banco.pool.query("insert into investigacao_tags (investigacao_id, tag_id) select id, 'locais-mapas' from investigacoes where slug in ('lista-0','lista-1')");
    await banco.pool.query("insert into investigacao_tags (investigacao_id, tag_id) select id, 'ovnis-extraterrestres' from investigacoes where slug = 'lista-0'");
  });

  async function todas(limite: number, q = "") {
    const vistos: string[] = [];
    let cursor: string | null = null;
    do {
      const c = await (await listar(`?limite=${limite}${q}${cursor ? `&cursor=${cursor}` : ""}`)).json();
      vistos.push(...c.itens.map((i: { slug: string }) => i.slug));
      cursor = c.proximoCursor;
    } while (cursor);
    return vistos;
  }

  it("base vazia: lista vazia", async () => {
    await banco.pool.query("begin");
    await banco.pool.query("rollback");
    const b2 = await criarBancoDeTeste();
    try {
      const h2 = criarManipuladoresInvestigacoes({ obterDb: () => b2.db, agora: () => relogio, producao: false });
      const c = await (await h2.listar(req("GET", "/api/v1/investigacoes"), undefined)).json();
      expect(c).toEqual({ itens: [], proximoCursor: null });
    } finally {
      await b2.encerrar();
    }
  });

  it("ordena por atualizado_em e id decrescentes e a paginação não duplica nem omite com empates", async () => {
    const completo = (await (await listar("?limite=50")).json()).itens.map((i: { slug: string }) => i.slug);
    const esperado = (await banco.pool.query("select slug from investigacoes order by atualizado_em desc, id desc")).rows.map((r) => r.slug);
    expect(completo).toEqual(esperado);
    for (const limite of [1, 2, 4]) expect(await todas(limite)).toEqual(esperado);
  });

  it("o cursor traz atualizadoEm com microssegundos e id", async () => {
    const c = await (await listar("?limite=2")).json();
    const interno = JSON.parse(Buffer.from(c.proximoCursor, "base64url").toString("utf8"));
    expect(Object.keys(interno).sort()).toEqual(["atualizadoEm", "id"]);
    expect(interno.atualizadoEm).toMatch(/\.\d{6}Z$/);
  });

  it("filtros de categoria, tag e comDetalhe=true", async () => {
    const cat = await (await listar("?categoria=location&limite=50")).json();
    expect(cat.itens.map((i: { slug: string }) => i.slug).sort()).toEqual(["lista-1", "lista-4", "lista-7"]);
    const tag = await (await listar("?tag=locais-mapas&limite=50")).json();
    expect(tag.itens.map((i: { slug: string }) => i.slug).sort()).toEqual(["lista-0", "lista-1"]);
    const combinado = await (await listar("?tag=locais-mapas&categoria=sighting&limite=50")).json();
    expect(combinado.itens.map((i: { slug: string }) => i.slug)).toEqual(["lista-0"]);
    expect((await (await listar("?comDetalhe=true&limite=50")).json()).itens).toHaveLength(9);
    expect((await listar("?comDetalhe=false")).status).toBe(422);
    expect((await listar("?categoria=nada")).status).toBe(422);
    expect((await listar("?tag=nada")).status).toBe(422);
  });

  it("parâmetros inválidos: limite 51 422, cursor adulterado ou impossível 400", async () => {
    expect((await listar("?limite=51")).status).toBe(422);
    expect((await listar("?cursor=%%%")).status).toBe(400);
    const falso = Buffer.from(JSON.stringify({ atualizadoEm: "2026-02-31T00:00:00Z", id: "00000000-0000-4000-8000-000000000000" })).toString("base64url");
    expect((await listar(`?cursor=${falso}`)).status).toBe(400);
    const extra = Buffer.from(JSON.stringify({ atualizadoEm: "2026-10-10T12:00:00Z", id: "00000000-0000-4000-8000-000000000000", x: 1 })).toString("base64url");
    expect((await listar(`?cursor=${extra}`)).status).toBe(400);
  });

  it("resumo na lista: contrato exato, temas na ordem do catálogo, sem dados privados", async () => {
    const c = await (await listar("?tag=locais-mapas&categoria=sighting")).json();
    const item = c.itens[0];
    expect(item).toMatchObject({ slug: "lista-0", imagem: null, status: "investigating", categoria: "sighting", tags: ["ovnis-extraterrestres", "locais-mapas"], possuiDetalhe: true });
    expect(Object.keys(item).sort()).toEqual(["atualizadoEm", "categoria", "contagemEvidencias", "descricao", "id", "imagem", "possuiDetalhe", "slug", "status", "tags", "titulo"]);
    const texto = JSON.stringify(await (await listar("?limite=50")).json());
    for (const proibido of [dono.email, outro.email, dono.id, outro.id, "senha", "hash", "autor"]) expect(texto).not.toContain(proibido);
  });

  it("detalhe: podeGerenciar só para o responsável; podeSugerirEvidencia para qualquer sessão; podeModerar pelo papel no banco", async () => {
    const eu = async (cookie?: string) => (await (await detalhe("lista-0", cookie)).json()).permissoes;
    expect(await eu(dono.cookie)).toEqual({ podeGerenciar: true, podeSugerirEvidencia: true, podeModerar: false });
    expect(await eu(outro.cookie)).toEqual({ podeGerenciar: false, podeSugerirEvidencia: true, podeModerar: false });
    expect(await eu(undefined)).toEqual({ podeGerenciar: false, podeSugerirEvidencia: false, podeModerar: false });
    expect(await eu("sessao=token-invalido")).toEqual({ podeGerenciar: false, podeSugerirEvidencia: false, podeModerar: false });
    await banco.pool.query("update usuarios set papel='admin' where id=$1", [outro.id]);
    expect(await eu(outro.cookie)).toEqual({ podeGerenciar: false, podeSugerirEvidencia: true, podeModerar: true });
    await banco.pool.query("update usuarios set papel='moderador' where id=$1", [outro.id]);
    expect(await eu(outro.cookie)).toEqual({ podeGerenciar: false, podeSugerirEvidencia: true, podeModerar: true });
    await banco.pool.query("update usuarios set papel='membro' where id=$1", [outro.id]);
    expect(await eu(outro.cookie)).toEqual({ podeGerenciar: false, podeSugerirEvidencia: true, podeModerar: false });
  });

  it("detalhe: contrato, sem dados privados; inexistente e slug malformado dão 404 idêntico", async () => {
    const r = await detalhe("lista-0");
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(c.autor).toEqual({ nome: dono.usuario, usuario: dono.usuario });
    expect(Object.keys(c).sort()).toEqual([
      "atualizadoEm", "autor", "categoria", "contagemEvidencias", "contagens", "criadoEm", "descricao", "encerradaPeloAutor", "estado", "id", "imagem", "permissoes", "possuiDetalhe", "slug", "status", "tags", "teoria", "titulo",
    ]);
    for (const proibido of [dono.email, dono.id, "senha", "hash", "papel"]) expect(JSON.stringify(c)).not.toContain(proibido);
    const respostas = await Promise.all([detalhe("nao-existe"), detalhe("Slug Inválido!")]);
    expect(respostas.map((x) => x.status)).toEqual([404, 404]);
    const corpos = await Promise.all(respostas.map((x) => x.json()));
    expect(new Set(corpos.map((x) => `${x.erro.codigo}|${x.erro.mensagem}`)).size).toBe(1);
    expect((await historico("nao-existe")).status).toBe(404);
  });
});

describe("PATCH /investigacoes/{slug}", () => {
  it("visitante 401, outro membro 403, inexistente 404, moderador/admin 403", async () => {
    const dono = await registrar();
    const outro = await registrar();
    const inv = await abrir(dono);
    expect((await editar(inv.slug, { titulo: "Novo título" })).status).toBe(401);
    expect((await editar(inv.slug, { titulo: "Novo título" }, outro.cookie)).status).toBe(403);
    expect((await editar("nao-existe", { titulo: "Novo título" }, dono.cookie)).status).toBe(404);
    await banco.pool.query("update usuarios set papel='admin' where id=$1", [outro.id]);
    expect((await editar(inv.slug, { titulo: "Novo título" }, outro.cookie)).status).toBe(403);
    expect((await estado(inv.slug, { estado: "contestada" }, outro.cookie)).status).toBe(403);
    expect((await encerrar(inv.slug, outro.cookie)).status).toBe(403);
    expect((await linha(inv.slug)).titulo).not.toBe("Novo título");
    // Papel enviado pelo cliente não conta: o corpo não aceita autor/papel.
    expect((await editar(inv.slug, { titulo: "Novo título", papel: "admin" }, outro.cookie)).status).toBe(422);
  });

  it("edição parcial: slug e status não mudam, atualizadoEm avança, tags e localização/vídeo podem ser trocados e removidos", async () => {
    const m = await registrar();
    const inv = await abrir(m, { localizacao: "Antes", tags: ["locais-mapas"], video: { url: "https://youtu.be/dQw4w9WgXcQ" } });
    avancar(60_000);
    const r = await editar(inv.slug, { titulo: "Título totalmente novo", localizacao: null, video: null, tags: ["simbolos-mensagens", "audio-transmissoes"], categoria: "broadcast" }, m.cookie);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(c).toMatchObject({ slug: inv.slug, titulo: "Título totalmente novo", categoria: "broadcast", status: "investigating", estado: "em_andamento", atualizadoEm: relogio.toISOString() });
    expect(c).not.toHaveProperty("localizacao");
    expect(c).not.toHaveProperty("video");
    expect(c.tags).toEqual(["simbolos-mensagens", "audio-transmissoes"]);
    // Sem mudança na teoria: nenhum histórico novo.
    expect(await linhasHistorico(inv.slug)).toHaveLength(1);
  });

  it("corpo vazio ou só com teoria vazia: 422; campos proibidos: 422 (status, estado, autor, slug, encerradaPeloAutor)", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    for (const corpo of [{}, { teoria: {} }, { status: "confirmed" }, { estado: "contestada" }, { autor: "x" }, { autorId: m.id }, { slug: "outro" }, { encerradaPeloAutor: false }, { titulo: "ab" }, { teoria: { extra: 1 } }, { tags: ["nada"] }]) {
      expect((await editar(inv.slug, corpo, m.cookie)).status, JSON.stringify(corpo)).toBe(422);
    }
    expect((await linha(inv.slug)).status).toBe("investigating");
  });

  it("alteração da teoria grava histórico com os NOMES dos campos, nunca o texto, e conta como revisão", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    avancar();
    const novoTexto = "Texto novíssimo da hipótese, que não pode aparecer no histórico.";
    const c = await (await editar(inv.slug, { teoria: { hipotese: novoTexto, fontes: ["Outra fonte"] } }, m.cookie)).json();
    expect(c.teoria.hipotese).toBe(novoTexto);
    expect(c.contagens).toEqual({ revisoes: 1, evidencias: 0 });
    const hist = await linhasHistorico(inv.slug);
    expect(hist).toHaveLength(2);
    expect(hist[1]).toMatchObject({ tipo: "teoria", titulo: "Teoria atualizada", resumo: "Campos alterados: hipótese, fontes." });
    expect(JSON.stringify(hist)).not.toContain("novíssimo");
  });

  it("reenviar os mesmos valores é no-op: sem histórico novo e sem avançar atualizadoEm", async () => {
    const m = await registrar();
    const inv = await abrir(m, { tags: ["locais-mapas"] });
    const antes = await linha(inv.slug);
    avancar(60_000);
    const igual = nova();
    const r = await editar(inv.slug, { titulo: antes.titulo, descricao: antes.descricao, tags: ["locais-mapas"], teoria: { hipotese: antes.hipotese, argumentosFavoraveis: antes.argumentos_favoraveis, fontes: antes.fontes } }, m.cookie);
    expect(r.status).toBe(200);
    expect(igual).toBeDefined();
    const depois = await linha(inv.slug);
    expect(new Date(depois.atualizado_em).toISOString()).toBe(new Date(antes.atualizado_em).toISOString());
    expect(await linhasHistorico(inv.slug)).toHaveLength(1);
  });

  it("editar continua permitido depois de encerrar (encerrar é só um marcador)", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    await encerrar(inv.slug, m.cookie);
    avancar();
    const r = await editar(inv.slug, { descricao: "Descrição revisada depois de encerrar a investigação." }, m.cookie);
    expect(r.status).toBe(200);
    expect((await r.json()).encerradaPeloAutor).toBe(true);
  });

  it("concorrência: 15 edições simultâneas do mesmo responsável terminam todas em 200 com estado final coerente", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    const titulos = Array.from({ length: 15 }, (_, i) => `Título concorrente ${i}`);
    const respostas = await Promise.all(titulos.map((titulo) => editar(inv.slug, { titulo, teoria: { fontes: [titulo] } }, m.cookie)));
    expect(respostas.map((r) => r.status)).toEqual(Array(15).fill(200));
    const final = await linha(inv.slug);
    expect(titulos).toContain(final.titulo);
    expect(final.fontes).toHaveLength(1);
    const revisoes = (await linhasHistorico(inv.slug)).filter((x) => x.tipo === "teoria").length;
    expect(revisoes).toBeGreaterThanOrEqual(1);
    expect(revisoes).toBeLessThanOrEqual(15);
  });
});

describe("PATCH /investigacoes/{slug}/estado", () => {
  it("o responsável muda entre os 4 estados; status e encerrada não são tocados; cada mudança gera um registro", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    for (const e of ["teoria_apoiada", "contestada", "inconclusiva", "em_andamento"]) {
      avancar();
      const r = await estado(inv.slug, { estado: e }, m.cookie);
      const c = await r.json();
      expect(r.status).toBe(200);
      expect(c).toMatchObject({ estado: e, status: "investigating", encerradaPeloAutor: false });
    }
    const hist = (await linhasHistorico(inv.slug)).filter((x) => x.tipo === "estado");
    expect(hist.map((x) => x.resumo)).toEqual([
      "De em_andamento para teoria_apoiada.",
      "De teoria_apoiada para contestada.",
      "De contestada para inconclusiva.",
      "De inconclusiva para em_andamento.",
    ]);
  });

  it("repetir o estado atual é idempotente: 200, sem histórico novo e sem avançar atualizadoEm", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    await estado(inv.slug, { estado: "contestada" }, m.cookie);
    const antes = await linha(inv.slug);
    avancar(60_000);
    const r = await estado(inv.slug, { estado: "contestada" }, m.cookie);
    expect(r.status).toBe(200);
    expect((await linhasHistorico(inv.slug)).filter((x) => x.tipo === "estado")).toHaveLength(1);
    expect(new Date((await linha(inv.slug)).atualizado_em).toISOString()).toBe(new Date(antes.atualizado_em).toISOString());
  });

  it("valores inválidos 422 (inclusive status), campos extras 422, visitante 401, outro membro 403, inexistente 404", async () => {
    const m = await registrar();
    const outro = await registrar();
    const inv = await abrir(m);
    for (const corpo of [{ estado: "confirmed" }, { estado: "investigating" }, { estado: 1 }, {}, { estado: "contestada", status: "debunked" }]) {
      expect((await estado(inv.slug, corpo, m.cookie)).status, JSON.stringify(corpo)).toBe(422);
    }
    expect((await estado(inv.slug, { estado: "contestada" })).status).toBe(401);
    expect((await estado(inv.slug, { estado: "contestada" }, outro.cookie)).status).toBe(403);
    expect((await estado("nao-existe", { estado: "contestada" }, m.cookie)).status).toBe(404);
    expect((await linha(inv.slug)).estado).toBe("em_andamento");
  });

  it("concorrência: 12 mudanças simultâneas deixam um estado válido e um registro por transição realmente feita", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    const alvos = ["teoria_apoiada", "contestada", "inconclusiva"];
    const respostas = await Promise.all(Array.from({ length: 12 }, (_, i) => estado(inv.slug, { estado: alvos[i % 3] }, m.cookie)));
    expect(respostas.map((r) => r.status)).toEqual(Array(12).fill(200));
    const hist = (await linhasHistorico(inv.slug)).filter((x) => x.tipo === "estado");
    expect(hist.length).toBeGreaterThanOrEqual(1);
    // Todos os registros têm o mesmo instante (relógio congelado no teste), então a ordem entre eles não é
    // observável. Os registros "De X para Y" precisam, mesmo assim, formar um caminho contínuo de
    // em_andamento até o estado final: em cada estado, saídas menos entradas = (é o início) - (é o fim).
    const saldo = new Map<string, number>();
    for (const reg of hist) {
      const [, de, para] = /^De (\w+) para (\w+)\.$/.exec(reg.resumo)!;
      expect(de).not.toBe(para);
      saldo.set(de, (saldo.get(de) ?? 0) + 1);
      saldo.set(para, (saldo.get(para) ?? 0) - 1);
    }
    const atual = (await linha(inv.slug)).estado as string;
    for (const e of ["em_andamento", "teoria_apoiada", "contestada", "inconclusiva"]) {
      expect(saldo.get(e) ?? 0, `saldo de ${e}`).toBe((e === "em_andamento" ? 1 : 0) - (e === atual ? 1 : 0));
    }
  });
});

describe("POST /investigacoes/{slug}/encerrar", () => {
  it("encerra: só encerradaPeloAutor muda (status e estado intactos), 1 registro de histórico, 200", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    await estado(inv.slug, { estado: "teoria_apoiada" }, m.cookie);
    const antes = await linha(inv.slug);
    avancar(60_000);
    const r = await encerrar(inv.slug, m.cookie);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(c).toMatchObject({ encerradaPeloAutor: true, status: "investigating", estado: "teoria_apoiada", atualizadoEm: relogio.toISOString() });
    const depois = await linha(inv.slug);
    for (const campo of ["status", "estado", "titulo", "hipotese", "categoria"]) expect(depois[campo]).toEqual(antes[campo]);
    const hist = (await linhasHistorico(inv.slug)).filter((x) => x.tipo === "encerrada");
    expect(hist).toHaveLength(1);
    expect(hist[0].resumo).toContain("não confirma nem refuta");
  });

  it("chamadas repetidas são idempotentes: 200, sem histórico duplicado, sem mudar atualizadoEm, sem reabrir", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    await encerrar(inv.slug, m.cookie);
    const antes = await linha(inv.slug);
    avancar(60_000);
    for (let i = 0; i < 3; i++) {
      const r = await encerrar(inv.slug, m.cookie);
      expect(r.status).toBe(200);
      expect((await r.json()).encerradaPeloAutor).toBe(true);
    }
    expect((await linhasHistorico(inv.slug)).filter((x) => x.tipo === "encerrada")).toHaveLength(1);
    expect(new Date((await linha(inv.slug)).atualizado_em).toISOString()).toBe(new Date(antes.atualizado_em).toISOString());
    // Nenhum caminho da API reabre: o corpo de edição recusa o campo e a mudança de estado não o toca.
    expect((await editar(inv.slug, { encerradaPeloAutor: false }, m.cookie)).status).toBe(422);
    await estado(inv.slug, { estado: "contestada" }, m.cookie);
    expect((await linha(inv.slug)).encerrada_pelo_autor).toBe(true);
  });

  it("concorrência: 10 encerramentos simultâneos geram um único registro de histórico", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    const respostas = await Promise.all(Array.from({ length: 10 }, () => encerrar(inv.slug, m.cookie)));
    expect(respostas.map((r) => r.status)).toEqual(Array(10).fill(200));
    expect((await linhasHistorico(inv.slug)).filter((x) => x.tipo === "encerrada")).toHaveLength(1);
  });

  it("visitante 401, CSRF 403, outro membro 403, inexistente 404", async () => {
    const m = await registrar();
    const outro = await registrar();
    const inv = await abrir(m);
    expect((await encerrar(inv.slug)).status).toBe(401);
    expect((await h.encerrar(req("POST", `/api/v1/investigacoes/${inv.slug}/encerrar`, { cookie: m.cookie, semCsrf: true }), ctx(inv.slug))).status).toBe(403);
    expect((await encerrar(inv.slug, outro.cookie)).status).toBe(403);
    expect((await encerrar("nao-existe", m.cookie)).status).toBe(404);
    expect((await linha(inv.slug)).encerrada_pelo_autor).toBe(false);
  });
});

describe("histórico e limite de mutações", () => {
  it("GET histórico: público, mais recente primeiro, paginado sem duplicar, sem texto da teoria nem dados privados", async () => {
    const m = await registrar();
    const inv = await abrir(m);
    avancar(); await editar(inv.slug, { teoria: { hipotese: "Hipótese revisada com mais de vinte caracteres." } }, m.cookie);
    avancar(); await estado(inv.slug, { estado: "contestada" }, m.cookie);
    avancar(); await encerrar(inv.slug, m.cookie);
    const r = await historico(inv.slug);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(c.itens.map((i: { titulo: string }) => i.titulo)).toEqual(["Investigação encerrada pelo autor", "Estado alterado", "Teoria atualizada", "Investigação criada"]);
    expect(Object.keys(c.itens[0]).sort()).toEqual(["autor", "data", "id", "resumo", "titulo"]);
    expect(c.itens[0].autor).toEqual({ nome: m.usuario, usuario: m.usuario });
    expect(JSON.stringify(c)).not.toContain("revisada");
    for (const proibido of [m.email, m.id, "senha", "hash"]) expect(JSON.stringify(c)).not.toContain(proibido);
    const vistos: string[] = [];
    let cursor: string | null = null;
    do {
      const p = await (await historico(inv.slug, `?limite=1${cursor ? `&cursor=${cursor}` : ""}`)).json();
      vistos.push(...p.itens.map((i: { id: string }) => i.id));
      cursor = p.proximoCursor;
    } while (cursor);
    expect(vistos).toEqual(c.itens.map((i: { id: string }) => i.id));
    expect((await historico(inv.slug, "?limite=51")).status).toBe(422);
    expect((await historico(inv.slug, "?cursor=%%%")).status).toBe(400);
  });

  it("limite de 20 mutações por minuto por membro, inclusive sob concorrência", async () => {
    const m = await registrar();
    const inv = await abrir(m); // 1 mutação
    const alvos = ["teoria_apoiada", "contestada"];
    const respostas = await Promise.all(Array.from({ length: 24 }, (_, i) => estado(inv.slug, { estado: alvos[i % 2] }, m.cookie)));
    const status = respostas.map((r) => r.status);
    expect(status.filter((s) => s === 200)).toHaveLength(19);
    expect(status.filter((s) => s === 429)).toHaveLength(5);
    expect(Number(respostas.find((r) => r.status === 429)!.headers.get("retry-after"))).toBeGreaterThan(0);
    avancar(61_000);
  });

  it("nenhum caminho altera status: ele permanece 'investigating' em todas as investigações criadas", async () => {
    const { rows } = await banco.pool.query("select distinct status from investigacoes");
    expect(rows).toEqual([{ status: "investigating" }]);
    expect((await banco.pool.query("select count(*)::int n from investigacao_historico")).rows[0].n).toBeGreaterThan(0);
    expect(investigacaoHistorico).toBeDefined();
    expect(usuarios).toBeDefined();
  });
});
