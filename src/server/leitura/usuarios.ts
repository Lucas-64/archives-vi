// Leitura de perfis e criadores para as páginas (Server Components). Chama os MESMOS serviços que as rotas
// `/api/v1/*` usam, dentro do processo, sem passar por HTTP: o Next recomenda não buscar as próprias rotas a
// partir do servidor (salto de rede inútil e falha no build). As regras de visibilidade ficam nos serviços.
// As rotas HTTP continuam sendo o contrato usado pelo navegador (por exemplo, a edição do perfil).
import { cache } from "react";

import { esquemaNomeUsuario, type PerfilCriador, type PerfilPublico } from "../contracts/usuarios";
import type { InvestigacaoResumo } from "../contracts/investigacoes";
import type { PublicacaoPublica } from "../contracts/publicacoes";
import { obterDb } from "../db/cliente";
import { ErroApi } from "../http/erros";
import type { Pagina } from "../http/paginacao";
import { listarInvestigacoes } from "../servicos/investigacoes";
import { listarPublicacoes } from "../servicos/publicacoes";
import { idDoUsuario, listarCriadores, obterPerfil } from "../servicos/usuarios";

// Uma página das listas. A interface avisa quando há mais do que isso (ainda não há "ver mais").
export const LIMITE_LISTA = 50;

const agora = () => new Date();

export interface ListaLimitada<T> {
  itens: T[];
  haMais: boolean;
}

function limitada<T>(pagina: Pagina<T>): ListaLimitada<T> {
  return { itens: pagina.itens, haMais: pagina.proximoCursor !== null };
}

export async function criadoresDaPagina(): Promise<ListaLimitada<PerfilCriador>> {
  return limitada(await listarCriadores(obterDb(), {}, { limite: LIMITE_LISTA }));
}

// Perfil público, ou null quando o nome está fora do formato ou a conta não existe (a página responde 404).
// Deduplicado por requisição: generateMetadata e a página chamam a mesma coisa.
export const perfilPublico = cache(async (usuario: string): Promise<PerfilPublico | null> => {
  if (!esquemaNomeUsuario.safeParse(usuario).success) return null;
  try {
    return await obterPerfil(obterDb(), usuario);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.codigo === "nao_encontrado") return null;
    throw erro;
  }
});

export const publicacoesDoUsuario = cache(async (usuario: string, visitanteId?: string): Promise<ListaLimitada<PublicacaoPublica>> =>
  limitada(await listarPublicacoes({ db: obterDb(), agora, visitanteId }, { autor: usuario }, { limite: LIMITE_LISTA })),
);

export const investigacoesDoUsuario = cache(async (usuario: string, visitanteId?: string): Promise<ListaLimitada<InvestigacaoResumo>> => {
  const db = obterDb();
  const autorId = await idDoUsuario(db, usuario);
  return limitada(await listarInvestigacoes({ db, agora, visitanteId }, { autorId }, { limite: LIMITE_LISTA }));
});
