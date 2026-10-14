export type TipoAtualizacao = "novo" | "atualizado";

export interface Atualizacao {
  id: string;
  titulo: string;
  tipo: TipoAtualizacao;
  data: string;
}
