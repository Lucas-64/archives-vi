import { sql } from "drizzle-orm";
import { check, date, index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { tags } from "./tags";
import { usuarios } from "./usuarios";

export const TIPOS_PUBLICACAO = ["teoria", "investigacao"] as const;
export type TipoPublicacao = (typeof TIPOS_PUBLICACAO)[number];

export const STATUS_PUBLICACAO = ["publicado", "oculto"] as const;
export type StatusPublicacao = (typeof STATUS_PUBLICACAO)[number];

// Instantes (`criado_em`, `atualizado_em`) são sempre timestamptz em UTC. `data` é o dia da publicação no
// fuso America/Sao_Paulo: um dado de calendário, não um instante. A ordenação usa (data, criado_em, id).
export const publicacoes = pgTable(
  "publicacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    titulo: text("titulo").notNull(),
    resumo: text("resumo").notNull(),
    // Nulo nas publicações do seed, que só têm resumo editorial.
    corpo: text("corpo"),
    // Imagem enviada pela pessoa ao criar (URL pública do Vercel Blob, ADR-043). Opcional.
    imagemUrl: text("imagem_url"),
    tipo: text("tipo", { enum: TIPOS_PUBLICACAO }).notNull(),
    autorId: uuid("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    data: date("data", { mode: "string" })
      .notNull()
      .default(sql`(timezone('America/Sao_Paulo', now()))::date`),
    status: text("status", { enum: STATUS_PUBLICACAO }).notNull().default("publicado"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("publicacoes_slug_formato", sql`${tabela.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(${tabela.slug}) <= 80`),
    check("publicacoes_titulo_tamanho", sql`char_length(${tabela.titulo}) between 3 and 120`),
    check("publicacoes_resumo_tamanho", sql`char_length(${tabela.resumo}) between 1 and 200`),
    check("publicacoes_imagem_tamanho", sql`${tabela.imagemUrl} is null or char_length(${tabela.imagemUrl}) <= 400`),
    check("publicacoes_corpo_tamanho", sql`${tabela.corpo} is null or char_length(${tabela.corpo}) <= 2000`),
    check("publicacoes_tipo_valido", sql`${tabela.tipo} in ('teoria', 'investigacao')`),
    check("publicacoes_status_valido", sql`${tabela.status} in ('publicado', 'oculto')`),
    index("publicacoes_ordem_idx").on(tabela.data.desc(), tabela.criadoEm.desc(), tabela.id.desc()),
    index("publicacoes_autor_idx").on(tabela.autorId),
    index("publicacoes_tipo_idx").on(tabela.tipo),
  ],
);

export const publicacaoTags = pgTable(
  "publicacao_tags",
  {
    publicacaoId: uuid("publicacao_id")
      .notNull()
      .references(() => publicacoes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict" }),
  },
  (tabela) => [primaryKey({ columns: [tabela.publicacaoId, tabela.tagId] }), index("publicacao_tags_tag_idx").on(tabela.tagId)],
);

// Palavras-chave de texto livre (mantidas à parte dos temas do catálogo, como no front).
export const publicacaoTermos = pgTable(
  "publicacao_termos",
  {
    publicacaoId: uuid("publicacao_id")
      .notNull()
      .references(() => publicacoes.id, { onDelete: "cascade" }),
    ordem: integer("ordem").notNull(),
    termo: text("termo").notNull(),
  },
  (tabela) => [
    primaryKey({ columns: [tabela.publicacaoId, tabela.ordem] }),
    check("publicacao_termos_tamanho", sql`char_length(${tabela.termo}) between 1 and 60`),
  ],
);

export type PublicacaoLinha = typeof publicacoes.$inferSelect;
export type NovaPublicacao = typeof publicacoes.$inferInsert;
