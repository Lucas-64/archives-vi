import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarManipuladoresAuth } from "../auth/rotas";
import { criarManipuladoresEvidencias } from "../evidencias/rotas";
import { criarManipuladoresInvestigacoes } from "../investigacoes/rotas";
import { criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { req, registrarMembro, unico, type Membro } from "../testes/http";
import { criarManipuladoresModeracao } from "./rotas";

const BARATO = { N: 1024, r: 8, p: 1 };
const STATUS = ["investigating", "confirmed", "debunked", "classified", "community"] as const;

let banco: BancoDeTeste;
let relogio = new Date("2026-10-20T15:00:00Z");
const avancar = (ms = 1000) => {
  relogio = new Date(relogio.getTime() + ms);
};
let auth: ReturnType<typeof criarManipuladoresAuth>;
let inv: ReturnType<typeof criarManipuladoresInvestigacoes>;
let evid: ReturnType<typeof criarManipuladoresEvidencias>;
let mod: ReturnType<typeof criarManipuladoresModeracao>;

const ctxSlug = (slug: string) => ({ params: Promise.resolve({ slug }) });
const ctxUsuario = (usuario: string) => ({ params: Promise.resolve({ usuario }) });
const base = (slug: string) => `/api/v1/investigacoes/${slug}`;

const mudarStatus = (slug: string, corpo: unknown, cookie?: string, semCsrf = false) =>
  mod.mudarStatus(req("PATCH", `/api/v1/mod/investigacoes/${slug}/status`, { corpo, cookie, semCsrf }), ctxSlug(slug));
const mudarPapel = (usuario: string, corpo: unknown, cookie?: string) =>
  mod.mudarPapel(req("PATCH", `/api/v1/admin/usuarios/${usuario}/papel`, { corpo, cookie }), ctxUsuario(usuario));
const auditoria = (q = "", cookie?: string) => mod.auditoria(req("GET", `/api/v1/mod/auditoria${q}`, { cookie }), undefined);
const detalhe = async (slug: string, cookie?: string) => (await inv.detalhe(req("GET", base(slug), { cookie }), ctxSlug(slug))).json();
const historico = async (slug: string) => (await (await inv.historico(req("GET", `${base(slug)}/historico?limite=50`), ctxSlug(slug))).json()).itens as { titulo: string; resumo: string }[];

const nova = () => ({
  titulo: `Investigação ${unico()}`,
  descricao: "Descrição com mais de vinte caracteres, para passar na validação.",
  categoria: "symbol",
  teoria: { hipotese: "Hipótese com mais de vinte caracteres, para passar na validação.", argumentosFavoraveis: ["a"], perguntaCentral: "Isto é coincidência?", fontes: [] },
});
async function abrir(dono: Membro) {
  const r = await inv.criar(req("POST", "/api/v1/investigacoes", { corpo: nova(), cookie: dono.cookie }), undefined);
  expect(r.status).toBe(201);
  return (await r.json()).slug as string;
}
const papel = (m: Membro, p: string) => banco.pool.query("update usuarios set papel=$2 where id=$1", [m.id, p]);
async function comPapel(p: "moderador" | "admin") {
  const m = await registrarMembro(auth);
  await papel(m, p);
  return m;
}
const linhaInv = async (slug: string) => (await banco.pool.query("select * from investigacoes where slug=$1", [slug])).rows[0];
const auditoriaDe = async (alvoId: string) => (await banco.pool.query("select * from auditoria where alvo_id=$1 order by criado_em, id", [alvoId])).rows;
const contar = async (tabela: string, onde = "true", args: unknown[] = []) =>
  (await banco.pool.query(`select count(*)::int n from ${tabela} where ${onde}`, args)).rows[0].n as number;
const MOTIVO = "Motivo editorial válido.";

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const opcoes = { obterDb: () => banco.db, agora: () => relogio, producao: false };
  auth = criarManipuladoresAuth({ ...opcoes, parametrosSenha: BARATO });
  inv = criarManipuladoresInvestigacoes(opcoes);
  evid = criarManipuladoresEvidencias(opcoes);
  mod = criarManipuladoresModeracao(opcoes);
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("PATCH /mod/investigacoes/{slug}/status: autorização", () => {
  it("visitante 401; membro 403; responsável SEM papel 403; moderador na própria 403; CSRF 403; nada muda", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const membro = await registrarMembro(auth);
    const moderadorDono = await comPapel("moderador");
    const slugDoMod = await abrir(moderadorDono);
    const moderador = await comPapel("moderador");
    const corpo = { status: "confirmed", motivo: MOTIVO };
    const antes = await contar("auditoria");

    expect((await mudarStatus(slug, corpo)).status).toBe(401);
    expect((await mudarStatus(slug, corpo, "sessao=invalida")).status).toBe(401);
    expect((await mudarStatus(slug, corpo, membro.cookie)).status).toBe(403);
    expect((await mudarStatus(slug, corpo, dono.cookie)).status).toBe(403); // responsável não tem poder de status
    expect((await mudarStatus(slugDoMod, corpo, moderadorDono.cookie)).status).toBe(403); // nem na própria
    expect((await mudarStatus(slug, corpo, moderador.cookie, true)).status).toBe(403);
    expect((await linhaInv(slug)).status).toBe("investigating");
    expect((await linhaInv(slugDoMod)).status).toBe("investigating");
    expect(await contar("auditoria")).toBe(antes);

    // O administrador autor também não muda a própria.
    await papel(moderadorDono, "admin");
    expect((await mudarStatus(slugDoMod, corpo, moderadorDono.cookie)).status).toBe(403);
    // Outros moderadores e administradores podem.
    expect((await mudarStatus(slugDoMod, corpo, moderador.cookie)).status).toBe(200);
    expect((await mudarStatus(slug, { status: "debunked", motivo: MOTIVO }, moderadorDono.cookie)).status).toBe(200);
  });

  it("sessão é verificada antes do corpo (visitante com lixo: 401); papel vem do banco, não da sessão", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const r = await mod.mudarStatus(req("PATCH", `/api/v1/mod/investigacoes/${slug}/status`, { bruto: "{lixo" }), ctxSlug(slug));
    expect(r.status).toBe(401);
    const m = await registrarMembro(auth);
    expect((await mudarStatus(slug, { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(403);
    await papel(m, "moderador"); // mesma sessão, papel novo no banco
    expect((await mudarStatus(slug, { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(200);
    await papel(m, "membro");
    expect((await mudarStatus(slug, { status: "debunked", motivo: MOTIVO }, m.cookie)).status).toBe(403);
  });

  it("investigação inexistente e slug malformado: 404", async () => {
    const m = await comPapel("moderador");
    expect((await mudarStatus("nao-existe", { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(404);
    expect((await mudarStatus("Slug Inválido", { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(404);
  });
});

describe("PATCH /mod/investigacoes/{slug}/status: regras", () => {
  it("valida status e motivo (5 a 300) e recusa campos extras, sem gravar nem auditar", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const m = await comPapel("moderador");
    const antes = await contar("auditoria");
    const ruins: unknown[] = [
      { status: "confirmed" },
      { motivo: MOTIVO },
      { status: "confirmed", motivo: "" },
      { status: "confirmed", motivo: "    " },
      { status: "confirmed", motivo: "curt" },
      { status: "confirmed", motivo: "x".repeat(301) },
      { status: "confirmed", motivo: 5 },
      { status: "aberta", motivo: MOTIVO },
      { status: "em_andamento", motivo: MOTIVO },
      { status: "confirmed", motivo: MOTIVO, estado: "contestada" },
      { status: "confirmed", motivo: MOTIVO, encerradaPeloAutor: true },
      { status: "confirmed", motivo: MOTIVO, teoria: { hipotese: "x".repeat(30) } },
      { status: "confirmed", motivo: MOTIVO, atualizadoEm: "2030-01-01T00:00:00Z" },
      { status: "confirmed", motivo: MOTIVO, titulo: "Novo" },
    ];
    for (const corpo of ruins) expect((await mudarStatus(slug, corpo, m.cookie)).status, JSON.stringify(corpo)).toBe(422);
    expect((await mudarStatus(slug, "texto", m.cookie)).status).toBe(422);
    expect((await mod.mudarStatus(req("PATCH", `/api/v1/mod/investigacoes/${slug}/status`, { bruto: "{x", cookie: m.cookie }), ctxSlug(slug))).status).toBe(400);
    expect((await linhaInv(slug)).status).toBe("investigating");
    expect(await contar("auditoria")).toBe(antes);
    // Limites exatos valem.
    expect((await mudarStatus(slug, { status: "confirmed", motivo: "12345" }, m.cookie)).status).toBe(200);
    expect((await mudarStatus(slug, { status: "debunked", motivo: "x".repeat(300) }, m.cookie)).status).toBe(200);
  });

  it("qualquer transição entre os 5 status é permitida e reversível; cada uma gera exatamente uma auditoria e um histórico", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const id = (await linhaInv(slug)).id;
    const m = await comPapel("moderador");
    let atual: string = "investigating";
    let efetivas = 0;
    for (const de of STATUS) {
      for (const para of STATUS) {
        // Leva ao estado de partida (efetivo ou não), depois faz a transição testada.
        avancar(1000);
        if (atual !== de) {
          expect((await mudarStatus(slug, { status: de, motivo: MOTIVO }, m.cookie)).status).toBe(200);
          efetivas += 1;
        }
        avancar(1000);
        const r = await mudarStatus(slug, { status: para, motivo: MOTIVO }, m.cookie);
        expect(r.status, `${de} -> ${para}`).toBe(200);
        expect((await r.json()).status).toBe(para);
        if (de !== para) efetivas += 1;
        atual = para;
        if (efetivas >= 25) break;
      }
      if (efetivas >= 25) break;
    }
    expect(efetivas).toBeGreaterThanOrEqual(20);
    const aud = (await auditoriaDe(id)).filter((a) => a.acao === "investigacao.status");
    expect(aud).toHaveLength(efetivas);
    expect((await historico(slug)).filter((h) => h.titulo === "Status alterado")).toHaveLength(efetivas);
    // Cada registro tem antes e depois diferentes.
    for (const a of aud) expect(a.antes.status).not.toBe(a.depois.status);
  });

  it("repetir o status atual é 200 idempotente: sem auditoria, sem histórico, sem tocar a linha", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const m = await comPapel("moderador");
    const id = (await linhaInv(slug)).id;
    expect((await mudarStatus(slug, { status: "investigating", motivo: MOTIVO }, m.cookie)).status).toBe(200);
    expect(await auditoriaDe(id)).toHaveLength(0);
    avancar(1000);
    expect((await mudarStatus(slug, { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(200);
    const linha = await linhaInv(slug);
    const histAntes = await historico(slug);
    avancar(1000);
    expect((await mudarStatus(slug, { status: "confirmed", motivo: "Outro motivo qualquer." }, m.cookie)).status).toBe(200);
    expect(await linhaInv(slug)).toEqual(linha);
    expect(await auditoriaDe(id)).toHaveLength(1);
    expect(await historico(slug)).toEqual(histAntes);
  });

  it("muda SOMENTE o status: atualizado_em, estado, encerramento, teoria, tags e ordem da lista ficam intactos", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slugA = await abrir(dono);
    avancar(1000);
    const slugB = await abrir(dono);
    const m = await comPapel("moderador");
    const antes = await linhaInv(slugA);
    const ordemAntes = (await (await inv.listar(req("GET", "/api/v1/investigacoes?limite=50"), undefined)).json()).itens.map((i: { slug: string }) => i.slug);
    avancar(60_000);
    expect((await mudarStatus(slugA, { status: "classified", motivo: MOTIVO }, m.cookie)).status).toBe(200);
    const depois = await linhaInv(slugA);
    expect({ ...depois, status: antes.status }).toEqual(antes);
    expect(depois.status).toBe("classified");
    const ordemDepois = (await (await inv.listar(req("GET", "/api/v1/investigacoes?limite=50"), undefined)).json()).itens.map((i: { slug: string }) => i.slug);
    expect(ordemDepois).toEqual(ordemAntes);
    expect(ordemDepois.indexOf(slugB)).toBeLessThan(ordemDepois.indexOf(slugA));
    // O novo status aparece na lista e no detalhe.
    expect((await detalhe(slugA)).status).toBe("classified");
    // O responsável continua sem poder sobre o status e a moderação não consegue editar, mudar estado ou encerrar por aqui.
    expect(await contar("investigacao_historico", "tipo in ('estado','encerrada','teoria') and investigacao_id=$1", [antes.id])).toBe(0);
  });

  it("histórico público registra só 'De X para Y.' (sem motivo); a auditoria guarda ator, antes, depois e motivo, sem dados privados", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const m = await comPapel("moderador");
    const segredo = "Motivo interno confidencial da moderação";
    expect((await mudarStatus(slug, { status: "debunked", motivo: segredo }, m.cookie)).status).toBe(200);
    const hist = await historico(slug);
    expect(hist).toContainEqual(expect.objectContaining({ titulo: "Status alterado", resumo: "De investigating para debunked." }));
    expect(JSON.stringify(hist)).not.toContain(segredo);
    expect(JSON.stringify(await detalhe(slug))).not.toContain(segredo);
    const [reg] = await auditoriaDe((await linhaInv(slug)).id);
    expect(reg).toMatchObject({ acao: "investigacao.status", ator_id: m.id, ator_rotulo: null, alvo_tipo: "investigacao", antes: { status: "investigating" }, depois: { status: "debunked" }, motivo: segredo });
    for (const proibido of [m.email, dono.email, "senha", "hash"]) expect(JSON.stringify(reg)).not.toContain(proibido);
  });

  it("falha na auditoria desfaz a mudança de status e o histórico (transação única)", async () => {
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const m = await comPapel("moderador");
    const histAntes = await historico(slug);
    await banco.pool.query(`create function falhar_auditoria() returns trigger language plpgsql as $$ begin raise exception 'falha simulada'; end $$`);
    await banco.pool.query("create trigger auditoria_falha_teste before insert on auditoria for each row execute function falhar_auditoria()");
    try {
      expect((await mudarStatus(slug, { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(500);
      expect((await linhaInv(slug)).status).toBe("investigating");
      expect(await historico(slug)).toEqual(histAntes);
    } finally {
      await banco.pool.query("drop trigger auditoria_falha_teste on auditoria");
      await banco.pool.query("drop function falhar_auditoria()");
    }
    expect((await mudarStatus(slug, { status: "confirmed", motivo: MOTIVO }, m.cookie)).status).toBe(200);
  });

  it("limite de 30 ações por minuto por moderador responde 429", async () => {
    avancar(120_000);
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const m = await comPapel("moderador");
    for (let i = 0; i < 30; i++) expect((await mudarStatus(slug, { status: "investigating", motivo: MOTIVO }, m.cookie)).status).toBe(200);
    const r = await mudarStatus(slug, { status: "investigating", motivo: MOTIVO }, m.cookie);
    expect(r.status).toBe(429);
    expect(r.headers.get("retry-after")).toBeTruthy();
  });
});

describe("PATCH /admin/usuarios/{usuario}/papel", () => {
  it("visitante 401; membro e moderador 403; só o administrador altera; CSRF 403", async () => {
    const alvo = await registrarMembro(auth);
    const membro = await registrarMembro(auth);
    const moderador = await comPapel("moderador");
    const adm = await comPapel("admin");
    const corpo = { papel: "moderador", motivo: MOTIVO };
    expect((await mudarPapel(alvo.usuario, corpo)).status).toBe(401);
    expect((await mudarPapel(alvo.usuario, corpo, membro.cookie)).status).toBe(403);
    expect((await mudarPapel(alvo.usuario, corpo, moderador.cookie)).status).toBe(403);
    expect((await mod.mudarPapel(req("PATCH", `/api/v1/admin/usuarios/${alvo.usuario}/papel`, { corpo, cookie: adm.cookie, semCsrf: true }), ctxUsuario(alvo.usuario))).status).toBe(403);
    expect((await banco.pool.query("select papel from usuarios where id=$1", [alvo.id])).rows[0].papel).toBe("membro");
    expect((await mudarPapel(alvo.usuario, corpo, adm.cookie)).status).toBe(200);
  });

  it("promove e rebaixa entre membro e moderador, com efeito imediato e auditoria completa", async () => {
    const adm = await comPapel("admin");
    const alvo = await registrarMembro(auth);
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const corpoStatus = { status: "confirmed", motivo: MOTIVO };
    expect((await mudarStatus(slug, corpoStatus, alvo.cookie)).status).toBe(403);

    const r = await mudarPapel(alvo.usuario, { papel: "moderador", motivo: "Confiança da comunidade." }, adm.cookie);
    const c = await r.json();
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    expect(c).toEqual({ usuario: alvo.usuario, nome: alvo.usuario, papel: "moderador" });
    expect(JSON.stringify(c)).not.toContain(alvo.email);
    expect((await mudarStatus(slug, corpoStatus, alvo.cookie)).status).toBe(200); // mesma sessão, efeito imediato

    avancar(1000);
    expect((await mudarPapel(alvo.usuario, { papel: "membro", motivo: "Pediu para sair." }, adm.cookie)).status).toBe(200);
    expect((await mudarStatus(slug, { status: "debunked", motivo: MOTIVO }, alvo.cookie)).status).toBe(403);

    const aud = await auditoriaDe(alvo.id);
    expect(aud).toHaveLength(2);
    expect(aud[0]).toMatchObject({ acao: "usuario.papel", ator_id: adm.id, alvo_tipo: "usuario", antes: { papel: "membro" }, depois: { papel: "moderador" }, motivo: "Confiança da comunidade." });
    expect(aud[1]).toMatchObject({ antes: { papel: "moderador" }, depois: { papel: "membro" }, motivo: "Pediu para sair." });
    for (const a of aud) for (const proibido of [alvo.email, adm.email, "senha", "hash", "token"]) expect(JSON.stringify(a)).not.toContain(proibido);
  });

  it("nenhum caminho HTTP concede admin: 'admin' e outros valores dão 422 e nada muda", async () => {
    const adm = await comPapel("admin");
    const alvo = await registrarMembro(auth);
    const antes = await contar("auditoria");
    for (const papelRuim of ["admin", "Admin", "superadmin", "", null, 1]) {
      expect((await mudarPapel(alvo.usuario, { papel: papelRuim, motivo: MOTIVO }, adm.cookie)).status, String(papelRuim)).toBe(422);
    }
    expect((await mudarPapel(alvo.usuario, { papel: "moderador", motivo: MOTIVO, admin: true }, adm.cookie)).status).toBe(422);
    expect((await mudarPapel(alvo.usuario, { papel: "moderador" }, adm.cookie)).status).toBe(422);
    expect((await mudarPapel(alvo.usuario, { papel: "moderador", motivo: "curt" }, adm.cookie)).status).toBe(422);
    expect((await mudarPapel(alvo.usuario, { papel: "moderador", motivo: "x".repeat(301) }, adm.cookie)).status).toBe(422);
    expect((await banco.pool.query("select papel from usuarios where id=$1", [alvo.id])).rows[0].papel).toBe("membro");
    expect(await contar("auditoria")).toBe(antes);
  });

  it("administrador não altera o próprio papel nem o de outro administrador (403); alvo inexistente ou malformado 404", async () => {
    const adm = await comPapel("admin");
    const outroAdm = await comPapel("admin");
    // Cobertura específica da proteção do próprio papel: a checagem roda ANTES da de "papel de administrador"
    // e cada uma tem a sua mensagem, então remover só a primeira muda a mensagem e é detectado aqui.
    const proprio = await mudarPapel(adm.usuario, { papel: "membro", motivo: MOTIVO }, adm.cookie);
    expect(proprio.status).toBe(403);
    expect((await proprio.json()).erro.mensagem).toBe("Você não pode alterar o próprio papel.");
    const deOutro = await mudarPapel(outroAdm.usuario, { papel: "membro", motivo: MOTIVO }, adm.cookie);
    expect(deOutro.status).toBe(403);
    expect((await deOutro.json()).erro.mensagem).toBe("O papel de um administrador não pode ser alterado por aqui.");
    expect((await mudarPapel(outroAdm.usuario, { papel: "moderador", motivo: MOTIVO }, adm.cookie)).status).toBe(403);
    expect((await banco.pool.query("select papel from usuarios where id in ($1,$2)", [adm.id, outroAdm.id])).rows.map((r) => r.papel)).toEqual(["admin", "admin"]);
    expect((await mudarPapel("nao_existe_ninguem", { papel: "moderador", motivo: MOTIVO }, adm.cookie)).status).toBe(404);
    expect((await mudarPapel("Nome Inválido!", { papel: "moderador", motivo: MOTIVO }, adm.cookie)).status).toBe(404);
  });

  it("repetir o papel atual é 200 sem auditoria; administrador rebaixado por SQL perde o acesso na mesma sessão", async () => {
    const adm = await comPapel("admin");
    const alvo = await registrarMembro(auth);
    expect((await mudarPapel(alvo.usuario, { papel: "membro", motivo: MOTIVO }, adm.cookie)).status).toBe(200);
    expect(await auditoriaDe(alvo.id)).toHaveLength(0);
    await papel(adm, "moderador");
    expect((await mudarPapel(alvo.usuario, { papel: "moderador", motivo: MOTIVO }, adm.cookie)).status).toBe(403);
    expect((await banco.pool.query("select papel from usuarios where id=$1", [alvo.id])).rows[0].papel).toBe("membro");
  });

  it("falha na auditoria desfaz a troca de papel", async () => {
    const adm = await comPapel("admin");
    const alvo = await registrarMembro(auth);
    await banco.pool.query(`create function falhar_auditoria() returns trigger language plpgsql as $$ begin raise exception 'falha simulada'; end $$`);
    await banco.pool.query("create trigger auditoria_falha_teste before insert on auditoria for each row execute function falhar_auditoria()");
    try {
      expect((await mudarPapel(alvo.usuario, { papel: "moderador", motivo: MOTIVO }, adm.cookie)).status).toBe(500);
      expect((await banco.pool.query("select papel from usuarios where id=$1", [alvo.id])).rows[0].papel).toBe("membro");
    } finally {
      await banco.pool.query("drop trigger auditoria_falha_teste on auditoria");
      await banco.pool.query("drop function falhar_auditoria()");
    }
  });
});

describe("GET /mod/auditoria", () => {
  it("só o administrador lê: visitante 401, membro e moderador 403", async () => {
    const membro = await registrarMembro(auth);
    const moderador = await comPapel("moderador");
    const adm = await comPapel("admin");
    expect((await auditoria()).status).toBe(401);
    expect((await auditoria("", membro.cookie)).status).toBe(403);
    expect((await auditoria("", moderador.cookie)).status).toBe(403);
    const r = await auditoria("", adm.cookie);
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
  });

  it("filtra por ação e alvo, ordena do mais recente ao mais antigo, mostra o ator e não vaza e-mail, hash nem token", async () => {
    avancar(300_000);
    const adm = await comPapel("admin");
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const alvo = await registrarMembro(auth);
    const m = await comPapel("moderador");
    const remetente = await registrarMembro(auth);
    const s = await (await evid.criar(req("POST", `${base(slug)}/evidencias`, { corpo: { origem: "referencia_textual", titulo: "Sugestão", descricao: "Descrição da sugestão." }, cookie: remetente.cookie }), ctxSlug(slug))).json();
    avancar(1000);
    await mudarStatus(slug, { status: "confirmed", motivo: MOTIVO }, m.cookie);
    avancar(1000);
    await evid.aceitar(req("POST", `${base(slug)}/sugestoes/${s.id}/aceitar`, { cookie: m.cookie }), { params: Promise.resolve({ slug, id: s.id }) });
    avancar(1000);
    await mudarPapel(alvo.usuario, { papel: "moderador", motivo: MOTIVO }, adm.cookie);

    const todos = await (await auditoria("?limite=50", adm.cookie)).json();
    const acoes = todos.itens.map((i: { acao: string }) => i.acao);
    expect(acoes.slice(0, 3)).toEqual(["usuario.papel", "evidencia.aceitar", "investigacao.status"]);
    expect(todos.itens[0]).toMatchObject({ ator: { usuario: adm.usuario }, alvo: { tipo: "usuario", id: alvo.id }, antes: { papel: "membro" }, depois: { papel: "moderador" }, motivo: MOTIVO });
    const texto = JSON.stringify(todos);
    for (const proibido of [adm.email, m.email, alvo.email, dono.email, remetente.email, "senha_hash", "token"]) expect(texto, proibido).not.toContain(proibido);

    const so = async (q: string) => (await (await auditoria(q, adm.cookie)).json()).itens;
    expect((await so("?acao=investigacao.status")).every((i: { acao: string }) => i.acao === "investigacao.status")).toBe(true);
    expect((await so("?acao=usuario.papel&alvoTipo=usuario")).length).toBeGreaterThan(0);
    expect(await so("?acao=usuario.papel&alvoTipo=evidencia")).toEqual([]);
    expect((await so("?alvoTipo=evidencia")).every((i: { alvo: { tipo: string } }) => i.alvo.tipo === "evidencia")).toBe(true);
    expect((await auditoria("?acao=outra", adm.cookie)).status).toBe(422);
    expect((await auditoria("?alvoTipo=outro", adm.cookie)).status).toBe(422);
  });

  it("paginação estável com empates de instante; limite 51 dá 422; cursor adulterado dá 400", async () => {
    avancar(300_000);
    const adm = await comPapel("admin");
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const m = await comPapel("moderador");
    // Cinco registros no MESMO instante (relógio parado) para a investigação.
    const alternar = ["confirmed", "debunked", "classified", "community", "investigating"];
    for (const status of alternar) expect((await mudarStatus(slug, { status, motivo: MOTIVO }, m.cookie)).status).toBe(200);
    const id = (await linhaInv(slug)).id;
    const esperados = (await auditoriaDe(id)).map((a) => a.id as string);
    expect(esperados).toHaveLength(5);

    const vistos: string[] = [];
    let cursor: string | null = null;
    let paginas = 0;
    do {
      const r: Response = await auditoria(`?limite=2&acao=investigacao.status${cursor ? `&cursor=${cursor}` : ""}`, adm.cookie);
      const c: { itens: { id: string; alvo: { id: string } }[]; proximoCursor: string | null } = await r.json();
      vistos.push(...c.itens.filter((i) => i.alvo.id === id).map((i) => i.id));
      cursor = c.proximoCursor;
      paginas += 1;
    } while (cursor && paginas < 100);
    expect(new Set(vistos).size).toBe(vistos.length);
    expect([...vistos].sort()).toEqual([...esperados].sort());
    expect((await auditoria("?limite=51", adm.cookie)).status).toBe(422);
    expect((await auditoria("?cursor=lixo!", adm.cookie)).status).toBe(400);
    const forjado = Buffer.from(JSON.stringify({ criadoEm: "x", id: "y" })).toString("base64url");
    expect((await auditoria(`?cursor=${forjado}`, adm.cookie)).status).toBe(400);
  });
});

describe("concorrência (PostgreSQL real)", () => {
  it("mudanças de status simultâneas deixam uma cadeia de auditoria coerente com o status final", async () => {
    avancar(300_000);
    const dono = await registrarMembro(auth);
    const slug = await abrir(dono);
    const id = (await linhaInv(slug)).id;
    const mods = [await comPapel("moderador"), await comPapel("moderador"), await comPapel("admin")];
    const alvos = ["confirmed", "debunked", "classified", "community", "investigating", "confirmed", "debunked", "classified", "community", "confirmed"];
    const respostas = await Promise.all(alvos.map((status, i) => mudarStatus(slug, { status, motivo: MOTIVO }, mods[i % 3].cookie)));
    expect(respostas.map((r) => r.status).every((s) => s === 200)).toBe(true);

    const final = (await linhaInv(slug)).status as string;
    const aud = await auditoriaDe(id);
    // Cada auditoria é uma transição efetiva; o histórico público tem o mesmo número de registros.
    expect(aud.every((a) => a.antes.status !== a.depois.status)).toBe(true);
    expect((await historico(slug)).filter((h) => h.titulo === "Status alterado")).toHaveLength(aud.length);
    // Cadeia: investigating -> ... -> final, cada aresta usada uma vez. Em uma trilha contínua, saída menos
    // entrada é +1 na origem, -1 no destino e 0 nos demais. Falha se duas escritas leram o mesmo "antes".
    const saldo = new Map<string, number>();
    for (const a of aud) {
      saldo.set(a.antes.status, (saldo.get(a.antes.status) ?? 0) + 1);
      saldo.set(a.depois.status, (saldo.get(a.depois.status) ?? 0) - 1);
    }
    const esperado = new Map<string, number>();
    if (final !== "investigating") {
      esperado.set("investigating", 1);
      esperado.set(final, -1);
    }
    for (const s of STATUS) expect(saldo.get(s) ?? 0, s).toBe(esperado.get(s) ?? 0);
    expect(aud.length).toBeGreaterThanOrEqual(1);
  });
});
