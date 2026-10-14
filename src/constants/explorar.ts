import { FiFileText, FiImage, FiMapPin, FiSearch } from "react-icons/fi";
import type { IconType } from "react-icons";

import { ROUTES } from "./routes";

export interface ExplorarItem {
  titulo: string;
  descricao: string;
  icon: IconType;
  // null means visual only: the tile is shown without a functional link yet.
  href: string | null;
}

export const EXPLORAR_ITENS: readonly ExplorarItem[] = [
  {
    titulo: "Mistérios",
    descricao: "Investigue os mistérios mais discutidos pela comunidade.",
    icon: FiSearch,
    href: ROUTES.misterios,
  },
  {
    titulo: "Teorias da comunidade",
    descricao: "Leia as teorias e análises publicadas pelos membros.",
    icon: FiFileText,
    href: ROUTES.teorias,
  },
  {
    titulo: "Mapa interativo",
    descricao: "Marque e investigue locais de Leonida.",
    icon: FiMapPin,
    href: null,
  },
  {
    titulo: "Galeria",
    descricao: "Imagens e capturas organizadas por investigação.",
    icon: FiImage,
    href: null,
  },
];
