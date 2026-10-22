"use client";

import Image from "next/image";
import styled from "styled-components";

import { MEDALHAS, MEDALHA_DA_PATENTE } from "../../constants/medalhasPatente";

export interface MedalhaPatenteProps {
  // Id da patente (Patente.id). A medalha vem de MEDALHA_DA_PATENTE.
  patenteId: string;
  tamanho: "destaque" | "compacta";
  // Texto alternativo quando a medalha informa algo (patente atual ou anterior).
  titulo?: string;
}

// Medalha da patente, em imagem SVG (src/assets/images/medalha-*.svg). Sem `titulo`, é decorativa e fica
// oculta para leitores de tela. Patente sem medalha registrada não mostra nada.
export function MedalhaPatente({ patenteId, tamanho, titulo }: MedalhaPatenteProps) {
  const id = MEDALHA_DA_PATENTE[patenteId];
  if (!id) return null;

  const imagem = MEDALHAS[id];

  return (
    <Wrapper $tamanho={tamanho}>
      <Image src={imagem} alt={titulo ?? ""} aria-hidden={titulo === undefined ? true : undefined} unoptimized />
    </Wrapper>
  );
}

// Proporção dos arquivos: 240 x 300. A largura define o tamanho, e a altura acompanha.
const Wrapper = styled.span<{ $tamanho: "destaque" | "compacta" }>`
  display: inline-block;
  flex: 0 0 auto;
  width: ${({ $tamanho }) => ($tamanho === "destaque" ? "96px" : "36px")};

  img {
    display: block;
    width: 100%;
    height: auto;
  }
`;
