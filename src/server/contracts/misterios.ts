import { z } from "zod";

import { CLASSIFICACOES_MISTERIO_API } from "../db/esquema/misterios";
import { esquemaUrlImagem } from "./imagem";
import { esquemaVideo, texto, type PessoaPublica } from "./investigacoes";

// Limites espelhados nos CHECKs da migração 0008.
export const LIMITES_MISTERIO = {
  titulo: { minimo: 3, maximo: 120 },
  descricao: { minimo: 20, maximo: 500 },
} as const;

// Estrito: `status`, `autor`, `slug` e qualquer outro campo são recusados.
export const esquemaCriarMisterio = z
  .object({
    titulo: texto("o título", LIMITES_MISTERIO.titulo.minimo, LIMITES_MISTERIO.titulo.maximo),
    descricao: texto("a descrição", LIMITES_MISTERIO.descricao.minimo, LIMITES_MISTERIO.descricao.maximo),
    classificacao: z.enum(CLASSIFICACOES_MISTERIO_API, { error: "Classificação inválida." }).default("em-andamento"),
    // Imagem enviada pelo campo de upload (ADR-043); URL livre é recusada.
    imagem: esquemaUrlImagem.optional(),
    video: esquemaVideo.optional(),
  })
  .strict();

export type EntradaCriarMisterio = z.output<typeof esquemaCriarMisterio>;

export const esquemaListarMisterios = z.object({
  classificacao: z.enum(CLASSIFICACOES_MISTERIO_API, { error: "Classificação inválida." }).optional(),
  // Só os mistérios desta conta (`usuario`). Conta inexistente: 404.
  autor: z.string().regex(/^[a-z0-9_]{3,30}$/, "Usuário inválido.").optional(),
});

const INSTANTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;
export const esquemaCursorMisterios = z.object({ atualizadoEm: z.string().regex(INSTANTE), id: z.uuid() }).strict();
export type CursorMisterios = z.output<typeof esquemaCursorMisterios>;

export interface MisterioResumo {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  // Endereço da imagem enviada. Nulo: o front usa a imagem padrão na leitura.
  imagem: string | null;
  classificacao: string;
  video?: { url: string; titulo?: string };
  autor: PessoaPublica;
  criadoEm: string;
  atualizadoEm: string;
  // Investigações vinculadas e não encerradas pelo autor (D4).
  investigacoesAbertas: number;
  comentarios: number;
}

export type MisterioDetalhePublico = MisterioResumo;
