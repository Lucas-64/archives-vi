import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { criarManipuladoresInvestigacoes } from "../investigacoes/rotas";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { req, registrarMembro, unico, type Membro, type OpReq } from "../testes/http";
import { criarManipuladoresEvidencias } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };

let banco: BancoDeTeste;
let relogio = new Date("2026-10-20T15:00:00Z");
const avancar = (ms = 1000) => {
  relogio = new Date(relogio.getTime() + ms);
};
let auth: ReturnType<typeof criarManipuladoresAuth>;
let inv: ReturnType<typeof criarManipuladoresInvestigacoes>;
let h: ReturnType<typeof criarManipuladoresEvidencias>;

const ctxSlug = (slug: string) => ({ params: Promise.resolve({ slug }) });
const ctxSug = (slug: string, id: string) => ({ params: Promise.resolve({ slug, id }) });
const base = (slug: string) => `/api/v1/investigacoes/${slug}`;

const enviar = (slug: string, corpo: unknown, cookie?: string, extra: OpReq = {}) =>
  h.criar(req("POST", `${base(slug)}/evidencias`, { corpo, cookie, ...extra }), ctxSlug(slug));
const publicas = (slug: string, q = "") => h.listar(req("GET", `${base(slug)}/evidencias${q}`), ctxSlug(slug));
const fila = (slug: string, q = "", cookie?: string) => h.listarSugestoes(req("GET", `${base(slug)}/sugestoes${q}`, { cookie }), ctxSlug(slug));
const aceitar = (slug: string, id: string, cookie?: string) => h.aceitar(req("POST", `${base(slug)}/sugestoes/${id}/aceitar`, { cookie }), ctxSug(slug, id));
const recusar = (slug: string, id: string, corpo?: unknown, cookie?: string) =>
  h.recusar(req("POST", `${base(slug)}/sugestoes/${id}/recusar`, { corpo, cookie }), ctxSug(slug, id));
const minhas = (q = "", cookie?: string) => h.minhasSugestoes(req("GET", `/api/v1/me/sugestoes${q}`, { cookie }), undefined);
const detalhe = (slug: string, cookie?: string) => inv.detalhe(req("GET", base(slug), { cookie }), ctxSlug(slug));
const historico = async (slug: string) => (await (await inv.historico(req("GET", `${base(slug)}/historico?limite=50`), ctxSlug(slug))).json()).itens as { titulo: string; resumo: string }[];

const nova = () => ({
  titulo: `Investigação ${unico()}`,
  descricao: "Descrição com mais de vinte caracteres, para passar na validação.",
  categoria: "symbol",
  teoria: { hipotese: "Hipótese com mais de vinte caracteres, para passar na validação.", argumentosFavoraveis: [], perguntaCentral: "Isto é coincidência?", fontes: [] },
});
async function abrirInvestigacao(dono: Membro) {
  const r = await inv.criar(req("POST", "/api/v1/investigacoes", { corpo: nova(), cookie: dono.cookie }), undefined);
  expect(r.status).toBe(201);
  return (await r.json()).slug as string;
}
const ev = (extra: Record<string, unknown> = {}) => ({
  origem: "referencia_textual",
  titulo: `Evidência ${unico()}`,
  descricao: "Descrição da evidência com mais de dez caracteres.",
  ...extra,
});
async function sugerir(slug: string, m: Membro, extra: Record<string, unknown> = {}) {
  const r = await enviar(slug, ev(extra), m.cookie);
  expect(r.status, JSON.stringify(await r.clone().json())).toBe(201);
  return (await r.json()) as { id: string; status: string; titulo: string };
}
const papel = (m: Membro, p: string) => banco.pool.query("update usuarios set papel=$2 where id=$1", [m.id, p]);
const contar = async (tabela: string, onde = "true", args: unknown[] = []) =>
  (await banco.pool.query(`select count(*)::int n from ${tabela} where ${onde}`, args)).rows[0].n as number;

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const opcoes = { obterDb: () => banco.db, agora: () => relogio, producao: false };
  auth = criarManipuladoresAuth({ ...opcoes, parametrosSenha: BARATO });
  inv = criarManipuladoresInvestigacoes(opcoes);
  h = criarManipuladoresEvidencias(opcoes);
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("POST /investigacoes/{slug}/evidencias", () => {
  it("visitante 401, CSRF e origem externa 403, investigação inexistente 404; nada é gravado", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const antes = await contar("evidencias");
    expect((await enviar(slug, ev())).status).toBe(401);
    expect((await enviar(slug, ev(), m.cookie, { semCsrf: true })).status).toBe(403);
    expect((await enviar(slug, ev(), m.cookie, { origem: "http://outro.exemplo" })).status).toBe(403);
    expect((await enviar("nao-existe", ev(), m.cookie)).status).toBe(404);
    expect((await enviar("Slug Inválido!", ev(), m.cookie)).status).toBe(404);
    expect(await contar("evidencias")).toBe(antes);
  });

  it("sessão é verificada antes do corpo: visitante com JSON inválido recebe 401, não 400", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const r = await h.criar(req("POST", `${base(slug)}/evidencias`, { bruto: "{não é json" }), ctxSlug(slug));
    expect(r.status).toBe(401);
  });

  it("membro cria PENDENTE: 201, autor da sessão, sem decisão, imagens vazias, sem no-store ausente", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const r = await enviar(slug, ev({ titulo: "  Placa na parede  ", fonte: "https://exemplo.com/foto" }), m.cookie);
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c).toMatchObject({
      origem: "referencia_textual",
      titulo: "Placa na parede",
      fonte: "https://exemplo.com/foto",
      imagens: [],
      status: "pendente",
      autor: { usuario: m.usuario },
      data: relogio.toISOString(),
    });
    for (const ausente of ["motivo", "decididaPor", "decididaEm", "origemComunidade", "relacionadaA"]) expect(c).not.toHaveProperty(ausente);
    const linha = (await banco.pool.query("select * from evidencias where id=$1", [c.id])).rows[0];
    expect(linha).toMatchObject({ autor_id: m.id, status: "pendente", decidida_por_id: null });
    expect(await historico(slug)).toHaveLength(1); // só "criada": pendente não vai ao histórico público
  });

  it("o responsável cria já ACEITA, aceita por ele mesmo, sem origemComunidade, e vai ao histórico público", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const r = await enviar(slug, ev({ titulo: "Foto do dono" }), dono.cookie);
    const c = await r.json();
    expect(r.status).toBe(201);
    expect(c).toMatchObject({ status: "aceita", autor: { usuario: dono.usuario }, decididaPor: { usuario: dono.usuario } });
    expect(c).not.toHaveProperty("origemComunidade");
    const linha = (await banco.pool.query("select * from evidencias where id=$1", [c.id])).rows[0];
    expect(linha).toMatchObject({ autor_id: dono.id, decidida_por_id: dono.id });
    const h2 = await historico(slug);
    expect(h2).toContainEqual(expect.objectContaining({ titulo: "Evidência adicionada", resumo: "Nova evidência aceita: Foto do dono." }));
    // Decisão do próprio responsável não é ação de moderação: sem auditoria.
    expect(await contar("auditoria", "alvo_id=$1", [c.id])).toBe(0);
  });

  it("recusa campos fora do contrato (status, autor, imagens, imagemArquivoIds, decididaPor...) com 422 e nada gravado", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const antes = await contar("evidencias");
    for (const extra of [{ status: "aceita" }, { autor: "x" }, { autorId: m.id }, { imagens: [] }, { imagemArquivoIds: [] }, { imagemArquivoIds: ["a"] }, { decididaPor: "x" }, { motivo: "x" }, { avaliacoes: {} }]) {
      const r = await enviar(slug, ev(extra), m.cookie);
      expect(r.status, JSON.stringify(extra)).toBe(422);
      expect(Object.values((await r.json()).erro.campos).join(" ")).toContain("Campo não permitido.");
    }
    expect(await contar("evidencias")).toBe(antes);
  });

  it("valida origem, tamanhos, fonte e relacionadaA (422 com campos)", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const casos: [Record<string, unknown>, string][] = [
      [{ origem: "outra" }, "origem"],
      [{ titulo: "ab" }, "titulo"],
      [{ titulo: "x".repeat(121) }, "titulo"],
      [{ descricao: "curta" }, "descricao"],
      [{ descricao: "x".repeat(1001) }, "descricao"],
      [{ fonte: "" }, "fonte"],
      [{ fonte: "x".repeat(301) }, "fonte"],
      [{ relacionadaA: "não-é-uuid" }, "relacionadaA"],
      [{ titulo: "tem\u0000nulo" }, "titulo"],
    ];
    for (const [extra, campo] of casos) {
      const r = await enviar(slug, ev(extra), m.cookie);
      expect(r.status, JSON.stringify(extra)).toBe(422);
      expect(Object.keys((await r.json()).erro.campos)).toContain(campo);
    }
    expect((await enviar(slug, { origem: "referencia_textual" }, m.cookie)).status).toBe(422);
    expect((await enviar(slug, [], m.cookie)).status).toBe(422);
    expect((await h.criar(req("POST", `${base(slug)}/evidencias`, { bruto: "{x", cookie: m.cookie }), ctxSlug(slug))).status).toBe(400);
    // Origem aceita em todos os quatro valores.
    avancar(61_000);
    for (const origem of ["imagem_propria", "imagem_terceiro", "referencia_textual", "origem_nao_verificada"]) expect((await enviar(slug, ev({ origem }), m.cookie)).status).toBe(201);
  });

  it("investigação encerrada ainda aceita sugestões", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    await inv.encerrar(req("POST", `${base(slug)}/encerrar`, { cookie: dono.cookie }), ctxSlug(slug));
    const m = await registrarMembro(auth);
    expect((await enviar(slug, ev(), m.cookie)).status).toBe(201);
  });

  it("relacionadaA: aceita da mesma investigação passa; pendente, recusada, de outra investigação e inexistente dão 422", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const outraSlug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const aceita = await (await enviar(slug, ev(), dono.cookie)).json();
    const deOutra = await (await enviar(outraSlug, ev(), dono.cookie)).json();
    const pendente = await sugerir(slug, m);
    const recusada = await sugerir(slug, m);
    expect((await recusar(slug, recusada.id, {}, dono.cookie)).status).toBe(200);

    const ok = await enviar(slug, ev({ relacionadaA: aceita.id }), m.cookie);
    expect(ok.status).toBe(201);
    expect((await ok.json()).relacionadaA).toBe(aceita.id);
    for (const alvo of [pendente.id, recusada.id, deOutra.id, crypto.randomUUID()]) {
      const r = await enviar(slug, ev({ relacionadaA: alvo }), m.cookie);
      expect(r.status, alvo).toBe(422);
      expect(Object.keys((await r.json()).erro.campos)).toEqual(["relacionadaA"]);
    }
  });

  it("limite por minuto (10) responde 429 com Retry-After; teto de 10 pendentes por investigação responde 409 e libera ao decidir", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const outraSlug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) ids.push((await sugerir(slug, m)).id);
    const estourou = await enviar(slug, ev(), m.cookie);
    expect(estourou.status).toBe(429);
    expect(estourou.headers.get("retry-after")).toBeTruthy();

    avancar(61_000);
    const cheio = await enviar(slug, ev(), m.cookie);
    expect(cheio.status).toBe(409);
    expect((await cheio.json()).erro.codigo).toBe("conflito");
    // O teto é por investigação.
    expect((await enviar(outraSlug, ev(), m.cookie)).status).toBe(201);
    // Recusar uma abre vaga.
    expect((await recusar(slug, ids[0], {}, dono.cookie)).status).toBe(200);
    avancar(61_000);
    expect((await enviar(slug, ev(), m.cookie)).status).toBe(201);
    // O responsável não é limitado pelo teto (já nasce aceita).
    avancar(61_000);
    for (let i = 0; i < 3; i++) expect((await enviar(slug, ev(), dono.cookie)).status).toBe(201);
  });
});

describe("GET /investigacoes/{slug}/evidencias (pública)", () => {
  it("só lista aceitas; pendentes e recusadas ficam fora da lista, das contagens e do histórico; sem dados privados", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const antes = await (await detalhe(slug)).json();
    expect(antes.contagens.evidencias).toBe(0);
    const pendente = await sugerir(slug, m, { titulo: "Pendente secreta" });
    const recusada = await sugerir(slug, m, { titulo: "Recusada secreta" });
    await recusar(slug, recusada.id, { motivo: "Motivo interno da recusa" }, dono.cookie);
    avancar(1000);
    const aceitaDono = await (await enviar(slug, ev({ titulo: "Aceita do dono" }), dono.cookie)).json();
    avancar(1000);
    const daComunidade = await sugerir(slug, m, { titulo: "Aceita da comunidade" });
    await aceitar(slug, daComunidade.id, dono.cookie);

    const r = await publicas(slug);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c.itens.map((i: { titulo: string }) => i.titulo)).toEqual(["Aceita do dono", "Aceita da comunidade"]);
    const texto = JSON.stringify(c);
    for (const proibido of ["Pendente secreta", "Recusada secreta", "Motivo interno", pendente.id, recusada.id, m.email, dono.email, m.id, dono.id, "senha", "motivo", "status", "decididaPor"]) {
      expect(texto, proibido).not.toContain(proibido);
    }
    expect(Object.keys(c.itens[0]).sort()).toEqual(["autor", "data", "descricao", "fonte", "id", "imagens", "origem", "titulo"]);
    // Autoria preservada; origemComunidade só quando quem aceitou não é quem enviou.
    expect(c.itens[0].id).toBe(aceitaDono.id);
    expect(c.itens[0]).not.toHaveProperty("origemComunidade");
    expect(c.itens[1].autor.usuario).toBe(m.usuario);
    expect(c.itens[1].origemComunidade).toEqual({
      enviadaPor: { nome: expect.any(String), usuario: m.usuario },
      aceitaPor: { nome: expect.any(String), usuario: dono.usuario },
    });
    // Contagens públicas só de aceitas.
    expect((await (await detalhe(slug)).json()).contagens.evidencias).toBe(2);
    const lista = await (await inv.listar(req("GET", "/api/v1/investigacoes?limite=50"), undefined)).json();
    expect(lista.itens.find((i: { slug: string }) => i.slug === slug).contagemEvidencias).toBe(2);
    // Histórico: só as aceitas, só o título.
    const hist = JSON.stringify(await historico(slug));
    expect(hist).toContain("Aceita do dono");
    expect(hist).toContain("Aceita da comunidade");
    for (const proibido of ["Pendente secreta", "Recusada secreta", "Motivo interno"]) expect(hist).not.toContain(proibido);
  });

  it("404 idêntico para investigação inexistente e slug malformado; limite 51 dá 422; cursor adulterado dá 400", async () => {
    const a = await publicas("nao-existe");
    const b = await publicas("Slug Inválido!");
    expect(a.status).toBe(404);
    expect(b.status).toBe(404);
    const [ea, eb] = [await a.json(), await b.json()];
    expect(ea.erro.mensagem).toBe(eb.erro.mensagem);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    expect((await publicas(slug, "?limite=51")).status).toBe(422);
    expect((await publicas(slug, "?cursor=invalido!!")).status).toBe(400);
    const forjado = Buffer.from(JSON.stringify({ criadoEm: "2026-99-99T00:00:00Z", id: crypto.randomUUID() })).toString("base64url");
    expect((await publicas(slug, `?cursor=${forjado}`)).status).toBe(400);
    expect((await publicas(slug, `?cursor=${Buffer.from("{}").toString("base64url")}`)).status).toBe(400);
  });

  it("paginação estável com empates de instante: nenhuma repetida, nenhuma omitida, ordem crescente (criado_em, id)", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    // Três envios no mesmo instante e dois no seguinte (o relógio é fixo no teste).
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) ids.push((await (await enviar(slug, ev(), dono.cookie)).json()).id);
    avancar(1000);
    for (let i = 0; i < 2; i++) ids.push((await (await enviar(slug, ev(), dono.cookie)).json()).id);

    const vistos: string[] = [];
    let cursor: string | null = null;
    let paginas = 0;
    do {
      const r: Response = await publicas(slug, `?limite=2${cursor ? `&cursor=${cursor}` : ""}`);
      const c: { itens: { id: string }[]; proximoCursor: string | null } = await r.json();
      vistos.push(...c.itens.map((i) => i.id));
      cursor = c.proximoCursor;
      paginas += 1;
    } while (cursor && paginas < 10);
    expect(paginas).toBe(3);
    expect(vistos).toHaveLength(5);
    expect(new Set(vistos).size).toBe(5);
    expect([...vistos].sort()).toEqual([...ids].sort());
    // Ordem total: dentro do mesmo instante, por id crescente; instantes crescentes.
    expect(vistos.slice(0, 3)).toEqual([...ids.slice(0, 3)].sort());
    expect(vistos.slice(3)).toEqual([...ids.slice(3)].sort());
  });
});

describe("decisão sobre sugestões", () => {
  it("visitante 401; membro comum 403; CSRF 403; sugestão inexistente, id malformado e de outra investigação 404", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const outraSlug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const comum = await registrarMembro(auth);
    const s = await sugerir(slug, m);
    for (const acao of [aceitar, (sl: string, id: string, c?: string) => recusar(sl, id, {}, c)]) {
      expect((await acao(slug, s.id)).status).toBe(401);
      expect((await acao(slug, s.id, comum.cookie)).status).toBe(403);
      expect((await acao(slug, s.id, m.cookie)).status).toBe(403);
      expect((await acao(slug, crypto.randomUUID(), dono.cookie)).status).toBe(404);
      expect((await acao(slug, "nao-uuid", dono.cookie)).status).toBe(404);
      expect((await acao(outraSlug, s.id, dono.cookie)).status).toBe(404);
      expect((await acao("nao-existe", s.id, dono.cookie)).status).toBe(404);
    }
    expect((await h.aceitar(req("POST", `${base(slug)}/sugestoes/${s.id}/aceitar`, { cookie: dono.cookie, semCsrf: true }), ctxSug(slug, s.id))).status).toBe(403);
    expect((await banco.pool.query("select status from evidencias where id=$1", [s.id])).rows[0].status).toBe("pendente");
  });

  it("o responsável aceita: autoria intacta, origemComunidade, histórico público, sem auditoria de moderação", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const s = await sugerir(slug, m, { titulo: "Para aceitar" });
    avancar(5000);
    const r = await aceitar(slug, s.id, dono.cookie);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c).toMatchObject({ status: "aceita", autor: { usuario: m.usuario }, decididaPor: { usuario: dono.usuario }, decididaEm: relogio.toISOString() });
    expect(c.origemComunidade).toMatchObject({ enviadaPor: { usuario: m.usuario }, aceitaPor: { usuario: dono.usuario } });
    expect((await banco.pool.query("select autor_id from evidencias where id=$1", [s.id])).rows[0].autor_id).toBe(m.id);
    expect(await historico(slug)).toContainEqual(expect.objectContaining({ titulo: "Evidência adicionada", resumo: "Nova evidência aceita: Para aceitar." }));
    expect(await contar("auditoria", "alvo_id=$1", [s.id])).toBe(0);
  });

  it("moderador e admin decidem (aceitar e recusar) e cada decisão gera exatamente uma auditoria sem dados privados", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const mod = await registrarMembro(auth);
    const adm = await registrarMembro(auth);
    await papel(mod, "moderador");
    await papel(adm, "admin");
    const s1 = await sugerir(slug, m);
    const s2 = await sugerir(slug, m);
    expect((await aceitar(slug, s1.id, mod.cookie)).status).toBe(200);
    const rec = await recusar(slug, s2.id, { motivo: "Sem fonte verificável." }, adm.cookie);
    expect(rec.status).toBe(200);
    expect(await rec.json()).toMatchObject({ status: "recusada", motivo: "Sem fonte verificável.", decididaPor: { usuario: adm.usuario } });

    const aud = (await banco.pool.query("select * from auditoria where alvo_id = any($1) order by acao", [[s1.id, s2.id]])).rows;
    expect(aud).toHaveLength(2);
    expect(aud[0]).toMatchObject({ acao: "evidencia.aceitar", ator_id: mod.id, alvo_tipo: "evidencia", alvo_id: s1.id, antes: { status: "pendente" }, motivo: null });
    expect(aud[1]).toMatchObject({ acao: "evidencia.recusar", ator_id: adm.id, alvo_id: s2.id, motivo: "Sem fonte verificável." });
    const texto = JSON.stringify(aud);
    for (const proibido of [m.email, mod.email, "senha", "hash", "token"]) expect(texto).not.toContain(proibido);
  });

  it("ninguém decide a própria sugestão (nem moderador nem admin): 403 e nada muda", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const mod = await registrarMembro(auth);
    await papel(mod, "moderador");
    const s = await sugerir(slug, mod);
    const antes = await contar("auditoria");
    expect((await aceitar(slug, s.id, mod.cookie)).status).toBe(403);
    expect((await recusar(slug, s.id, {}, mod.cookie)).status).toBe(403);
    await papel(mod, "admin");
    expect((await aceitar(slug, s.id, mod.cookie)).status).toBe(403);
    expect((await banco.pool.query("select status from evidencias where id=$1", [s.id])).rows[0].status).toBe("pendente");
    expect(await contar("auditoria")).toBe(antes);
    // Outro moderador pode.
    const outro = await registrarMembro(auth);
    await papel(outro, "moderador");
    expect((await aceitar(slug, s.id, outro.cookie)).status).toBe(200);
  });

  it("papel é relido do banco: rebaixado perde o acesso na mesma sessão", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const mod = await registrarMembro(auth);
    await papel(mod, "moderador");
    const s = await sugerir(slug, m);
    await papel(mod, "membro");
    expect((await aceitar(slug, s.id, mod.cookie)).status).toBe(403);
  });

  it("decisão final: repetir a mesma é 200 sem efeitos novos; a contrária é 409 e nada muda", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const mod = await registrarMembro(auth);
    await papel(mod, "moderador");

    const a = await sugerir(slug, m);
    expect((await aceitar(slug, a.id, mod.cookie)).status).toBe(200);
    const antesHist = (await historico(slug)).length;
    const antesAud = await contar("auditoria", "alvo_id=$1", [a.id]);
    const linhaAntes = (await banco.pool.query("select * from evidencias where id=$1", [a.id])).rows[0];
    avancar(5000);
    expect((await aceitar(slug, a.id, mod.cookie)).status).toBe(200);
    expect((await aceitar(slug, a.id, dono.cookie)).status).toBe(200);
    expect((await historico(slug)).length).toBe(antesHist);
    expect(await contar("auditoria", "alvo_id=$1", [a.id])).toBe(antesAud);
    expect((await banco.pool.query("select * from evidencias where id=$1", [a.id])).rows[0]).toEqual(linhaAntes);
    const contraria = await recusar(slug, a.id, { motivo: "mudei de ideia" }, dono.cookie);
    expect(contraria.status).toBe(409);
    expect((await banco.pool.query("select status, motivo_recusa from evidencias where id=$1", [a.id])).rows[0]).toEqual({ status: "aceita", motivo_recusa: null });

    const b = await sugerir(slug, m);
    expect((await recusar(slug, b.id, { motivo: "Duplicada." }, dono.cookie)).status).toBe(200);
    expect((await recusar(slug, b.id, { motivo: "Outro motivo" }, dono.cookie)).status).toBe(200);
    expect((await banco.pool.query("select motivo_recusa from evidencias where id=$1", [b.id])).rows[0].motivo_recusa).toBe("Duplicada.");
    expect((await aceitar(slug, b.id, dono.cookie)).status).toBe(409);
    expect((await banco.pool.query("select status from evidencias where id=$1", [b.id])).rows[0].status).toBe("recusada");
  });

  it("recusar aceita corpo vazio ou {}; valida o motivo; o motivo nunca aparece na lista pública", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const s1 = await sugerir(slug, m);
    const s2 = await sugerir(slug, m);
    const s3 = await sugerir(slug, m);
    for (const corpo of [{ motivo: "" }, { motivo: "x".repeat(301) }, { motivo: 1 }, { outro: "x" }, { status: "aceita" }]) {
      expect((await recusar(slug, s1.id, corpo, dono.cookie)).status, JSON.stringify(corpo)).toBe(422);
    }
    expect((await banco.pool.query("select status from evidencias where id=$1", [s1.id])).rows[0].status).toBe("pendente");
    expect((await recusar(slug, s1.id, undefined, dono.cookie)).status).toBe(200);
    expect((await recusar(slug, s2.id, {}, dono.cookie)).status).toBe(200);
    expect((await recusar(slug, s3.id, { motivo: "  Motivo com espaços  " }, dono.cookie)).status).toBe(200);
    expect((await banco.pool.query("select motivo_recusa from evidencias where id=$1", [s3.id])).rows[0].motivo_recusa).toBe("Motivo com espaços");
    expect(JSON.stringify(await (await publicas(slug)).json())).not.toContain("Motivo com espaços");
  });

  it("falha na auditoria desfaz a decisão da moderação (evidência continua pendente, sem histórico)", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const mod = await registrarMembro(auth);
    await papel(mod, "moderador");
    const s = await sugerir(slug, m, { titulo: "Não pode ficar aceita sem auditoria" });
    const histAntes = (await historico(slug)).length;
    await banco.pool.query(`create function falhar_auditoria() returns trigger language plpgsql as $$ begin raise exception 'falha simulada'; end $$`);
    await banco.pool.query("create trigger auditoria_falha_teste before insert on auditoria for each row execute function falhar_auditoria()");
    try {
      const r = await aceitar(slug, s.id, mod.cookie);
      expect(r.status).toBe(500);
      const ev = (await banco.pool.query("select status, decidida_por_id, decidida_em from evidencias where id=$1", [s.id])).rows[0];
      expect(ev).toEqual({ status: "pendente", decidida_por_id: null, decidida_em: null });
      expect((await historico(slug)).length).toBe(histAntes);
    } finally {
      await banco.pool.query("drop trigger auditoria_falha_teste on auditoria");
      await banco.pool.query("drop function falhar_auditoria()");
    }
    expect((await aceitar(slug, s.id, mod.cookie)).status).toBe(200);
  });
});

describe("GET /investigacoes/{slug}/sugestoes (fila)", () => {
  it("visitante 401; membro comum e remetente 403; responsável, moderador e admin 200; investigação inexistente 404", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const mod = await registrarMembro(auth);
    await papel(mod, "moderador");
    await sugerir(slug, m);
    expect((await fila(slug)).status).toBe(401);
    expect((await fila(slug, "", m.cookie)).status).toBe(403);
    expect((await fila(slug, "", dono.cookie)).status).toBe(200);
    expect((await fila(slug, "", mod.cookie)).status).toBe(200);
    expect((await fila("nao-existe", "", dono.cookie)).status).toBe(404);
    const outroDono = await registrarMembro(auth);
    expect((await fila(slug, "", outroDono.cookie)).status).toBe(403);
  });

  it("por padrão pendentes e recusadas, mais recentes primeiro; ?status filtra; status inválido 422; motivo visível à gestão", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const a = await sugerir(slug, m, { titulo: "Primeira" });
    avancar(1000);
    const b = await sugerir(slug, m, { titulo: "Segunda" });
    avancar(1000);
    const c = await sugerir(slug, m, { titulo: "Terceira" });
    await recusar(slug, b.id, { motivo: "Motivo da gestão" }, dono.cookie);
    await aceitar(slug, a.id, dono.cookie);

    const padrao = await (await fila(slug, "", dono.cookie)).json();
    expect(padrao.itens.map((i: { titulo: string }) => i.titulo)).toEqual(["Terceira", "Segunda"]);
    expect(padrao.itens[1]).toMatchObject({ status: "recusada", motivo: "Motivo da gestão" });
    const so = async (q: string) => (await (await fila(slug, q, dono.cookie)).json()).itens.map((i: { id: string }) => i.id);
    expect(await so("?status=pendente")).toEqual([c.id]);
    expect(await so("?status=recusada")).toEqual([b.id]);
    expect(await so("?status=aceita")).toEqual([a.id]);
    expect((await fila(slug, "?status=oculta", dono.cookie)).status).toBe(422);
    expect((await fila(slug, "", dono.cookie)).headers.get("cache-control")).toBe("no-store");
  });
});

describe("GET /me/sugestoes", () => {
  it("visitante e sessão inválida: 401", async () => {
    expect((await minhas()).status).toBe(401);
    expect((await minhas("", "sessao=token-invalido")).status).toBe(401);
  });

  it("cada membro vê só as próprias, em todos os estados, com metadados da decisão; sem dados de terceiros", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const a = await registrarMembro(auth);
    const b = await registrarMembro(auth);
    const sa1 = await sugerir(slug, a, { titulo: "A pendente" });
    const sa2 = await sugerir(slug, a, { titulo: "A aceita" });
    const sa3 = await sugerir(slug, a, { titulo: "A recusada" });
    const sb = await sugerir(slug, b, { titulo: "B pendente" });
    await aceitar(slug, sa2.id, dono.cookie);
    await recusar(slug, sa3.id, { motivo: "Sem fonte." }, dono.cookie);

    const r = await minhas("", a.cookie);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c.itens).toHaveLength(3);
    const por = Object.fromEntries(c.itens.map((i: { titulo: string }) => [i.titulo, i]));
    expect(por["A pendente"]).toMatchObject({ status: "pendente", investigacao: { slug } });
    expect(por["A pendente"]).not.toHaveProperty("decididaPor");
    expect(por["A aceita"]).toMatchObject({ status: "aceita", decididaPor: { usuario: dono.usuario } });
    expect(por["A recusada"]).toMatchObject({ status: "recusada", motivo: "Sem fonte.", decididaPor: { usuario: dono.usuario } });
    const texto = JSON.stringify(c);
    for (const proibido of [sb.id, "B pendente", b.usuario, b.email, a.email, a.id, dono.email, dono.id, "senha"]) expect(texto, proibido).not.toContain(proibido);
    expect(c.itens.map((i: { id: string }) => i.id)).not.toContain(sb.id);
    expect(sa1.id).toBeTruthy();

    const deB = await (await minhas("", b.cookie)).json();
    expect(deB.itens.map((i: { id: string }) => i.id)).toEqual([sb.id]);
    // O dono da investigação não é remetente: nada seu aqui.
    expect((await (await minhas("", dono.cookie)).json()).itens).toEqual([]);
  });

  it("identidade só da sessão: parâmetros de usuário são ignorados; ?status filtra; status inválido 422", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const a = await registrarMembro(auth);
    const b = await registrarMembro(auth);
    const sb = await sugerir(slug, b);
    await sugerir(slug, a);
    for (const q of [`?usuario=${b.usuario}`, `?autor=${b.usuario}`, `?autorId=${b.id}`]) {
      const itens = (await (await minhas(q, a.cookie)).json()).itens;
      expect(itens.map((i: { id: string }) => i.id), q).not.toContain(sb.id);
    }
    expect((await (await minhas("?status=aceita", a.cookie)).json()).itens).toEqual([]);
    expect((await (await minhas("?status=pendente", a.cookie)).json()).itens).toHaveLength(1);
    expect((await minhas("?status=x", a.cookie)).status).toBe(422);
  });

  it("paginação por cursor estável com empates; limite 51 dá 422; cursor adulterado dá 400; mais recentes primeiro", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const outraSlug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) ids.push((await sugerir(slug, m)).id);
    avancar(1000);
    for (let i = 0; i < 2; i++) ids.push((await sugerir(outraSlug, m)).id);

    const vistos: string[] = [];
    let cursor: string | null = null;
    let paginas = 0;
    do {
      const r: Response = await minhas(`?limite=2${cursor ? `&cursor=${cursor}` : ""}`, m.cookie);
      const c: { itens: { id: string }[]; proximoCursor: string | null } = await r.json();
      vistos.push(...c.itens.map((i) => i.id));
      cursor = c.proximoCursor;
      paginas += 1;
    } while (cursor && paginas < 10);
    expect(paginas).toBe(3);
    expect(new Set(vistos).size).toBe(5);
    expect([...vistos].sort()).toEqual([...ids].sort());
    // Mais recentes primeiro: o instante maior (2 itens da outra investigação) vem antes.
    expect(new Set(vistos.slice(0, 2))).toEqual(new Set(ids.slice(3)));
    expect((await minhas("?limite=51", m.cookie)).status).toBe(422);
    expect((await minhas("?cursor=xx!", m.cookie)).status).toBe(400);
    const forjado = Buffer.from(JSON.stringify({ criadoEm: "lixo", id: "lixo" })).toString("base64url");
    expect((await minhas(`?cursor=${forjado}`, m.cookie)).status).toBe(400);
  });
});

describe("concorrência (PostgreSQL real)", () => {
  it("5 aceitar x 5 recusar simultâneos sobre a mesma sugestão: uma só decisão final, sem efeitos duplicados", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const mods: Membro[] = [];
    for (let i = 0; i < 2; i++) {
      const x = await registrarMembro(auth);
      await papel(x, "moderador");
      mods.push(x);
    }
    const s = await sugerir(slug, m);
    const atores = [dono, ...mods];
    const respostas = await Promise.all(
      Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? aceitar(slug, s.id, atores[i % 3].cookie) : recusar(slug, s.id, { motivo: "Concorrente" }, atores[i % 3].cookie))),
    );
    const status = respostas.map((r) => r.status);
    expect(status.every((x) => x === 200 || x === 409)).toBe(true);
    const final = (await banco.pool.query("select status, decidida_por_id, motivo_recusa from evidencias where id=$1", [s.id])).rows[0];
    expect(["aceita", "recusada"]).toContain(final.status);
    // Todas as respostas 200 descrevem a decisão vencedora; as contrárias foram 409.
    for (const r of respostas) if (r.status === 200) expect((await r.json()).status).toBe(final.status);
    expect(status.filter((x) => x === 200).length).toBeGreaterThanOrEqual(5);
    // Efeitos únicos: no máximo uma auditoria, um histórico de aceitação, coerentes com a decisão.
    const aud = await contar("auditoria", "alvo_id=$1", [s.id]);
    const hist = (await historico(slug)).filter((i) => i.titulo === "Evidência adicionada").length;
    if (final.status === "aceita") expect(hist).toBe(1);
    else expect(hist).toBe(0);
    const decididoPorMod = mods.some((x) => x.id === final.decidida_por_id);
    expect(aud).toBe(decididoPorMod ? 1 : 0);
  });

  it("envios simultâneos respeitam o teto de 10 pendentes (6 já existentes + 8 simultâneos = 4 criados e 4 conflitos)", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrirInvestigacao(dono);
    const m = await registrarMembro(auth);
    const invId = (await banco.pool.query("select id from investigacoes where slug=$1", [slug])).rows[0].id;
    for (let i = 0; i < 6; i++) {
      await banco.pool.query("insert into evidencias (investigacao_id, autor_id, origem, titulo, descricao) values ($1,$2,'referencia_textual',$3,'Descrição pré-existente.')", [invId, m.id, `Pré ${i}`]);
    }
    const respostas = await Promise.all(Array.from({ length: 8 }, () => enviar(slug, ev(), m.cookie)));
    const status = respostas.map((r) => r.status).sort();
    expect(status).toEqual([201, 201, 201, 201, 409, 409, 409, 409]);
    expect(await contar("evidencias", "autor_id=$1 and investigacao_id=$2 and status='pendente'", [m.id, invId])).toBe(10);
  });
});
