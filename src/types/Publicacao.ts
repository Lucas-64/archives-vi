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
  tags: string[];
}
