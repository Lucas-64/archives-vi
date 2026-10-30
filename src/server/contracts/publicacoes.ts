import { z } from "zod";

import { IDS_TAGS } from "../db/esquema/tags";
import { TIPOS_PUBLICACAO } from "../db/esquema/publicacoes";
import { esquemaUrlImagem } from "./imagem";

// Limites do /criar do front (LIMITES_TEORIA), copiados aqui como fonte autoritativa.
export const LIMITES_TEORIA = {
  titulo: { minimo: 3, maximo: 120 },
  corpo: { minimo: 20, maximo: 2000 },
} as const;

// Caracteres de controle (inclusive NUL, que o PostgreSQL recusa) não são texto. \t, \n e \r passam.
const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;


export const esquemaCriarPublicacao = z
  .object({
    titulo: z
      .string({ error: "Informe um título para a teoria." })
      .trim()
      .min(1, "Informe um título para a teoria.")
      .min(LIMITES_TEORIA.titulo.minimo, `O título precisa ter pelo menos ${LIMITES_TEORIA.titulo.minimo} caracteres.`)
      .max(LIMITES_TEORIA.titulo.maximo, `O título pode ter no máximo ${LIMITES_TEORIA.titulo.maximo} caracteres.`)
      .refine((v) => !CONTROLE.test(v), "O título contém caracteres inválidos."),
    corpo: z
      .string({ error: "Escreva o texto da teoria." })
      .trim()
      .min(1, "Escreva o texto da teoria.")
      .min(LIMITES_TEORIA.corpo.minimo, `O texto precisa ter pelo menos ${LIMITES_TEORIA.corpo.minimo} caracteres.`)
      .max(LIMITES_TEORIA.corpo.maximo, `O texto pode ter no máximo ${LIMITES_TEORIA.corpo.maximo} caracteres.`)
      .refine((v) => !CONTROLE.test(v), "O texto contém caracteres inválidos."),
    // Imagem opcional: URL pública do Vercel Blob devolvida pelo envio (ADR-043).
    imagem: esquemaUrlImagem.optional(),
  })
  .strict();

export type EntradaCriarPublicacao = z.output<typeof esquemaCriarPublicacao>;

export const esquemaListarPublicacoes = z.object({
  tipo: z.enum(TIPOS_PUBLICACAO, { error: "Tipo inválido. Use teoria ou investigacao." }).optional(),
  tag: z.enum(IDS_TAGS, { error: "Tema desconhecido." }).optional(),
  autor: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, "Nome de usuário inválido.")
    .optional(),
});

export const esquemaRelacionadas = z.object({
  limite: z.coerce
    .number({ error: "Informe um número para o limite." })
    .int("O limite precisa ser um número inteiro.")
    .min(1, "O limite mínimo é 1.")
    .max(10, "O limite máximo é 10.")
    .default(3),
});

export const esquemaSlug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80);

// Cursor da listagem: tudo o que define a posição na ordem (data, criado_em, id). `criadoEm` é o texto
// do instante com precisão de microssegundos, para o desempate nunca depender de arredondamento.
export const esquemaCursorPublicacoes = z
  .object({
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    criadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/),
    id: z.uuid(),
  })
  .strict();

export type CursorPublicacoes = z.output<typeof esquemaCursorPublicacoes>;

export interface PublicacaoPublica {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  corpo: string | null;
  // Endereço da imagem enviada (Vercel Blob). Nulo: sem imagem própria.
  imagem: string | null;
  tipo: "teoria" | "investigacao";
  autor: { nome: string; usuario: string };
  data: string;
  tags: string[];
  termos: string[];
  // Calculados a partir dos dados gravados. `euCurti` é sempre booleano: falso para visitantes.
  comentarios: number;
  curtidas: number;
  euCurti: boolean;
}
