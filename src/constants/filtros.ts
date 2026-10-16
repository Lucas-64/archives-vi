import type { CategoriaInvestigacao } from "../lib/investigacao";
import type { TipoPublicacao } from "../types/Publicacao";

export interface FiltroTipoPublicacao {
  label: string;
  value: TipoPublicacao | undefined;
}

export interface FiltroCategoriaInvestigacao {
  label: string;
  value: CategoriaInvestigacao | undefined;
  // Value used in the URL (?categoria=...). Undefined for "Todas".
  slug: string | undefined;
}

// Filtros de /investigacoes, aplicados pela URL (?categoria=...). Mesmos rótulos de CATEGORIAS_INVESTIGACAO.
export const FILTROS_INVESTIGACOES: readonly FiltroCategoriaInvestigacao[] = [
  { label: "Todas", value: undefined, slug: undefined },
  { label: "Em andamento", value: "Em andamento", slug: "em-andamento" },
  { label: "Resolvidas", value: "Resolvidas", slug: "resolvidas" },
  { label: "Sem fontes", value: "Sem fontes", slug: "sem-fontes" },
];

// Filtros de /publicacoes, aplicados pela URL (?tipo=...).
export const FILTROS_PUBLICACOES: readonly FiltroTipoPublicacao[] = [
  { label: "Todas", value: undefined },
  { label: "Teorias", value: "teoria" },
  { label: "Investigações", value: "investigacao" },
];
