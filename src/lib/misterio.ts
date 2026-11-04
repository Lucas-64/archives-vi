import { classificacaoPorId } from "./investigacao";
import type { ClassificacaoMisterioId } from "../constants/classificacoesMisterio";
import { CLASSIFICACOES_MISTERIO } from "../constants/classificacoesMisterio";

// Classificação do mistério lida da coluna do banco (ADR-044). Valor desconhecido cai na primeira da lista.
export function classificacaoDoMisterio(id: string) {
  return classificacaoPorId(id as ClassificacaoMisterioId);
}

export function lerClassificacaoMisterio(valor?: string) {
  return CLASSIFICACOES_MISTERIO.find((item) => item.id === valor);
}

export function textoInvestigacoesAbertas(total: number): string {
  if (total === 0) return "Nenhuma investigação aberta";
  return total === 1 ? "1 investigação aberta" : `${total} investigações abertas`;
}
