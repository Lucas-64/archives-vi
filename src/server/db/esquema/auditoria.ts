import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usuarios } from "./usuarios";

export const ACOES_AUDITORIA = ["investigacao.status", "evidencia.aceitar", "evidencia.recusar", "usuario.papel", "admin.bootstrap"] as const;
export type AcaoAuditoria = (typeof ACOES_AUDITORIA)[number];

export const ALVOS_AUDITORIA = ["investigacao", "evidencia", "usuario"] as const;
export type AlvoAuditoria = (typeof ALVOS_AUDITORIA)[number];

const lista = (valores: readonly string[]) => sql.raw(valores.map((v) => `'${v}'`).join(", "));

// Append-only: gatilhos do PostgreSQL (migração 0005) recusam UPDATE, DELETE e TRUNCATE. `antes` e `depois`
// guardam só dados de estado (status, papel, ids). Nunca e-mail, senha, hash ou token.
export const auditoria = pgTable(
  "auditoria",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nulo só para ações de sistema, como o script do primeiro administrador (então `ator_rotulo` é obrigatório).
    atorId: uuid("ator_id").references(() => usuarios.id, { onDelete: "restrict" }),
    atorRotulo: text("ator_rotulo"),
    acao: text("acao", { enum: ACOES_AUDITORIA }).notNull(),
    alvoTipo: text("alvo_tipo", { enum: ALVOS_AUDITORIA }).notNull(),
    alvoId: uuid("alvo_id").notNull(),
    antes: jsonb("antes"),
    depois: jsonb("depois"),
    motivo: text("motivo"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("auditoria_acao_valida", sql`${tabela.acao} in (${lista(ACOES_AUDITORIA)})`),
    check("auditoria_alvo_valido", sql`${tabela.alvoTipo} in (${lista(ALVOS_AUDITORIA)})`),
    check("auditoria_ator_definido", sql`${tabela.atorId} is not null or ${tabela.atorRotulo} is not null`),
    check("auditoria_motivo_tamanho", sql`${tabela.motivo} is null or char_length(${tabela.motivo}) between 1 and 300`),
    index("auditoria_ordem_idx").on(tabela.criadoEm.desc(), tabela.id.desc()),
    index("auditoria_alvo_idx").on(tabela.alvoTipo, tabela.alvoId),
    index("auditoria_acao_idx").on(tabela.acao),
    index("auditoria_ator_idx").on(tabela.atorId),
  ],
);
