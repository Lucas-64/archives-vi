// Camada de dados da interface. Hoje devolve mocks; quando houver backend,
// só este arquivo precisa mudar. Funções assíncronas para manter o contrato
// de Server Components.
import { destaques, investigacoes } from "@/mocks/investigacoes";
import { atualizacoes } from "@/mocks/atualizacoes";
import { topicos } from "@/mocks/topicos";
import { investigadoresOnline } from "@/mocks/atividade";
import { publicacoes } from "@/mocks/publicacoes";
import { investigacaoDetalhes } from "@/mocks/investigacaoDetalhe";
import type { InvestigacaoDetalhe } from "@/types/InvestigacaoDetalhe";
import { criadores } from "@/mocks/criadores";
import type { Case } from "@/types/Case";
import type { Atualizacao } from "@/types/Atualizacao";
import type { Criador } from "@/types/Criador";
import type { Destaque } from "@/types/Destaque";
import type { Publicacao, TipoPublicacao } from "@/types/Publicacao";
import type { Topico } from "@/types/Topico";

// Estados de teste da interface. Só têm efeito fora de produção (next dev).
export const SIMULACOES = ["vazio", "erro", "lento"] as const;
export type Simulacao = (typeof SIMULACOES)[number];

async function aplicarSimulacao(simular?: Simulacao) {
  if (process.env.NODE_ENV === "production" || !simular) return;
  if (simular === "erro") {
    throw new Error("Erro simulado para teste de interface.");
  }
  if (simular === "lento") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

export async function getDestaques(): Promise<Destaque[]> {
  return destaques;
}

export async function getInvestigacoes(): Promise<Case[]> {
  return investigacoes;
}

export async function getInvestigacoesEmAlta(limite = 3): Promise<Case[]> {
  return investigacoes.slice(0, limite);
}

// The listing record (Case) and its detail are joined by id. The detail is optional:
// a listed investigation may not have its detailed content published yet.
export async function getInvestigacaoPorSlug(
  slug: string,
): Promise<{ caso: Case; detalhe: InvestigacaoDetalhe | undefined } | undefined> {
  const caso = investigacoes.find((item) => item.id === slug);
  if (!caso) return undefined;

  return {
    caso,
    detalhe: investigacaoDetalhes.find((item) => item.id === slug),
  };
}

export interface FiltroPublicacoes {
  tipo?: TipoPublicacao;
  simular?: Simulacao;
}

export async function getPublicacoes(
  filtro: FiltroPublicacoes = {},
): Promise<Publicacao[]> {
  await aplicarSimulacao(filtro.simular);
  if (filtro.simular === "vazio") return [];

  return publicacoes
    .filter((item) => !filtro.tipo || item.tipo === filtro.tipo)
    .sort((a, b) => b.data.localeCompare(a.data));
}

export async function getPublicacaoPorSlug(
  slug: string,
): Promise<Publicacao | undefined> {
  return publicacoes.find((item) => item.slug === slug);
}

export async function getPublicacoesRelacionadas(
  publicacao: Publicacao,
  limite = 3,
): Promise<Publicacao[]> {
  return publicacoes
    .filter((item) => item.tipo === publicacao.tipo && item.id !== publicacao.id)
    .slice(0, limite);
}

export async function getCriadores(): Promise<Criador[]> {
  return criadores;
}

export async function getCriadorPorId(id: string): Promise<Criador | undefined> {
  return criadores.find((item) => item.id === id);
}

export async function getTopicosForum(): Promise<Topico[]> {
  return topicos;
}

export async function getAtualizacoes(): Promise<Atualizacao[]> {
  return atualizacoes;
}

export async function getInvestigadoresOnline(): Promise<number> {
  return investigadoresOnline;
}
