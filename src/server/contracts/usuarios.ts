import { z } from "zod";

import { CONTROLE, texto } from "./investigacoes";

// Espelham os CHECKs de `usuarios` (nome 1–60, bio ≤ 240).
export const LIMITES_PERFIL = { nome: 60, bio: 240, busca: 60 } as const;

export const esquemaNomeUsuario = z
  .string()
  .regex(/^[a-z0-9_]{3,30}$/);

// `usuario`, `email`, `papel`, `senha`, `avatar` e qualquer outro campo dão 422 "Campo não permitido."
export const esquemaEditarPerfil = z
  .object({
    nome: texto("o nome", 1, LIMITES_PERFIL.nome).optional(),
    bio: z
      .string({ error: "Informe a bio." })
      .trim()
      .max(LIMITES_PERFIL.bio, `A bio pode ter no máximo ${LIMITES_PERFIL.bio} caracteres.`)
      .refine((v) => !CONTROLE.test(v), "O texto contém caracteres inválidos.")
      .optional(),
  })
  .strict()
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: "Informe ao menos um campo para alterar." });
export type EntradaEditarPerfil = z.output<typeof esquemaEditarPerfil>;

export const esquemaListarCriadores = z.object({
  q: z
    .string()
    .trim()
    .max(LIMITES_PERFIL.busca, `A busca pode ter no máximo ${LIMITES_PERFIL.busca} caracteres.`)
    .optional(),
});

export const esquemaCursorCriadores = z.object({ usuario: z.string().regex(/^[a-z0-9_]{3,30}$/) }).strict();
export type CursorCriadores = z.output<typeof esquemaCursorCriadores>;

export interface IndicadoresPerfil {
  publicacoes: number;
  investigacoes: number;
  evidenciasAceitas: number;
  comentarios: number;
}

// Nunca inclui e-mail, papel, hash, sessão nem a marca `demonstrativo`.
export interface PerfilPublico {
  usuario: string;
  nome: string;
  bio: string;
  avatar: null;
  criadoEm: string;
  indicadores: IndicadoresPerfil;
}
