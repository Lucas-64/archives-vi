import { z } from "zod";

import { esquemaSlug } from "./publicacoes";

export const LIMITES_COMENTARIO = { texto: { minimo: 1, maximo: 2000 } } as const;

// \t, \n e \r passam; NUL e demais caracteres de controle não são texto.
const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

// Alvo no formato do contrato: "publicacao:{slug}". Investigação e evidência ainda não têm comentários.
const esquemaAlvo = z
  .string({ error: "Informe o alvo do comentário." })
  .trim()
  .superRefine((valor, ctx) => {
    const [tipo, ...resto] = valor.split(":");
    if (tipo !== "publicacao") {
      ctx.addIssue({ code: "custom", message: "Por enquanto só é possível comentar em publicações (publicacao:{slug})." });
    } else if (!esquemaSlug.safeParse(resto.join(":")).success) {
      ctx.addIssue({ code: "custom", message: "Alvo inválido." });
    }
  })
  .transform((valor) => valor.slice("publicacao:".length));

export const esquemaListarComentarios = z.object({ alvo: esquemaAlvo });

// Estrito: `respostaA` (respostas encadeadas) e qualquer campo de autoria são recusados.
export const esquemaCriarComentario = z
  .object({
    alvo: esquemaAlvo,
    texto: z
      .string({ error: "Escreva o comentário." })
      .trim()
      .min(LIMITES_COMENTARIO.texto.minimo, "Escreva o comentário.")
      .max(LIMITES_COMENTARIO.texto.maximo, `O comentário pode ter no máximo ${LIMITES_COMENTARIO.texto.maximo} caracteres.`)
      .refine((v) => !CONTROLE.test(v), "O comentário contém caracteres inválidos."),
  })
  .strict();

export type EntradaCriarComentario = z.output<typeof esquemaCriarComentario>;

// Comentários em ordem cronológica (criado_em, id crescentes). Cursor: posição da última linha entregue.
export const esquemaCursorComentarios = z
  .object({
    criadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/),
    id: z.uuid(),
  })
  .strict();

export type CursorComentarios = z.output<typeof esquemaCursorComentarios>;

export interface ComentarioPublico {
  id: string;
  texto: string;
  autor: { nome: string; usuario: string };
  criadoEm: string;
}

export interface EstadoCurtida {
  curtidas: number;
  euCurti: boolean;
}
