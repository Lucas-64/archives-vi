import type { TipoPublicacao } from "../types/Publicacao";

export interface FiltroTipoPublicacao {
  label: string;
  value: TipoPublicacao | undefined;
}

// Filtros de /publicacoes, aplicados pela URL (?tipo=...).
export const FILTROS_PUBLICACOES: readonly FiltroTipoPublicacao[] = [
  { label: "Todas", value: undefined },
  { label: "Teorias", value: "teoria" },
  { label: "Investigações", value: "investigacao" },
];
