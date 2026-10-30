// Cópia dedicada de lib/investigacao.ts do commit 355b30ad (ADR-041): rótulos de categoria do CaseCard clássico.
import type { CaseStatus } from "../types/Case";

// Categorias visíveis na interface (aprovadas pelo projeto).
export type CategoriaInvestigacao = "Em andamento" | "Resolvidas" | "Sem fontes";

export const CATEGORIAS_INVESTIGACAO: readonly CategoriaInvestigacao[] = [
  "Em andamento",
  "Resolvidas",
  "Sem fontes",
];

// Mapeamento explícito entre os estados internos e as categorias visíveis.
// `null` significa que o estado ainda não foi validado: o registro mantém o rótulo
// original e não aparece nas abas de categoria.
// Pendente de validação: `community` e `classified` (ver docs/DESIGN_SYSTEM.md).
export const CATEGORIA_POR_STATUS: Record<CaseStatus, CategoriaInvestigacao | null> = {
  investigating: "Em andamento",
  confirmed: "Resolvidas",
  debunked: "Resolvidas",
  community: null,
  classified: null,
};

export function categoriaDoStatus(status: CaseStatus): CategoriaInvestigacao | null {
  return CATEGORIA_POR_STATUS[status];
}

// "Todas" (categoria undefined) returns every record, including unmapped statuses.
// Any category returns only the records mapped to it.
export function filtrarInvestigacoes<T extends { status: CaseStatus }>(
  casos: readonly T[],
  categoria?: CategoriaInvestigacao,
): T[] {
  if (!categoria) return [...casos];
  return casos.filter((caso) => categoriaDoStatus(caso.status) === categoria);
}
