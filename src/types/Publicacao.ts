import type { TagTematica } from "../constants/tagsTematicas";

export type TipoPublicacao = "teoria" | "investigacao";

export interface Publicacao {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  tipo: TipoPublicacao;
  autorId: string;
  data: string;
  comentarios: number;
  // Temas do catálogo controlado (ADR-018). Pode ser vazio quando nenhum tema do catálogo se aplica.
  tags: TagTematica[];
  // Palavras-chave de texto livre, mantidas como estavam. Entram na busca e aparecem na página da
  // publicação, separadas dos temas, porque não foram migradas para o catálogo.
  termos: string[];
}
