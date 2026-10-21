import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { restricaoPg } from "./erros";
import { codigoPg, criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { auditoria, evidencias, investigacaoHistorico, investigacoes, usuarios } from "./esquema";

let banco: BancoDeTeste;
let autorId: string;
let outraInvId: string;
let invId: string;
let n = 0;

const novaInv = (): typeof investigacoes.$inferInsert => {
  n += 1;
  return { slug: `inv-ev-${n}`, titulo: `Investigação ${n}`, descricao: "Descrição com mais de vinte caracteres.", categoria: "symbol", hipotese: "Hipótese com mais de vinte caracteres.", perguntaCentral: "Pergunta central?", autorId };
};
const nova = (extra: Partial<typeof evidencias.$inferInsert> = {}): typeof evidencias.$inferInsert => ({
  investigacaoId: invId,
  autorId,
  origem: "referencia_textual",
  titulo: "Título válido",
  descricao: "Descrição válida da evidência.",
  ...extra,
});
// Um valor fora do conjunto pode violar mais de um CHECK; o PostgreSQL relata o primeiro em ordem alfabética.
const restricao = (nome: string | string[]) => (e: unknown) => [nome].flat().includes(restricaoPg(e) ?? "");
const falha = (c: string) => (e: unknown) => codigoPg(e) === c;
const decidida = { decididaPorId: undefined as string | undefined, decididaEm: new Date() };

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const [u] = await banco.db.insert(usuarios).values({ usuario: "autor_ev", email: "ev@exemplo.com", senhaHash: "x", nome: "Autor" }).returning();
  autorId = u.id;
  decidida.decididaPorId = u.id;
  [{ id: invId }, { id: outraInvId }] = await banco.db.insert(investigacoes).values([novaInv(), novaInv()]).returning({ id: investigacoes.id });
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("migração 0005: evidências", () => {
  it("nasce pendente, sem decisão", async () => {
    const [e] = await banco.db.insert(evidencias).values(nova()).returning();
    expect(e).toMatchObject({ status: "pendente", decididaPorId: null, decididaEm: null, motivoRecusa: null, relacionadaAId: null, fonte: null });
  });

  it.each([
    ["origem inválida", { origem: "outra" as never }, "evidencias_origem_valida"],
    ["status inválido", { status: "oculta" as never }, ["evidencias_status_valido", "evidencias_decisao_coerente"]],
    ["título curto", { titulo: "ab" }, "evidencias_titulo_tamanho"],
    ["título longo", { titulo: "x".repeat(121) }, "evidencias_titulo_tamanho"],
    ["descrição curta", { descricao: "curta" }, "evidencias_descricao_tamanho"],
    ["descrição longa", { descricao: "x".repeat(1001) }, "evidencias_descricao_tamanho"],
    ["fonte vazia", { fonte: "" }, "evidencias_fonte_tamanho"],
    ["fonte longa", { fonte: "x".repeat(301) }, "evidencias_fonte_tamanho"],
    ["motivo vazio", () => ({ status: "recusada" as const, ...decidida, motivoRecusa: "" }), "evidencias_motivo_tamanho"],
    ["motivo longo", () => ({ status: "recusada" as const, ...decidida, motivoRecusa: "x".repeat(301) }), "evidencias_motivo_tamanho"],
  ])("CHECK: %s", async (_rotulo, extra, nome) => {
    await expect(banco.db.insert(evidencias).values(nova(typeof extra === "function" ? extra() : extra))).rejects.toSatisfy(restricao(nome));
  });

  it("limites exatos são aceitos", async () => {
    await banco.db.insert(evidencias).values(nova({ titulo: "abc", descricao: "x".repeat(10), fonte: "x" }));
    await banco.db.insert(evidencias).values(nova({ titulo: "x".repeat(120), descricao: "x".repeat(1000), fonte: "x".repeat(300) }));
  });

  it("coerência da decisão: pendente com decisor, aceita sem decisor, aceita com motivo e pendente com motivo são recusadas", async () => {
    const coerente = "evidencias_decisao_coerente";
    await expect(banco.db.insert(evidencias).values(nova({ decididaPorId: autorId }))).rejects.toSatisfy(restricao(coerente));
    await expect(banco.db.insert(evidencias).values(nova({ decididaEm: new Date() }))).rejects.toSatisfy(restricao(coerente));
    await expect(banco.db.insert(evidencias).values(nova({ motivoRecusa: "x motivo" }))).rejects.toSatisfy(restricao(coerente));
    await expect(banco.db.insert(evidencias).values(nova({ status: "aceita" }))).rejects.toSatisfy(restricao(coerente));
    await expect(banco.db.insert(evidencias).values(nova({ status: "aceita", ...decidida, motivoRecusa: "não cabe" }))).rejects.toSatisfy(restricao(coerente));
    await expect(banco.db.insert(evidencias).values(nova({ status: "recusada" }))).rejects.toSatisfy(restricao(coerente));
    await banco.db.insert(evidencias).values(nova({ status: "aceita", ...decidida }));
    await banco.db.insert(evidencias).values(nova({ status: "recusada", ...decidida }));
    await banco.db.insert(evidencias).values(nova({ status: "recusada", ...decidida, motivoRecusa: "Sem fonte." }));
  });

  it("relacionada_a: mesma investigação (chave composta); outra investigação, inexistente e a própria são recusadas", async () => {
    const [alvo] = await banco.db.insert(evidencias).values(nova({ status: "aceita", ...decidida })).returning();
    const [deOutra] = await banco.db.insert(evidencias).values(nova({ investigacaoId: outraInvId, status: "aceita", ...decidida })).returning();
    const [ok] = await banco.db.insert(evidencias).values(nova({ relacionadaAId: alvo.id })).returning();
    expect(ok.relacionadaAId).toBe(alvo.id);
    await expect(banco.db.insert(evidencias).values(nova({ relacionadaAId: deOutra.id }))).rejects.toSatisfy(restricao("evidencias_relacionada_mesma_investigacao_fk"));
    await expect(banco.db.insert(evidencias).values(nova({ relacionadaAId: crypto.randomUUID() }))).rejects.toSatisfy(falha("23503"));
    await expect(banco.pool.query("update evidencias set relacionada_a_id = id where id = $1", [ok.id])).rejects.toSatisfy(restricao("evidencias_sem_autorrelacionamento"));
    // RESTRICT: a evidência referenciada não pode ser apagada.
    await expect(banco.pool.query("delete from evidencias where id = $1", [alvo.id])).rejects.toSatisfy(falha("23503"));
  });

  it("autor e decisor: RESTRICT (usuário com evidência não é apagado); investigação apagada leva as evidências (CASCADE)", async () => {
    const [u] = await banco.db.insert(usuarios).values({ usuario: "dono_inv", email: "di@exemplo.com", senhaHash: "x", nome: "Dono" }).returning();
    const [inv] = await banco.db.insert(investigacoes).values({ ...novaInv(), autorId: u.id }).returning();
    const [ev] = await banco.db.insert(evidencias).values(nova({ investigacaoId: inv.id, autorId: u.id })).returning();
    await expect(banco.pool.query("delete from usuarios where id = $1", [u.id])).rejects.toSatisfy(falha("23503"));
    const [decisor] = await banco.db.insert(usuarios).values({ usuario: "decisor_ev", email: "de@exemplo.com", senhaHash: "x", nome: "D" }).returning();
    await banco.pool.query("update evidencias set status='aceita', decidida_por_id=$1, decidida_em=now() where id=$2", [decisor.id, ev.id]);
    await expect(banco.pool.query("delete from usuarios where id = $1", [decisor.id])).rejects.toSatisfy(falha("23503"));
    await banco.pool.query("delete from investigacoes where id = $1", [inv.id]);
    expect((await banco.pool.query("select count(*)::int n from evidencias where id=$1", [ev.id])).rows[0].n).toBe(0);
  });

  it("histórico aceita os tipos evidencia e status; tipo desconhecido continua recusado", async () => {
    for (const tipo of ["evidencia", "status"] as const) {
      await banco.db.insert(investigacaoHistorico).values({ investigacaoId: invId, autorId, tipo, titulo: "t", resumo: "r" });
    }
    await expect(banco.db.insert(investigacaoHistorico).values({ investigacaoId: invId, autorId, tipo: "outro" as never, titulo: "t", resumo: "r" })).rejects.toSatisfy(restricao("investigacao_historico_tipo_valido"));
  });
});

describe("migração 0005: auditoria", () => {
  const registro = (extra: Partial<typeof auditoria.$inferInsert> = {}): typeof auditoria.$inferInsert => ({
    atorId: autorId,
    acao: "investigacao.status",
    alvoTipo: "investigacao",
    alvoId: invId,
    antes: { status: "investigating" },
    depois: { status: "confirmed" },
    motivo: "Motivo válido",
    ...extra,
  });

  it("aceita registro válido e ator de sistema (sem ator_id, com rótulo)", async () => {
    await banco.db.insert(auditoria).values(registro());
    await banco.db.insert(auditoria).values(registro({ atorId: null, atorRotulo: "cli:admin:criar", acao: "admin.bootstrap", alvoTipo: "usuario", motivo: null }));
  });

  it.each([
    ["ação inválida", { acao: "outra" as never }, "auditoria_acao_valida"],
    ["alvo inválido", { alvoTipo: "outro" as never }, "auditoria_alvo_valido"],
    ["sem ator nem rótulo", { atorId: null }, "auditoria_ator_definido"],
    ["motivo vazio", { motivo: "" }, "auditoria_motivo_tamanho"],
    ["motivo longo", { motivo: "x".repeat(301) }, "auditoria_motivo_tamanho"],
  ])("CHECK: %s", async (_r, extra, nome) => {
    await expect(banco.db.insert(auditoria).values(registro(extra))).rejects.toSatisfy(restricao(nome));
  });

  it("ator com auditoria não pode ser apagado (RESTRICT)", async () => {
    const [u] = await banco.db.insert(usuarios).values({ usuario: "mod_aud", email: "ma@exemplo.com", senhaHash: "x", nome: "M" }).returning();
    await banco.db.insert(auditoria).values(registro({ atorId: u.id }));
    await expect(banco.pool.query("delete from usuarios where id = $1", [u.id])).rejects.toSatisfy(falha("23503"));
  });

  it("é append-only: UPDATE, DELETE e TRUNCATE são recusados pelo banco e nada muda", async () => {
    await banco.db.insert(auditoria).values(registro());
    const antes = (await banco.pool.query("select count(*)::int n, min(motivo) m from auditoria")).rows[0];
    await expect(banco.pool.query("update auditoria set motivo = 'adulterado'")).rejects.toSatisfy(falha("23001"));
    await expect(banco.pool.query("delete from auditoria")).rejects.toSatisfy(falha("23001"));
    await expect(banco.pool.query("truncate auditoria")).rejects.toSatisfy(falha("23001"));
    expect((await banco.pool.query("select count(*)::int n, min(motivo) m from auditoria")).rows[0]).toEqual(antes);
  });
});
