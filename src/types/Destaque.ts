import type { StaticImageData } from "next/image";

export interface Destaque {
  id: string;
  titulo: string;
  descricao: string;
  image: StaticImageData;
  investigacaoId: string;
}
