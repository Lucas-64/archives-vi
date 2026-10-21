import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { codigoPg, criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { investigacaoHistorico, investigacaoTags, investigacoes, publicacoes, usuarios } from "./esquema";

let banco: BancoDeTeste;
let autorId: string;
let n = 0;

function nova(extra: Partial<typeof investigacoes.$inferInsert> = {}): typeof investigacoes.$inferInsert {
  n += 1;
  return {
    slug: `inv-${n}`,
    titulo: `Investigação ${n}`,
    descricao: "Descrição com mais de vinte caracteres.",
    categoria: "symbol",
    hipotese: "Hipótese com mais de vinte caracteres.",
    perguntaCentral: "Pergunta central?",
    autorId,
    ...extra,
  };
}
const falha = (c: string) => (e: unknown) => codigoPg(e) === c;

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const [u] = await banco.db.insert(usuarios).values({ usuario: "autor_inv", email: "ai@exemplo.com", senhaHash: "x", nome: "Autor" }).returning();
  autorId = u.id;
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("migração 0004_investigacoes", () => {
  it("cria as tabelas e aplica os padrões (status investigating, estado em_andamento, não encerrada)", async () => {
    const { rows } = await banco.pool.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    for (const t of ["investigacoes", "investigacao_tags", "investigacao_historico"]) expect(rows.map((r) => r.table_name)).toContain(t);
    const [i] = await banco.db.insert(investigacoes).values(nova()).returning();
    expect(i).toMatchObject({ status: "investigating", estado: "em_andamento", encerradaPeloAutor: false, argumentosFavoraveis: [], fontes: [] });
  });

  it("slug duplicado dá 23505 em investigacoes_slug_unique", async () => {
    await banco.db.insert(investigacoes).values(nova({ slug: "repetida" }));
    await expect(banco.db.insert(investigacoes).values(nova({ slug: "repetida" }))).rejects.toSatisfy(falha("23505"));
  });

  it.each([
    ["slug inválido", { slug: "Inválido" }],
    ["título curto", { titulo: "ab" }],
    ["descrição curta", { descricao: "curta" }],
    ["categoria desconhecida", { categoria: "outra" as never }],
    ["status desconhecido", { status: "aberto" as never }],
    ["estado desconhecido", { estado: "fechado" as never }],
    ["hipótese curta", { hipotese: "curta" }],
    ["pergunta curta", { perguntaCentral: "?" }],
    ["localização vazia", { localizacao: "" }],
    ["mais de 10 fontes", { fontes: Array(11).fill("f") }],
    ["mais de 10 argumentos", { argumentosFavoraveis: Array(11).fill("a") }],
  ])("rejeita %s (23514)", async (_n, extra) => {
    await expect(banco.db.insert(investigacoes).values(nova(extra))).rejects.toSatisfy(falha("23514"));
  });

  it("aceita todos os valores reais de status, estado e categoria", async () => {
    for (const status of ["investigating", "confirmed", "debunked", "classified", "community"] as const)
      await banco.db.insert(investigacoes).values(nova({ status }));
    for (const estado of ["em_andamento", "teoria_apoiada", "contestada", "inconclusiva"] as const)
      await banco.db.insert(investigacoes).values(nova({ estado }));
    for (const categoria of ["sighting", "location", "symbol", "broadcast", "phenomenon", "community-discovery"] as const)
      await banco.db.insert(investigacoes).values(nova({ categoria }));
  });

  it("temas fora do catálogo (23503), repetidos (23505) e cascata ao apagar", async () => {
    const [i] = await banco.db.insert(investigacoes).values(nova()).returning();
    await expect(banco.db.insert(investigacaoTags).values({ investigacaoId: i.id, tagId: "nao-existe" })).rejects.toSatisfy(falha("23503"));
    await banco.db.insert(investigacaoTags).values({ investigacaoId: i.id, tagId: "locais-mapas" });
    await expect(banco.db.insert(investigacaoTags).values({ investigacaoId: i.id, tagId: "locais-mapas" })).rejects.toSatisfy(falha("23505"));
    await banco.db.insert(investigacaoHistorico).values({ investigacaoId: i.id, autorId, tipo: "criada", titulo: "t", resumo: "r" });
    await banco.pool.query("delete from investigacoes where id=$1", [i.id]);
    expect((await banco.pool.query("select 1 from investigacao_tags where investigacao_id=$1", [i.id])).rowCount).toBe(0);
    expect((await banco.pool.query("select 1 from investigacao_historico where investigacao_id=$1", [i.id])).rowCount).toBe(0);
  });

  it("histórico: tipo inválido (23514) e o autor não pode ser apagado (RESTRICT, 23503)", async () => {
    const [i] = await banco.db.insert(investigacoes).values(nova()).returning();
    await expect(
      banco.db.insert(investigacaoHistorico).values({ investigacaoId: i.id, autorId, tipo: "outro" as never, titulo: "t", resumo: "r" }),
    ).rejects.toSatisfy(falha("23514"));
    await expect(banco.pool.query("delete from usuarios where id=$1", [autorId])).rejects.toSatisfy(falha("23503"));
  });

  it("publicações e investigações são tabelas separadas: o mesmo slug é aceito pelo banco (a unicidade conjunta é regra da aplicação)", async () => {
    await banco.db.insert(publicacoes).values({ slug: "mesmo-slug", titulo: "Mesmo slug", resumo: "r", corpo: "c", tipo: "teoria", autorId });
    await expect(banco.db.insert(investigacoes).values(nova({ slug: "mesmo-slug" }))).resolves.toBeDefined();
  });
});
