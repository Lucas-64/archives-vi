import { sql } from "drizzle-orm";
import { check, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { publicacoes } from "./publicacoes";
import { usuarios } from "./usuarios";

// Comentários de publicação. Sem edição, exclusão nem respostas encadeadas nesta etapa. O contador
// `comentarios` das publicações é a contagem destas linhas.
export const comentarios = pgTable(
  "comentarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicacaoId: uuid("publicacao_id")
      .notNull()
      .references(() => publicacoes.id, { onDelete: "cascade" }),
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
