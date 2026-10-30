import type { StaticImageData } from "next/image";

import imagemPadrao from "../assets/images/exemplo.jpg";

// PONTO ÚNICO da imagem de capa padrão das investigações (ADR-042). Para trocá-la, troque só o arquivo importado
// acima. É aplicada na LEITURA, quando a investigação (ou a publicação) não tem imagem própria; ela nunca é gravada
// no registro. `exemplo.jpg` não é imagem de seção (CLAUDE.md: imagens de seção não entram em conteúdo de usuário).
export const IMAGEM_PADRAO_INVESTIGACAO: StaticImageData = imagemPadrao;

export type ImagemDeCapa = string | StaticImageData;

// Imagem de capa a mostrar: a enviada (endereço https ou imagem do mock) ou, se vazia, a padrão.
export function imagemDaInvestigacao(capa?: ImagemDeCapa | null): ImagemDeCapa {
  if (typeof capa === "string") return capa.trim() !== "" ? capa.trim() : IMAGEM_PADRAO_INVESTIGACAO;
  return capa ?? IMAGEM_PADRAO_INVESTIGACAO;
}
