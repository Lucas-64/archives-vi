import type { TagTematica } from "../constants/tagsTematicas";

export type TipoPublicacao = "teoria" | "investigacao";

export interface Publicacao {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  // Texto completo. Presente quando vem da API; os dados antigos só têm o resumo.
  corpo?: string;
  // Imagem enviada pela pessoa (URL pública do Vercel Blob, ADR-043). A imagem padrão é aplicada na leitura.
  imagemUrl?: string;
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
