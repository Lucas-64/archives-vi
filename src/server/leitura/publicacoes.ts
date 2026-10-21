// Leitura de publicações e comentários para as páginas (Server Components), pelos mesmos serviços das rotas
// `/api/v1/*`, dentro do processo (ADR-029). Visibilidade (só publicadas) e contagens vêm dos serviços.
import { cache } from "react";

import type { ComentarioPublico } from "../contracts/interacoes";
import { esquemaSlug, type PublicacaoPublica } from "../contracts/publicacoes";
import { obterDb } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { listarComentarios } from "../servicos/interacoes";
import { listarPublicacoes, listarRelacionadas, obterPublicacao } from "../servicos/publicacoes";
import { LIMITE_LISTA, type ListaLimitada } from "./usuarios";

// Uma página de comentários. O restante é carregado sob demanda pelo navegador (GET /api/v1/comentarios).
export const LIMITE_COMENTARIOS = 20;

const agora = () => new Date();

export const publicacoesDaListagem = cache(
  async (tipo?: "teoria" | "investigacao", tag?: string): Promise<ListaLimitada<PublicacaoPublica>> => {
    const pagina = await listarPublicacoes({ db: obterDb(), agora }, { tipo, tag }, { limite: LIMITE_LISTA });
    return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
  },
);

// Publicação, ou null quando o slug está fora do formato ou ela não existe/está oculta (a página responde 404).
// `visitanteId` define `euCurti`; é parte da chave do cache.
export const publicacaoPorSlug = cache(async (slug: string, visitanteId?: string): Promise<PublicacaoPublica | null> => {
  if (!esquemaSlug.safeParse(slug).success) return null;
  try {
    return await obterPublicacao({ db: obterDb(), agora, visitanteId }, slug);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.codigo === "nao_encontrado") return null;
    throw erro;
  }
});

export const relacionadasDaPublicacao = cache(async (slug: string): Promise<PublicacaoPublica[]> => {
  const { itens } = await listarRelacionadas({ db: obterDb(), agora }, slug, 3);
  return itens;
});

export const comentariosDaPublicacao = cache(
  async (slug: string): Promise<{ itens: ComentarioPublico[]; proximoCursor: string | null }> => {
    const pagina = await listarComentarios({ db: obterDb(), agora }, slug, { limite: LIMITE_COMENTARIOS });
    return { itens: pagina.itens, proximoCursor: pagina.proximoCursor };
  },
);
