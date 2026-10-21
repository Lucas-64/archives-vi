import { z } from "zod";

import { STATUS_INVESTIGACAO } from "../db/esquema/investigacoes";
import { ACOES_AUDITORIA, ALVOS_AUDITORIA } from "../db/esquema/auditoria";
import { texto } from "./investigacoes";

export const LIMITES_MODERACAO = { motivo: { minimo: 5, maximo: 300 } } as const;
const motivo = texto("o motivo", LIMITES_MODERACAO.motivo.minimo, LIMITES_MODERACAO.motivo.maximo);

export const esquemaMudarStatus = z
  .object({ status: z.enum(STATUS_INVESTIGACAO, { error: "Status inválido." }), motivo })
  .strict();

// Nunca "admin": nenhum caminho HTTP concede administração (só o script de bootstrap).
export const esquemaMudarPapel = z
  .object({ papel: z.enum(["membro", "moderador"], { error: "Papel inválido." }), motivo })
  .strict();

export const esquemaListarAuditoria = z.object({
  acao: z.enum(ACOES_AUDITORIA, { error: "Ação inválida." }).optional(),
  alvoTipo: z.enum(ALVOS_AUDITORIA, { error: "Tipo de alvo inválido." }).optional(),
});

const INSTANTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;
export const esquemaCursorAuditoria = z.object({ criadoEm: z.string().regex(INSTANTE), id: z.uuid() }).strict();
export type CursorAuditoria = z.output<typeof esquemaCursorAuditoria>;

export interface RegistroAuditoria {
  id: string;
  data: string;
  ator: { nome: string; usuario: string } | { rotulo: string };
  acao: string;
  alvo: { tipo: string; id: string };
  antes: unknown;
  depois: unknown;
  motivo: string | null;
}
