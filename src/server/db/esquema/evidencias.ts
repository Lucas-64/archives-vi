import { sql } from "drizzle-orm";
import { check, foreignKey, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { investigacoes } from "./investigacoes";
import { usuarios } from "./usuarios";

export const ORIGENS_EVIDENCIA = ["imagem_propria", "imagem_terceiro", "referencia_textual", "origem_nao_verificada"] as const;
export type OrigemEvidencia = (typeof ORIGENS_EVIDENCIA)[number];

// Sugestão e evidência são o mesmo registro (docs/API.md, seção 6): só `aceita` é pública.
export const STATUS_EVIDENCIA = ["pendente", "aceita", "recusada"] as const;
export type StatusEvidencia = (typeof STATUS_EVIDENCIA)[number];

const lista = (valores: readonly string[]) => sql.raw(valores.map((v) => `'${v}'`).join(", "));

export const evidencias = pgTable(
  "evidencias",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    investigacaoId: uuid("investigacao_id")
      .notNull()
      .references(() => investigacoes.id, { onDelete: "cascade" }),
    // Quem enviou. A autoria nunca muda, nem quando outra pessoa aceita.
    autorId: uuid("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    origem: text("origem", { enum: ORIGENS_EVIDENCIA }).notNull(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull(),
    fonte: text("fonte"),
    // Imagem enviada junto da evidência (URL pública do Vercel Blob, ADR-043). Opcional.
    imagemUrl: text("imagem_url"),
    status: text("status", { enum: STATUS_EVIDENCIA }).notNull().default("pendente"),
    decididaPorId: uuid("decidida_por_id").references(() => usuarios.id, { onDelete: "restrict" }),
    decididaEm: timestamp("decidida_em", { withTimezone: true }),
    motivoRecusa: text("motivo_recusa"),
    relacionadaAId: uuid("relacionada_a_id"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    // Alvo da chave composta de `relacionada_a`: garante, no banco, a mesma investigação.
    unique("evidencias_id_investigacao_unique").on(tabela.id, tabela.investigacaoId),
    foreignKey({
      name: "evidencias_relacionada_mesma_investigacao_fk",
      columns: [tabela.relacionadaAId, tabela.investigacaoId],
      foreignColumns: [tabela.id, tabela.investigacaoId],
    }).onDelete("restrict"),
    check("evidencias_origem_valida", sql`${tabela.origem} in (${lista(ORIGENS_EVIDENCIA)})`),
    check("evidencias_status_valido", sql`${tabela.status} in (${lista(STATUS_EVIDENCIA)})`),
    check("evidencias_titulo_tamanho", sql`char_length(${tabela.titulo}) between 3 and 120`),
    check("evidencias_descricao_tamanho", sql`char_length(${tabela.descricao}) between 10 and 1000`),
    check("evidencias_imagem_tamanho", sql`${tabela.imagemUrl} is null or char_length(${tabela.imagemUrl}) <= 400`),
    check("evidencias_fonte_tamanho", sql`${tabela.fonte} is null or char_length(${tabela.fonte}) between 1 and 300`),
    check("evidencias_motivo_tamanho", sql`${tabela.motivoRecusa} is null or char_length(${tabela.motivoRecusa}) between 1 and 300`),
    // Coerência: pendente não tem decisão; aceita/recusada têm decisor e data; motivo só em recusada.
    check(
      "evidencias_decisao_coerente",
      sql`(${tabela.status} = 'pendente' and ${tabela.decididaPorId} is null and ${tabela.decididaEm} is null and ${tabela.motivoRecusa} is null)
        or (${tabela.status} = 'aceita' and ${tabela.decididaPorId} is not null and ${tabela.decididaEm} is not null and ${tabela.motivoRecusa} is null)
        or (${tabela.status} = 'recusada' and ${tabela.decididaPorId} is not null and ${tabela.decididaEm} is not null)`,
    ),
    check("evidencias_sem_autorrelacionamento", sql`${tabela.relacionadaAId} is null or ${tabela.relacionadaAId} <> ${tabela.id}`),
    index("evidencias_investigacao_ordem_idx").on(tabela.investigacaoId, tabela.status, tabela.criadoEm, tabela.id),
    index("evidencias_autor_idx").on(tabela.autorId, tabela.criadoEm, tabela.id),
    index("evidencias_decisor_idx").on(tabela.decididaPorId),
  ],
);

export type EvidenciaLinha = typeof evidencias.$inferSelect;
