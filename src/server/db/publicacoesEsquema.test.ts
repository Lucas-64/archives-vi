import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { TAGS_TEMATICAS } from "../../constants/tagsTematicas";
import { codigoPg, criarBancoDeTeste, type BancoDeTeste } from "../testes/banco";
import { publicacaoTags, publicacaoTermos, publicacoes, usuarios } from "./esquema";

let banco: BancoDeTeste;
let autorId: string;
let n = 0;

function nova(sobrescrever: Partial<typeof publicacoes.$inferInsert> = {}): typeof publicacoes.$inferInsert {
  n += 1;
  return { slug: `teoria-${n}`, titulo: `Teoria ${n}`, resumo: "Resumo", corpo: "Corpo", tipo: "teoria", autorId, ...sobrescrever };
}
const falha = (codigo: string) => (erro: unknown) => codigoPg(erro) === codigo;

beforeAll(async () => {
  banco = await criarBancoDeTeste();
  const [u] = await banco.db
    .insert(usuarios)
    .values({ usuario: "autor_teste", email: "autor@exemplo.com", senhaHash: "x", nome: "Autor" })
    .returning();
  autorId = u.id;
});
afterAll(async () => {
  await banco?.encerrar();
});

describe("migração 0002_publicacoes", () => {
  it("cria as quatro tabelas", async () => {
    const { rows } = await banco.pool.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public'",
    );
    const nomes = rows.map((r) => r.table_name);
    for (const t of ["tags", "publicacoes", "publicacao_tags", "publicacao_termos"]) expect(nomes).toContain(t);
  });

  it("o catálogo de tags é idêntico ao do front (ids, rótulos e ordem)", async () => {
    const { rows } = await banco.pool.query<{ id: string; rotulo: string }>("select id, rotulo from tags");
    const doBanco = new Map(rows.map((r) => [r.id, r.rotulo]));
    expect(doBanco.size).toBe(TAGS_TEMATICAS.length);
    for (const tag of TAGS_TEMATICAS) expect(doBanco.get(tag.id)).toBe(tag.rotulo);
  });
});

describe("publicacoes: restrições", () => {
  it("aplica padrões: status publicado, data civil em São Paulo, instantes em UTC", async () => {
    const [p] = await banco.db.insert(publicacoes).values(nova()).returning();
    expect(p.status).toBe("publicado");
    expect(p.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(p.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(p.criadoEm).toBeInstanceOf(Date);
  });

  it("slug duplicado dá 23505 na restrição publicacoes_slug_unique", async () => {
    await banco.db.insert(publicacoes).values(nova({ slug: "repetido" }));
    await expect(banco.db.insert(publicacoes).values(nova({ slug: "repetido" }))).rejects.toSatisfy(falha("23505"));
  });

  it.each([
    ["slug com maiúscula", { slug: "Invalido" }],
    ["slug com espaço", { slug: "in valido" }],
    ["título curto", { titulo: "ab" }],
    ["resumo vazio", { resumo: "" }],
    ["resumo acima de 200", { resumo: "a".repeat(201) }],
    ["corpo acima de 2000", { corpo: "a".repeat(2001) }],
    ["tipo desconhecido", { tipo: "outro" as never }],
    ["status desconhecido", { status: "rascunho" as never }],
  ])("rejeita %s (23514)", async (_nome, extra) => {
    await expect(banco.db.insert(publicacoes).values(nova(extra))).rejects.toSatisfy(falha("23514"));
  });

  it("corpo pode ser nulo (investigações)", async () => {
    await expect(banco.db.insert(publicacoes).values(nova({ corpo: null, tipo: "investigacao" }))).resolves.toBeDefined();
  });

  it("o autor não pode ser apagado enquanto tiver publicações (RESTRICT, 23503)", async () => {
    await expect(banco.pool.query("delete from usuarios where id = $1", [autorId])).rejects.toSatisfy(falha("23503"));
  });
});

describe("tags e termos", () => {
  it("rejeita tema fora do catálogo (23503) e par duplicado (23505)", async () => {
    const [p] = await banco.db.insert(publicacoes).values(nova()).returning();
    await expect(banco.db.insert(publicacaoTags).values({ publicacaoId: p.id, tagId: "inexistente" })).rejects.toSatisfy(falha("23503"));
    await banco.db.insert(publicacaoTags).values({ publicacaoId: p.id, tagId: "locais-mapas" });
    await expect(banco.db.insert(publicacaoTags).values({ publicacaoId: p.id, tagId: "locais-mapas" })).rejects.toSatisfy(falha("23505"));
  });

  it("apagar a publicação apaga temas e termos (CASCADE)", async () => {
    const [p] = await banco.db.insert(publicacoes).values(nova()).returning();
    await banco.db.insert(publicacaoTags).values({ publicacaoId: p.id, tagId: "locais-mapas" });
    await banco.db.insert(publicacaoTermos).values({ publicacaoId: p.id, ordem: 0, termo: "farol" });
    await banco.pool.query("delete from publicacoes where id = $1", [p.id]);
    const t = await banco.pool.query("select 1 from publicacao_tags where publicacao_id = $1", [p.id]);
    const m = await banco.pool.query("select 1 from publicacao_termos where publicacao_id = $1", [p.id]);
    expect(t.rowCount).toBe(0);
    expect(m.rowCount).toBe(0);
  });

  it("termo vazio ou longo demais é rejeitado (23514)", async () => {
    const [p] = await banco.db.insert(publicacoes).values(nova()).returning();
    await expect(banco.db.insert(publicacaoTermos).values({ publicacaoId: p.id, ordem: 0, termo: "" })).rejects.toSatisfy(falha("23514"));
    await expect(banco.db.insert(publicacaoTermos).values({ publicacaoId: p.id, ordem: 1, termo: "a".repeat(61) })).rejects.toSatisfy(falha("23514"));
  });
});
