import { FiCamera, FiFileText, FiMapPin, FiSearch } from "react-icons/fi";
import type { IconType } from "react-icons";

import type { SecaoImagem } from "./imagensSecoes";
import { ROUTES } from "./routes";

export interface ExplorarItem {
  titulo: string;
  descricao: string;
  icon: IconType;
  // null means visual only: the tile is shown without a functional link yet.
  href: string | null;
  // Key of the section image in IMAGENS_SECOES.
  secao: SecaoImagem;
}

export const EXPLORAR_ITENS: readonly ExplorarItem[] = [
  {
    titulo: "Mistérios",
    secao: "misterios",
    descricao: "Descubra os mistérios mais intrigantes de GTA VI.",
    icon: FiSearch,
    href: ROUTES.misterios,
  },
  {
    titulo: "Teorias da comunidade",
    secao: "teorias",
    descricao: "As melhores teorias criadas pelos jogadores.",
    icon: FiFileText,
    href: ROUTES.teorias,
  },
  {
    titulo: "Mapa interativo",
    secao: "mapa",
    descricao: "Marque e confira locais suspeitos em Leonida.",
    icon: FiMapPin,
    href: null,
  },
  {
    titulo: "Galeria",
    secao: "galeria",
    descricao: "Screenshots e vídeos enviados pela comunidade.",
    icon: FiCamera,
    href: null,
  },
];
