import { z } from "zod";

import { ORIGENS_EVIDENCIA, STATUS_EVIDENCIA } from "../db/esquema/evidencias";
import { esquemaUrlImagem } from "./imagem";
import { texto } from "./investigacoes";

// Espelham os CHECKs da migração 0005. Provisórios (D-P) quanto a limites de envio.
export const LIMITES_EVIDENCIA = {
  titulo: { minimo: 3, maximo: 120 },
  descricao: { minimo: 10, maximo: 1000 },
  fonte: { maximo: 300 },
  motivo: { maximo: 300 },
} as const;

// Estrito: `status`, `autor`, `imagens` e qualquer outro campo dão 422 (D-G). `imagem` é opcional: só a URL pública do
// Vercel Blob devolvida pelo envio (ADR-043).
export const esquemaCriarEvidencia = z
  .object({
    origem: z.enum(ORIGENS_EVIDENCIA, { error: "Origem inválida." }),
    titulo: texto("o título", LIMITES_EVIDENCIA.titulo.minimo, LIMITES_EVIDENCIA.titulo.maximo),
    descricao: texto("a descrição", LIMITES_EVIDENCIA.descricao.minimo, LIMITES_EVIDENCIA.descricao.maximo),
    fonte: texto("a fonte", 1, LIMITES_EVIDENCIA.fonte.maximo).optional(),
    imagem: esquemaUrlImagem.optional(),
    relacionadaA: z.uuid({ error: "Identificador de evidência inválido." }).optional(),
  })
  .strict();
export type EntradaCriarEvidencia = z.output<typeof esquemaCriarEvidencia>;

export const esquemaRecusarSugestao = z
  .object({ motivo: texto("o motivo", 1, LIMITES_EVIDENCIA.motivo.maximo).optional() })
  .strict();

export const esquemaListarSugestoes = z.object({
  status: z.enum(STATUS_EVIDENCIA, { error: "Status inválido." }).optional(),
});

const INSTANTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;
export const esquemaCursorEvidencias = z.object({ criadoEm: z.string().regex(INSTANTE), id: z.uuid() }).strict();
export type CursorEvidencias = z.output<typeof esquemaCursorEvidencias>;

export interface Pessoa {
  nome: string;
  usuario: string;
}

export interface EvidenciaPublica {
  id: string;
  origem: string;
  titulo: string;
  descricao: string;
  autor: Pessoa;
  data: string;
  fonte: string | null;
  // Zero ou uma imagem (URL pública do Blob).
  imagens: { url: string }[];
  relacionadaA?: string;
  origemComunidade?: { enviadaPor: Pessoa; aceitaPor: Pessoa };
}

// Visível ao responsável, à moderação e (a própria) ao remetente. O motivo da recusa nunca é público.
export interface Sugestao extends EvidenciaPublica {
  status: string;
  motivo?: string;
  decididaPor?: Pessoa;
  decididaEm?: string;
}

export interface SugestaoDoMembro extends Sugestao {
  investigacao: { slug: string; titulo: string };
}
