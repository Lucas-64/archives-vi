import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Contadores de janela fixa para limitar tentativas (login, cadastro). A chave é um hash: nunca guarda
// IP nem e-mail em texto.
export const limitesTaxa = pgTable("limites_taxa", {
  chave: text("chave").primaryKey(),
  janelaInicio: timestamp("janela_inicio", { withTimezone: true }).notNull(),
  contagem: integer("contagem").notNull(),
});
