// Leitura de mistérios para as páginas (Server Components), pelos mesmos serviços das rotas `/api/v1/misterios`,
// dentro do processo (ADR-029). Mistério oculto responde como inexistente.
import { cache } from "react";

import type { InvestigacaoResumo } from "../contracts/investigacoes";
import type { ComentarioPublico } from "../contracts/interacoes";
import type { MisterioDetalhePublico, MisterioResumo } from "../contracts/misterios";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { listarInvestigacoes } from "../servicos/investigacoes";
import { listarComentarios } from "../servicos/interacoes";
import { listarMisterios, obterMisterio } from "../servicos/misterios";
import { LIMITE_LISTA, type ListaLimitada } from "./usuarios";

const agora = () => new Date();

// `classificacao` é um dos ids de CLASSIFICACOES_MISTERIO_API; valor desconhecido dá lista vazia (o serviço
// recusaria o filtro, e a página não deve quebrar por um parâmetro de URL).
export const misteriosDaListagem = cache(async (classificacao?: string): Promise<ListaLimitada<MisterioResumo>> => {
  const pagina = await listarMisterios({ db: obterDb(), agora }, { classificacao }, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
});

// Mistério, ou null quando o slug está fora do formato ou ele não existe/está oculto (a página responde 404).
export const misterioPorSlug = cache(async (slug: string): Promise<MisterioDetalhePublico | null> => {
  if (!esquemaSlug.safeParse(slug).success) return null;
  try {
    return await obterMisterio({ db: obterDb(), agora }, slug);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.codigo === "nao_encontrado") return null;
    throw erro;
  }
});

// Investigações vinculadas ao mistério (todas, abertas ou encerradas), da mais recente à mais antiga.
export const investigacoesDoMisterio = cache(async (slug: string): Promise<ListaLimitada<InvestigacaoResumo>> => {
  if (!esquemaSlug.safeParse(slug).success) return { itens: [], haMais: false };
  try {
    const pagina = await listarInvestigacoes({ db: obterDb(), agora }, { misterio: slug }, { limite: LIMITE_LISTA });
    return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
  } catch (erro) {
    if (erro instanceof ErroApi && erro.codigo === "nao_encontrado") return { itens: [], haMais: false };
    throw erro;
  }
});

// Mistérios de uma conta (perfil). Conta inexistente: lista vazia (a página do perfil já responde 404 antes).
export const misteriosDoUsuario = cache(async (usuario: string): Promise<ListaLimitada<MisterioResumo>> => {
  try {
    const pagina = await listarMisterios({ db: obterDb(), agora }, { autor: usuario }, { limite: LIMITE_LISTA });
    return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
  } catch (erro) {
    if (erro instanceof ErroApi && erro.codigo === "nao_encontrado") return { itens: [], haMais: false };
    throw erro;
  }
});

// Comentários do mistério, do mais antigo ao mais novo.
export const comentariosDoMisterio = cache(async (slug: string): Promise<{ itens: ComentarioPublico[]; proximoCursor: string | null }> => {
  const pagina = await listarComentarios({ db: obterDb(), agora }, { tipo: "misterio", slug }, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, proximoCursor: pagina.proximoCursor };
});
