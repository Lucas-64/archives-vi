// Leitura de investigações, evidências e sugestões para as páginas (Server Components), pelos mesmos serviços
// das rotas `/api/v1/*`, dentro do processo (ADR-029). As regras de visibilidade ficam nos serviços: a lista
// pública traz só evidências aceitas; sugestões só chegam a quem pode vê-las (remetente, responsável, moderação).
import { cache } from "react";

import type { EvidenciaPublica, Sugestao, SugestaoDoMembro } from "../contracts/evidencias";
import type { InvestigacaoDetalhePublico, InvestigacaoResumo, RegistroHistoricoPublico } from "../contracts/investigacoes";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { listarEvidencias, listarSugestoes, listarSugestoesDoMembro, type Ator } from "../servicos/evidencias";
import { listarHistorico, listarInvestigacoes, obterInvestigacao } from "../servicos/investigacoes";
import { LIMITE_LISTA, type ListaLimitada } from "./usuarios";

const agora = () => new Date();

export interface Visitante {
  id: string;
  papel: string;
}

export const investigacoesDaListagem = cache(async (tag?: string): Promise<ListaLimitada<InvestigacaoResumo>> => {
  const pagina = await listarInvestigacoes({ db: obterDb(), agora }, { tag }, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
});

// Investigação, ou null quando o slug está fora do formato ou ela não existe (a página responde 404).
// `visitanteId` e `visitantePapel` só definem `permissoes`; são parte da chave do cache.
export const investigacaoPorSlug = cache(
  async (slug: string, visitanteId?: string, visitantePapel?: string): Promise<InvestigacaoDetalhePublico | null> => {
    if (!esquemaSlug.safeParse(slug).success) return null;
    try {
      return await obterInvestigacao({ db: obterDb(), agora, visitanteId, visitantePapel }, slug);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.codigo === "nao_encontrado") return null;
      throw erro;
    }
  },
);

export const evidenciasAceitas = cache(async (slug: string): Promise<ListaLimitada<EvidenciaPublica>> => {
  const pagina = await listarEvidencias({ db: obterDb(), agora }, slug, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
});

// Histórico do mais recente ao mais antigo (ordem da API).
export const historicoDaInvestigacao = cache(async (slug: string): Promise<ListaLimitada<RegistroHistoricoPublico>> => {
  const pagina = await listarHistorico({ db: obterDb(), agora }, slug, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
});

// Fila de análise (pendentes). O serviço recusa quem não é o responsável nem a moderação.
export const filaDeSugestoes = cache(async (slug: string, ator: Ator): Promise<ListaLimitada<Sugestao>> => {
  const pagina = await listarSugestoes({ db: obterDb(), agora }, ator, slug, { status: "pendente" }, { limite: LIMITE_LISTA });
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
});

// Sugestões da própria pessoa nesta investigação, em qualquer estado.
export const minhasSugestoesNaInvestigacao = cache(async (slug: string, ator: Ator): Promise<SugestaoDoMembro[]> => {
  const pagina = await listarSugestoesDoMembro({ db: obterDb(), agora }, ator, {}, { limite: 100 });
  return pagina.itens.filter((item) => item.investigacao.slug === slug);
});
