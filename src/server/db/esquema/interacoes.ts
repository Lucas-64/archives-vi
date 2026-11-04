import { sql } from "drizzle-orm";
import { check, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { investigacoes } from "./investigacoes";
import { misterios } from "./misterios";
import { publicacoes } from "./publicacoes";
import { usuarios } from "./usuarios";

// Comentários de publicação. Sem edição, exclusão nem respostas encadeadas nesta etapa. O contador
// `comentarios` das publicações é a contagem destas linhas.
export const comentarios = pgTable(
  "comentarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Exatamente um alvo (CHECK abaixo): publicação, mistério ou investigação.
    publicacaoId: uuid("publicacao_id").references(() => publicacoes.id, { onDelete: "cascade" }),
    misterioId: uuid("misterio_id").references(() => misterios.id, { onDelete: "cascade" }),
    investigacaoId: uuid("investigacao_id").references(() => investigacoes.id, { onDelete: "cascade" }),
    autorId: uuid("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    texto: text("texto").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("comentarios_texto_tamanho", sql`char_length(${tabela.texto}) between 1 and 2000`),
    // Leitura em ordem cronológica por publicação (criado_em, id).
    index("comentarios_publicacao_ordem_idx").on(tabela.publicacaoId, tabela.criadoEm, tabela.id),
    index("comentarios_autor_idx").on(tabela.autorId),
    check(
      "comentarios_um_alvo",
      sql`num_nonnulls(${tabela.publicacaoId}, ${tabela.misterioId}, ${tabela.investigacaoId}) = 1`,
    ),
    index("comentarios_misterio_ordem_idx").on(tabela.misterioId, tabela.criadoEm, tabela.id),
    index("comentarios_investigacao_ordem_idx").on(tabela.investigacaoId, tabela.criadoEm, tabela.id),
  ],
);

// Uma curtida por membro e publicação: a chave primária composta impede duplicatas mesmo sob concorrência.
export const curtidas = pgTable(
  "curtidas",
  {
    publicacaoId: uuid("publicacao_id")
      .notNull()
      .references(() => publicacoes.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [primaryKey({ columns: [tabela.publicacaoId, tabela.usuarioId] }), index("curtidas_usuario_idx").on(tabela.usuarioId)],
);

// Curtida de investigação (D5): uma por membro; a chave primária composta impede duplicatas sob concorrência.
export const investigacaoCurtidas = pgTable(
  "investigacao_curtidas",
  {
    investigacaoId: uuid("investigacao_id")
      .notNull()
      .references(() => investigacoes.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    primaryKey({ columns: [tabela.investigacaoId, tabela.usuarioId] }),
    index("investigacao_curtidas_usuario_idx").on(tabela.usuarioId),
  ],
);
