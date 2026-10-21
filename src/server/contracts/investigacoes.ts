import { z } from "zod";

import { CATEGORIAS_INVESTIGACAO, ESTADOS_INVESTIGACAO } from "../db/esquema/investigacoes";
import { IDS_TAGS } from "../db/esquema/tags";
import { extrairIdYoutube } from "../investigacoes/youtube";

// Limites iniciais e provisórios (D-F), espelhados nos CHECKs da migração 0004.
export const LIMITES_INVESTIGACAO = {
  titulo: { minimo: 3, maximo: 120 },
  descricao: { minimo: 20, maximo: 500 },
  localizacao: { maximo: 80 },
  hipotese: { minimo: 20, maximo: 2000 },
  perguntaCentral: { minimo: 5, maximo: 300 },
  item: { maximo: 300 },
  itensPorLista: 10,
  videoUrl: 200,
  videoTitulo: 120,
} as const;

// \t, \n e \r passam; NUL e demais caracteres de controle não são texto.
export const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function texto(rotulo: string, minimo: number, maximo: number) {
  return z
    .string({ error: `Informe ${rotulo}.` })
    .trim()
    .min(1, `Informe ${rotulo}.`)
    .min(minimo, `${rotulo[0].toUpperCase()}${rotulo.slice(1)} precisa ter pelo menos ${minimo} caracteres.`)
    .max(maximo, `${rotulo[0].toUpperCase()}${rotulo.slice(1)} pode ter no máximo ${maximo} caracteres.`)
    .refine((v) => !CONTROLE.test(v), "O texto contém caracteres inválidos.");
}

const lista = (rotulo: string) =>
  z
    .array(texto(rotulo, 1, LIMITES_INVESTIGACAO.item.maximo), { error: "Informe uma lista." })
    .max(LIMITES_INVESTIGACAO.itensPorLista, `Use no máximo ${LIMITES_INVESTIGACAO.itensPorLista} itens.`);

const campos = {
  titulo: texto("o título", LIMITES_INVESTIGACAO.titulo.minimo, LIMITES_INVESTIGACAO.titulo.maximo),
  descricao: texto("a descrição", LIMITES_INVESTIGACAO.descricao.minimo, LIMITES_INVESTIGACAO.descricao.maximo),
  categoria: z.enum(CATEGORIAS_INVESTIGACAO, { error: "Categoria inválida." }),
  localizacao: texto("a localização", 1, LIMITES_INVESTIGACAO.localizacao.maximo),
  tags: z
    .array(z.enum(IDS_TAGS, { error: "Tema desconhecido." }), { error: "Informe uma lista de temas." })
    .refine((valores) => new Set(valores).size === valores.length, "Temas repetidos."),
  video: z
    .object({
      url: z
        .string({ error: "Informe o link do vídeo." })
        .trim()
        .max(LIMITES_INVESTIGACAO.videoUrl, "O link do vídeo é longo demais.")
        .refine((v) => extrairIdYoutube(v) !== undefined, "Use um link de vídeo do YouTube."),
      titulo: texto("o título do vídeo", 1, LIMITES_INVESTIGACAO.videoTitulo).optional(),
    })
    .strict(),
  hipotese: texto("a hipótese", LIMITES_INVESTIGACAO.hipotese.minimo, LIMITES_INVESTIGACAO.hipotese.maximo),
  argumentosFavoraveis: lista("o argumento"),
  perguntaCentral: texto("a pergunta central", LIMITES_INVESTIGACAO.perguntaCentral.minimo, LIMITES_INVESTIGACAO.perguntaCentral.maximo),
  fontes: lista("a fonte"),
};

const esquemaTeoria = z
  .object({
    hipotese: campos.hipotese,
    argumentosFavoraveis: campos.argumentosFavoraveis,
    perguntaCentral: campos.perguntaCentral,
    fontes: campos.fontes,
  })
  .strict();

// Estritos: `status`, `estado`, `autor`, `slug`, `encerradaPeloAutor` e qualquer outro campo são recusados.
export const esquemaCriarInvestigacao = z
  .object({
    titulo: campos.titulo,
    descricao: campos.descricao,
    categoria: campos.categoria,
    localizacao: campos.localizacao.optional(),
    tags: campos.tags.default([]),
    video: campos.video.optional(),
    teoria: esquemaTeoria,
  })
  .strict();

export type EntradaCriarInvestigacao = z.output<typeof esquemaCriarInvestigacao>;

const esquemaTeoriaParcial = esquemaTeoria
  .partial()
  .strict()
  .refine((v) => Object.values(v).some((x) => x !== undefined), "Informe ao menos um campo da teoria.");

// PATCH: qualquer subconjunto. `localizacao` e `video` aceitam null para remover.
export const esquemaEditarInvestigacao = z
  .object({
    titulo: campos.titulo.optional(),
    descricao: campos.descricao.optional(),
    categoria: campos.categoria.optional(),
    localizacao: campos.localizacao.nullable().optional(),
    tags: campos.tags.optional(),
    video: campos.video.nullable().optional(),
    teoria: esquemaTeoriaParcial.optional(),
  })
  .strict()
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: "Informe ao menos um campo para alterar." });

export type EntradaEditarInvestigacao = z.output<typeof esquemaEditarInvestigacao>;

export const esquemaMudarEstado = z
  .object({ estado: z.enum(ESTADOS_INVESTIGACAO, { error: "Estado inválido." }) })
  .strict();

export const esquemaListarInvestigacoes = z.object({
  categoria: z.enum(CATEGORIAS_INVESTIGACAO, { error: "Categoria inválida." }).optional(),
  tag: z.enum(IDS_TAGS, { error: "Tema desconhecido." }).optional(),
  // Toda investigação da API tem teoria; o parâmetro existe pelo contrato e só aceita "true".
  comDetalhe: z.literal("true", { error: "Use comDetalhe=true." }).optional(),
});

const INSTANTE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;

export const esquemaCursorInvestigacoes = z.object({ atualizadoEm: z.string().regex(INSTANTE), id: z.uuid() }).strict();
export const esquemaCursorHistorico = z.object({ criadoEm: z.string().regex(INSTANTE), id: z.uuid() }).strict();
export type CursorInvestigacoes = z.output<typeof esquemaCursorInvestigacoes>;
export type CursorHistorico = z.output<typeof esquemaCursorHistorico>;

export interface PessoaPublica {
  nome: string;
  usuario: string;
}

export interface InvestigacaoResumo {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  imagem: null;
  status: string;
  categoria: string;
  localizacao?: string;
  tags: string[];
  contagemEvidencias: number;
  video?: { url: string; titulo?: string };
  atualizadoEm: string;
  possuiDetalhe: boolean;
}

export interface InvestigacaoDetalhePublico extends InvestigacaoResumo {
  estado: string;
  encerradaPeloAutor: boolean;
  autor: PessoaPublica;
  criadoEm: string;
  teoria: { hipotese: string; argumentosFavoraveis: string[]; perguntaCentral: string; fontes: string[] };
  contagens: { revisoes: number; evidencias: number };
  permissoes: { podeGerenciar: boolean; podeSugerirEvidencia: boolean; podeModerar: boolean };
}

export interface RegistroHistoricoPublico {
  id: string;
  data: string;
  autor: PessoaPublica;
  titulo: string;
  resumo: string;
}
