import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { comentarios, curtidas, publicacoes, usuarios } from "../db/esquema";
import { codigoPg, criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { criarManipuladoresPublicacoes } from "./rotas";
import { criarManipuladoresInteracoes } from "./rotasInteracoes";

const BARATO = { N: 1024, r: 8, p: 1 };
const ORIGEM = "http://localhost:3000";

let banco: BancoDeTeste;
let relogio = new Date("2026-10-20T15:00:00Z");
let auth: ReturnType<typeof criarManipuladoresAuth>;
let pubs: ReturnType<typeof criarManipuladoresPublicacoes>;
let h: ReturnType<typeof criarManipuladoresInteracoes>;
let seq = 0;
const unico = () => `i${++seq}`;

function req(metodo: string, caminho: string, o: { corpo?: unknown; bruto?: string; cookie?: string; semCsrf?: boolean; origem?: string } = {}) {
  const cab: Record<string, string> = { "x-forwarded-for": `10.2.0.${++seq}`, origin: o.origem ?? ORIGEM };
  if (!o.semCsrf) cab["x-requested-with"] = "archives-vi";
  if (o.cookie) cab.cookie = o.cookie;
  let body: string | undefined;
  if (o.bruto !== undefined) body = o.bruto;
  else if (o.corpo !== undefined) body = JSON.stringify(o.corpo);
  if (body !== undefined) cab["content-type"] = "application/json";
  return new Request(`${ORIGEM}${caminho}`, { method: metodo, headers: cab, body });
}
const contexto = (slug: string) => ({ params: Promise.resolve({ slug }) });

const listarC = (alvo: string | null, query = "") =>
  h.listarComentarios(req("GET", `/api/v1/comentarios?${alvo === null ? "" : `alvo=${encodeURIComponent(alvo)}`}${query}`), undefined);
const comentar = (corpo: unknown, cookie?: string, extra: Parameters<typeof req>[2] = {}) =>
  h.criarComentario(req("POST", "/api/v1/comentarios", { corpo, cookie, ...extra }), undefined);
const curtir = (slug: string, cookie?: string, extra: Parameters<typeof req>[2] = {}) =>
  h.curtir(req("PUT", `/api/v1/publicacoes/${slug}/curtida`, { cookie, ...extra }), contexto(slug));
const descurtir = (slug: string, cookie?: string) =>
  h.descurtir(req("DELETE", `/api/v1/publicacoes/${slug}/curtida`, { cookie }), contexto(slug));
const detalhe = (slug: string, cookie?: string) =>
  pubs.detalhe(req("GET", `/api/v1/publicacoes/${slug}`, { cookie }), contexto(slug));
const listarP = (query = "", cookie?: string) => pubs.listar(req("GET", `/api/v1/publicacoes${query}`, { cookie }), undefined);

async function registrar() {
  const id = unico();
  const r = await auth.cadastro(
    req("POST", "/api/v1/auth/cadastro", { corpo: { usuario: `membro_${id}`, email: `${id}@exemplo.com`, senha: "senha-de-teste-1" } }),
    undefined,
  );
  expect(r.status).toBe(201);
  return { cookie: (r.headers.get("set-cookie") ?? "").split(";")[0], usuario: `membro_${id}`, email: `${id}@exemplo.com`, id: (await r.json()).usuario.id as string };
}

let autorId: string;
async function novaPublicacao(sobrescrever: Partial<typeof publicacoes.$inferInsert> = {}) {
  const slug = sobrescrever.slug ?? `pub-${unico()}`;
  await banco.db.insert(publicacoes).values({ slug, titulo: `Título ${slug}`, resumo: "r", corpo: "c", tipo: "teoria", autorId, ...sobrescrever });
  return slug;
}

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  auth = criarManipuladoresAuth({ obterDb: () => banco.db, agora: () => relogio, parametrosSenha: BARATO, producao: false });
  pubs = criarManipuladoresPublicacoes({ obterDb: () => banco.db, agora: () => relogio, producao: false });
  h = criarManipuladoresInteracoes({ obterDb: () => banco.db, agora: () => relogio, producao: false });
  const [a] = await banco.db.insert(usuarios).values({ usuario: "dono", email: "dono@exemplo.com", senhaHash: "x", nome: "Dono", bio: "bio secreta" }).returning();
  autorId = a.id;
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("esquema 0003", () => {
  it("curtida duplicada é impossível no banco (23505) e comentário vazio ou enorme é recusado (23514)", async () => {
    const slug = await novaPublicacao();
    const pid: string = (await banco.pool.query("select id from publicacoes where slug=$1", [slug])).rows[0].id;
    await banco.db.insert(curtidas).values({ publicacaoId: pid, usuarioId: autorId });
    await expect(banco.db.insert(curtidas).values({ publicacaoId: pid, usuarioId: autorId })).rejects.toSatisfy((e) => codigoPg(e) === "23505");
    await expect(banco.db.insert(comentarios).values({ publicacaoId: pid, autorId, texto: "" })).rejects.toSatisfy((e) => codigoPg(e) === "23514");
    await expect(banco.db.insert(comentarios).values({ publicacaoId: pid, autorId, texto: "a".repeat(2001) })).rejects.toSatisfy((e) => codigoPg(e) === "23514");
  });

  it("apagar a publicação apaga seus comentários e curtidas (CASCADE)", async () => {
    const slug = await novaPublicacao();
    const id = (await banco.pool.query("select id from publicacoes where slug=$1", [slug])).rows[0].id;
    await banco.db.insert(comentarios).values({ publicacaoId: id, autorId, texto: "oi" });
    await banco.db.insert(curtidas).values({ publicacaoId: id, usuarioId: autorId });
    await banco.pool.query("delete from publicacoes where id=$1", [id]);
    expect((await banco.pool.query("select 1 from comentarios where publicacao_id=$1", [id])).rowCount).toBe(0);
    expect((await banco.pool.query("select 1 from curtidas where publicacao_id=$1", [id])).rowCount).toBe(0);
  });
});

describe("comentários", () => {
  it("visitante não cria (401) e nada é gravado", async () => {
    const slug = await novaPublicacao();
    const antes = (await banco.pool.query("select count(*)::int n from comentarios")).rows[0].n;
    expect((await comentar({ alvo: `publicacao:${slug}`, texto: "olá" })).status).toBe(401);
    expect((await banco.pool.query("select count(*)::int n from comentarios")).rows[0].n).toBe(antes);
  });

  it("sem CSRF ou com origem de outro site: 403", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    expect((await comentar({ alvo: `publicacao:${slug}`, texto: "olá" }, m.cookie, { semCsrf: true })).status).toBe(403);
    expect((await comentar({ alvo: `publicacao:${slug}`, texto: "olá" }, m.cookie, { origem: "http://outro.exemplo" })).status).toBe(403);
  });

  it("membro comenta: 201, autor da sessão, vinculado à publicação certa, texto aparado", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const outra = await novaPublicacao();
    const r = await comentar({ alvo: `publicacao:${slug}`, texto: "  Ótima teoria!  " }, m.cookie);
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(c).toMatchObject({ texto: "Ótima teoria!", autor: { usuario: m.usuario }, criadoEm: relogio.toISOString() });
    expect(Object.keys(c).sort()).toEqual(["autor", "criadoEm", "id", "texto"]);
    const linha = (await banco.pool.query("select c.autor_id, p.slug from comentarios c join publicacoes p on p.id = c.publicacao_id where c.id = $1", [c.id])).rows[0];
    expect(linha).toEqual({ autor_id: m.id, slug });
    expect((await (await listarC(`publicacao:${outra}`)).json()).itens).toHaveLength(0);
  });

  it("rejeita entradas inválidas com 422 e campos proibidos (autor, respostaA)", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const alvo = `publicacao:${slug}`;
    const antes = (await banco.pool.query("select count(*)::int n from comentarios")).rows[0].n;
    const casos: unknown[] = [
      { alvo, texto: "" },
      { alvo, texto: "   " },
      { alvo, texto: "a".repeat(2001) },
      { alvo, texto: "x\u0000y" },
      { alvo, texto: 5 },
      { alvo },
      { texto: "sem alvo" },
      { alvo: "investigacao:algo", texto: "oi" },
      { alvo: "evidencia:abc", texto: "oi" },
      { alvo: "publicacao:Slug Inválido", texto: "oi" },
      { alvo: slug, texto: "oi" },
      { alvo, texto: "oi", autorId: m.id },
      { alvo, texto: "oi", autor: "outro" },
      { alvo, texto: "oi", respostaA: "algum-id" },
      { alvo, texto: "oi", criadoEm: "2020-01-01T00:00:00Z" },
    ];
    for (const caso of casos) expect((await comentar(caso, m.cookie)).status, JSON.stringify(caso)).toBe(422);
    expect((await banco.pool.query("select count(*)::int n from comentarios")).rows[0].n).toBe(antes);
  });

  it("aceita texto com quebras de linha e exatamente 2000 caracteres", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    expect((await comentar({ alvo: `publicacao:${slug}`, texto: "linha 1\nlinha 2" }, m.cookie)).status).toBe(201);
    expect((await comentar({ alvo: `publicacao:${slug}`, texto: "a".repeat(2000) }, m.cookie)).status).toBe(201);
  });

  it("publicação inexistente ou oculta: 404 idêntico; JSON inválido 400; corpo grande 413", async () => {
    const m = await registrar();
    const oculta = await novaPublicacao({ status: "oculto" });
    const r = await Promise.all([comentar({ alvo: "publicacao:nao-existe", texto: "oi" }, m.cookie), comentar({ alvo: `publicacao:${oculta}`, texto: "oi" }, m.cookie)]);
    expect(r.map((x) => x.status)).toEqual([404, 404]);
    const corpos = await Promise.all(r.map((x) => x.json()));
    expect(new Set(corpos.map((c) => `${c.erro.codigo}|${c.erro.mensagem}`)).size).toBe(1);
    expect((await listarC("publicacao:nao-existe")).status).toBe(404);
    expect((await listarC(`publicacao:${oculta}`)).status).toBe(404);
    expect((await h.criarComentario(req("POST", "/api/v1/comentarios", { bruto: "{ruim", cookie: m.cookie }), undefined)).status).toBe(400);
    expect((await h.criarComentario(req("POST", "/api/v1/comentarios", { bruto: JSON.stringify({ texto: "t".repeat(10_000) }), cookie: m.cookie }), undefined)).status).toBe(413);
  });

  it("leitura é pública e vem em ordem cronológica; sem e-mail, hash, bio nem id de usuário", async () => {
    const a = await registrar();
    const b = await registrar();
    const slug = await novaPublicacao();
    for (const [i, quem] of [a, b, a].entries()) {
      relogio = new Date(relogio.getTime() + 1000);
      expect((await comentar({ alvo: `publicacao:${slug}`, texto: `comentário ${i}` }, quem.cookie)).status).toBe(201);
    }
    const r = await listarC(`publicacao:${slug}`);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c.itens.map((i: { texto: string }) => i.texto)).toEqual(["comentário 0", "comentário 1", "comentário 2"]);
    expect(c.itens.map((i: { autor: { usuario: string } }) => i.autor.usuario)).toEqual([a.usuario, b.usuario, a.usuario]);
    const texto = JSON.stringify(c);
    for (const proibido of [a.email, b.email, a.id, b.id, "senha", "hash", "bio", "email"]) expect(texto).not.toContain(proibido);
  });

  it("paginação estável com empates de instante: sem duplicar nem omitir; inserção no meio não afeta", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const id = (await banco.pool.query("select id from publicacoes where slug=$1", [slug])).rows[0].id;
    const instante = new Date("2026-10-19T10:00:00.000Z");
    // 9 comentários, em grupos de 3 com o MESMO criado_em.
    await banco.db.insert(comentarios).values(
      Array.from({ length: 9 }, (_, i) => ({ publicacaoId: id, autorId: m.id, texto: `c${i}`, criadoEm: new Date(instante.getTime() + Math.floor(i / 3) * 1000) })),
    );
    const esperado = (await banco.pool.query("select texto from comentarios where publicacao_id=$1 order by criado_em asc, id asc", [id])).rows.map((l) => l.texto);
    for (const limite of [1, 2, 4]) {
      const vistos: string[] = [];
      let cursor: string | null = null;
      do {
        const c = await (await listarC(`publicacao:${slug}`, `&limite=${limite}${cursor ? `&cursor=${cursor}` : ""}`)).json();
        vistos.push(...c.itens.map((i: { texto: string }) => i.texto));
        cursor = c.proximoCursor;
      } while (cursor);
      expect(vistos).toEqual(esperado);
    }
    // Comentário novo (mais recente) durante a leitura aparece no fim, sem repetir os anteriores.
    const primeira = await (await listarC(`publicacao:${slug}`, "&limite=4")).json();
    relogio = new Date(relogio.getTime() + 5000);
    expect((await comentar({ alvo: `publicacao:${slug}`, texto: "novo" }, m.cookie)).status).toBe(201);
    const resto: string[] = [];
    let cursor: string | null = primeira.proximoCursor;
    while (cursor) {
      const c = await (await listarC(`publicacao:${slug}`, `&limite=4&cursor=${cursor}`)).json();
      resto.push(...c.itens.map((i: { texto: string }) => i.texto));
      cursor = c.proximoCursor;
    }
    expect([...primeira.itens.map((i: { texto: string }) => i.texto), ...resto]).toEqual([...esperado, "novo"]);
  });

  it("parâmetros inválidos: alvo ausente 422, limite 51 422, cursor adulterado 400", async () => {
    const slug = await novaPublicacao();
    expect((await listarC(null)).status).toBe(422);
    expect((await listarC("investigacao:x")).status).toBe(422);
    expect((await listarC(`publicacao:${slug}`, "&limite=51")).status).toBe(422);
    expect((await listarC(`publicacao:${slug}`, "&cursor=%%%")).status).toBe(400);
    const falso = Buffer.from(JSON.stringify({ criadoEm: "2026-02-31T00:00:00Z", id: "00000000-0000-4000-8000-000000000000" })).toString("base64url");
    expect((await listarC(`publicacao:${slug}`, `&cursor=${falso}`)).status).toBe(400);
  });

  it("limite de 20 comentários por minuto por membro, inclusive sob concorrência", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const respostas = await Promise.all(Array.from({ length: 30 }, (_, i) => comentar({ alvo: `publicacao:${slug}`, texto: `rajada ${i}` }, m.cookie)));
    const status = respostas.map((r) => r.status);
    expect(status.filter((s) => s === 201)).toHaveLength(20);
    expect(status.filter((s) => s === 429)).toHaveLength(10);
    expect(Number(respostas.find((r) => r.status === 429)!.headers.get("retry-after"))).toBeGreaterThan(0);
    relogio = new Date(relogio.getTime() + 61_000);
  });
});

describe("curtidas", () => {
  it("visitante não curte nem descurte (401); sem CSRF 403; publicação inexistente ou oculta 404", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const oculta = await novaPublicacao({ status: "oculto" });
    const antes = (await banco.pool.query("select count(*)::int n from curtidas")).rows[0].n;
    expect((await curtir(slug)).status).toBe(401);
    expect((await descurtir(slug)).status).toBe(401);
    expect((await curtir(slug, m.cookie, { semCsrf: true })).status).toBe(403);
    expect((await curtir("nao-existe", m.cookie)).status).toBe(404);
    expect((await curtir(oculta, m.cookie)).status).toBe(404);
    expect((await descurtir("nao-existe", m.cookie)).status).toBe(404);
    expect((await curtir("Slug Inválido!", m.cookie)).status).toBe(404);
    expect((await banco.pool.query("select count(*)::int n from curtidas")).rows[0].n).toBe(antes);
  });

  it("curtir, repetir, descurtir e repetir são idempotentes e a contagem fica certa", async () => {
    const a = await registrar();
    const b = await registrar();
    const slug = await novaPublicacao();
    const estado = async (r: Response) => ({ status: r.status, ...(await r.json()) });
    expect(await estado(await curtir(slug, a.cookie))).toEqual({ status: 200, curtidas: 1, euCurti: true });
    expect(await estado(await curtir(slug, a.cookie))).toEqual({ status: 200, curtidas: 1, euCurti: true });
    expect(await estado(await curtir(slug, b.cookie))).toEqual({ status: 200, curtidas: 2, euCurti: true });
    expect(await estado(await descurtir(slug, a.cookie))).toEqual({ status: 200, curtidas: 1, euCurti: false });
    expect(await estado(await descurtir(slug, a.cookie))).toEqual({ status: 200, curtidas: 1, euCurti: false });
    expect(await estado(await descurtir(slug, b.cookie))).toEqual({ status: 200, curtidas: 0, euCurti: false });
  });

  it("um membro não remove nem altera a curtida de outro", async () => {
    const a = await registrar();
    const b = await registrar();
    const slug = await novaPublicacao();
    await curtir(slug, a.cookie);
    const r = await (await descurtir(slug, b.cookie)).json();
    expect(r).toEqual({ curtidas: 1, euCurti: false });
    const linhas = (await banco.pool.query("select usuario_id from curtidas c join publicacoes p on p.id = c.publicacao_id where p.slug = $1", [slug])).rows;
    expect(linhas).toEqual([{ usuario_id: a.id }]);
  });

  it("concorrência: 20 'curtir' simultâneos do mesmo membro dão 1 linha e 20 × 200", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const respostas = await Promise.all(Array.from({ length: 20 }, () => curtir(slug, m.cookie)));
    expect(respostas.map((r) => r.status)).toEqual(Array(20).fill(200));
    expect((await banco.pool.query("select count(*)::int n from curtidas c join publicacoes p on p.id = c.publicacao_id where p.slug = $1", [slug])).rows[0].n).toBe(1);
    expect((await (await detalhe(slug, m.cookie)).json()).curtidas).toBe(1);
  });

  it("concorrência: 10 membros curtindo ao mesmo tempo (2 vezes cada) somam exatamente 10", async () => {
    const membros = await Promise.all(Array.from({ length: 10 }, () => registrar()));
    const slug = await novaPublicacao();
    const respostas = await Promise.all(membros.flatMap((m) => [curtir(slug, m.cookie), curtir(slug, m.cookie)]));
    expect(respostas.every((r) => r.status === 200)).toBe(true);
    expect((await (await detalhe(slug)).json()).curtidas).toBe(10);
  });

  it("concorrência: curtir e descurtir misturados terminam num estado consistente", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    await Promise.all(Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? curtir(slug, m.cookie) : descurtir(slug, m.cookie))));
    const n = (await banco.pool.query("select count(*)::int n from curtidas c join publicacoes p on p.id = c.publicacao_id where p.slug = $1", [slug])).rows[0].n;
    expect([0, 1]).toContain(n);
    const d = await (await detalhe(slug, m.cookie)).json();
    expect(d.curtidas).toBe(n);
    expect(d.euCurti).toBe(n === 1);
  });

  it("limite de 60 operações por minuto por membro", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    const respostas = await Promise.all(Array.from({ length: 70 }, () => curtir(slug, m.cookie)));
    expect(respostas.filter((r) => r.status === 200)).toHaveLength(60);
    expect(respostas.filter((r) => r.status === 429)).toHaveLength(10);
    relogio = new Date(relogio.getTime() + 61_000);
  });
});

describe("campos nas publicações", () => {
  it("comentarios, curtidas e euCurti são calculados dos dados gravados (detalhe, listagem e relacionadas)", async () => {
    await banco.pool.query("truncate publicacoes cascade");
    const a = await registrar();
    const b = await registrar();
    const visitante = undefined;
    const x = await novaPublicacao({ slug: "alvo-x" });
    const y = await novaPublicacao({ slug: "alvo-y" });
    await novaPublicacao({ slug: "alvo-z" });
    for (let i = 0; i < 3; i++) {
      relogio = new Date(relogio.getTime() + 61_000);
      await comentar({ alvo: "publicacao:alvo-x", texto: `c${i}` }, i === 0 ? a.cookie : b.cookie);
    }
    await comentar({ alvo: "publicacao:alvo-y", texto: "só um" }, a.cookie);
    await curtir("alvo-x", a.cookie);
    await curtir("alvo-x", b.cookie);
    await curtir("alvo-y", b.cookie);

    const dx = (cookie?: string) => detalhe(x, cookie).then((r) => r.json());
    expect(await dx(a.cookie)).toMatchObject({ comentarios: 3, curtidas: 2, euCurti: true });
    expect(await dx(b.cookie)).toMatchObject({ comentarios: 3, curtidas: 2, euCurti: true });
    // Visitante: contagens reais, euCurti sempre false (nunca ausente).
    expect(await dx(visitante)).toMatchObject({ comentarios: 3, curtidas: 2, euCurti: false });
    expect(await dx("sessao=token-invalido")).toMatchObject({ comentarios: 3, curtidas: 2, euCurti: false });
    expect(await (await detalhe(y, a.cookie)).json()).toMatchObject({ comentarios: 1, curtidas: 1, euCurti: false });
    expect(await (await detalhe("alvo-z", a.cookie)).json()).toMatchObject({ comentarios: 0, curtidas: 0, euCurti: false });

    const lista = await (await listarP("?limite=50", a.cookie)).json();
    const porSlug = Object.fromEntries(lista.itens.map((i: { slug: string }) => [i.slug, i]));
    expect(porSlug["alvo-x"]).toMatchObject({ comentarios: 3, curtidas: 2, euCurti: true });
    expect(porSlug["alvo-y"]).toMatchObject({ comentarios: 1, curtidas: 1, euCurti: false });
    expect(porSlug["alvo-z"]).toMatchObject({ comentarios: 0, curtidas: 0, euCurti: false });
    const listaVisitante = await (await listarP("?limite=50")).json();
    expect(listaVisitante.itens.every((i: { euCurti: boolean }) => i.euCurti === false)).toBe(true);

    const rel = await (await pubs.relacionadas(req("GET", "/api/v1/publicacoes/alvo-z/relacionadas", { cookie: b.cookie }), contexto("alvo-z"))).json();
    const relX = rel.itens.find((i: { slug: string }) => i.slug === "alvo-x");
    expect(relX).toMatchObject({ comentarios: 3, curtidas: 2, euCurti: true });

    // Descurtir muda os números e o euCurti imediatamente.
    await descurtir("alvo-x", a.cookie);
    expect(await dx(a.cookie)).toMatchObject({ curtidas: 1, euCurti: false });
  });

  it("publicação recém-criada pela API já nasce com 0, 0 e false", async () => {
    const m = await registrar();
    const r = await pubs.criar(req("POST", "/api/v1/publicacoes", { corpo: { titulo: "Teoria nova de teste", corpo: "Texto com mais de vinte caracteres, ok." }, cookie: m.cookie }), undefined);
    expect(await r.json()).toMatchObject({ comentarios: 0, curtidas: 0, euCurti: false });
  });

  it("nenhuma resposta expõe dados privados de usuários", async () => {
    const m = await registrar();
    const slug = await novaPublicacao();
    await comentar({ alvo: `publicacao:${slug}`, texto: "oi" }, m.cookie);
    await curtir(slug, m.cookie);
    const corpos = [
      JSON.stringify(await (await detalhe(slug, m.cookie)).json()),
      JSON.stringify(await (await listarP("?limite=50", m.cookie)).json()),
      JSON.stringify(await (await listarC(`publicacao:${slug}`)).json()),
    ].join(" ");
    for (const proibido of [m.email, m.id, "senha_hash", "senhaHash", "scrypt$", "dono@exemplo.com", "bio secreta", "papel"]) expect(corpos).not.toContain(proibido);
  });
});
