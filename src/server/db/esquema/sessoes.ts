import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usuarios } from "./usuarios";

// Só o hash (SHA-256 em hexadecimal) do token fica no banco; o token em si vai apenas no cookie.
export const sessoes = pgTable(
  "sessoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull().unique(),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    ultimoUsoEm: timestamp("ultimo_uso_em", { withTimezone: true }).notNull().defaultNow(),
    // Expiração deslizante e limite absoluto (ver docs/backend/README.md).
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    expiraAbsolutaEm: timestamp("expira_absoluta_em", { withTimezone: true }).notNull(),
    revogadaEm: timestamp("revogada_em", { withTimezone: true }),
    ipHash: text("ip_hash"),
    agente: text("agente"),
  },
  (tabela) => [
    index("sessoes_usuario_idx").on(tabela.usuarioId),
    index("sessoes_expira_idx").on(tabela.expiraEm),
  ],
);

export type Sessao = typeof sessoes.$inferSelect;
export type NovaSessao = typeof sessoes.$inferInsert;
