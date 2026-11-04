import { z } from "zod";

import { esquemaSlug } from "./publicacoes";

export const LIMITES_COMENTARIO = { texto: { minimo: 1, maximo: 2000 } } as const;

// \t, \n e \r passam; NUL e demais caracteres de controle não são texto.
const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export const TIPOS_ALVO_COMENTARIO = ["publicacao", "misterio", "investigacao"] as const;
export type TipoAlvoComentario = (typeof TIPOS_ALVO_COMENTARIO)[number];
export interface AlvoComentario {
  tipo: TipoAlvoComentario;
  slug: string;
}

// Alvo no formato do contrato: "publicacao:{slug}", "misterio:{slug}" ou "investigacao:{slug}".
// Evidência ainda não tem comentários.
const esquemaAlvo = z
  .string({ error: "Informe o alvo do comentário." })
  .trim()
  .transform((valor, ctx): AlvoComentario => {
    const [tipo, ...resto] = valor.split(":");
    if (!(TIPOS_ALVO_COMENTARIO as readonly string[]).includes(tipo)) {
      ctx.addIssue({ code: "custom", message: "Alvo inválido. Use publicacao:{slug}, misterio:{slug} ou investigacao:{slug}." });
      return z.NEVER;
    }
    if (!esquemaSlug.safeParse(resto.join(":")).success) {
      ctx.addIssue({ code: "custom", message: "Alvo inválido." });
      return z.NEVER;
    }
    return { tipo: tipo as TipoAlvoComentario, slug: resto.join(":") };
  });

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
