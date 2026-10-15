import type { StaticImageData } from "next/image";

import galeryDay from "../assets/images/galery_day.jpg";
import mapDay from "../assets/images/map_day.jpg";
import misteryNight from "../assets/images/misterys_night.jpg";
import teoryNight from "../assets/images/teory_night.jpg";

// Single place for section images and their visual theme.
// Only file references live here: components never hardcode image paths.
//
// Future day/night switch: "dia" entries belong to the day theme and "noite" entries to the
// night theme. The theme value is metadata only; nothing switches automatically yet.
export type TemaVisual = "dia" | "noite";

export type SecaoImagem = "misterios" | "teorias" | "mapa" | "galeria";

export interface ImagemSecao {
  image: StaticImageData;
  tema: TemaVisual;
}

// `null` means the file has not been provided yet. The section renders without media.
export const IMAGENS_SECOES: Record<SecaoImagem, ImagemSecao | null> = {
  galeria: { image: galeryDay, tema: "dia" },
  mapa: { image: mapDay, tema: "dia" },
  misterios: { image: misteryNight, tema: "noite" },
  teorias: { image: teoryNight, tema: "noite" },
};

export function imagemDaSecao(secao: SecaoImagem): ImagemSecao | null {
  return IMAGENS_SECOES[secao];
}
