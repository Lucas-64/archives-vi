import type { StaticImageData } from "next/image";

import medalha01 from "../assets/images/medalha-01.svg";
import medalha02 from "../assets/images/medalha-02.svg";
import medalha03 from "../assets/images/medalha-03.svg";
import medalha04 from "../assets/images/medalha-04.svg";
import medalha05 from "../assets/images/medalha-05.svg";
import medalha06 from "../assets/images/medalha-06.svg";
import medalha07 from "../assets/images/medalha-07.svg";
import medalha08 from "../assets/images/medalha-08.svg";
import medalha09 from "../assets/images/medalha-09.svg";

// As nove medalhas disponíveis, da mais baixa (01) à mais alta (09). Os arquivos não são alterados.
export const MEDALHAS = {
  "medalha-01": medalha01,
  "medalha-02": medalha02,
  "medalha-03": medalha03,
  "medalha-04": medalha04,
  "medalha-05": medalha05,
  "medalha-06": medalha06,
  "medalha-07": medalha07,
  "medalha-08": medalha08,
  "medalha-09": medalha09,
} as const satisfies Record<string, StaticImageData>;

export type IdMedalha = keyof typeof MEDALHAS;

// Único lugar que liga uma patente (Patente.id) à sua medalha. Acrescentar uma patente é adicionar uma linha.
// As medalhas 02, 04, 05, 07 e 08 estão registradas acima e ainda sem uso.
export const MEDALHA_DA_PATENTE: Readonly<Record<string, IdMedalha>> = {
  observador: "medalha-01",
  "analista-de-campo": "medalha-03",
  investigador: "medalha-06",
  "investigador-senior": "medalha-09",
};
