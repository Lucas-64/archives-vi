import {
  CLASSIFICACAO_PADRAO,
  CLASSIFICACAO_POR_SLUG,
  CLASSIFICACAO_POR_STATUS,
  CLASSIFICACOES_MISTERIO,
  type ClassificacaoMisterio,
  type ClassificacaoMisterioId,
} from "../constants/classificacoesMisterio";
import type { CaseStatus } from "../types/Case";

export function classificacaoPorId(id: ClassificacaoMisterioId): ClassificacaoMisterio {
  return CLASSIFICACOES_MISTERIO.find((item) => item.id === id) ?? CLASSIFICACOES_MISTERIO[0];
}

// A exceção por slug (provisória) vence o status; sem mapeamento, vale a classificação padrão.
export function classificacaoDoCaso(caso: { id: string; status: CaseStatus }): ClassificacaoMisterio {
  return classificacaoPorId(
    CLASSIFICACAO_POR_SLUG[caso.id] ?? CLASSIFICACAO_POR_STATUS[caso.status] ?? CLASSIFICACAO_PADRAO,
  );
}

// Lê a classificação do valor da URL. Valor desconhecido ou ausente vira undefined ("Todas").
export function lerClassificacao(valor?: string): ClassificacaoMisterio | undefined {
  return CLASSIFICACOES_MISTERIO.find((item) => item.id === valor);
}

// Sem classificação, devolve todos os registros. Com classificação, só os registros dela.
export function filtrarInvestigacoes<T extends { id: string; status: CaseStatus }>(
  casos: readonly T[],
  classificacao?: ClassificacaoMisterio,
): T[] {
  if (!classificacao) return [...casos];
  return casos.filter((caso) => classificacaoDoCaso(caso).id === classificacao.id);
}
