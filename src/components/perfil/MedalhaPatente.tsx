"use client";

import styled from "styled-components";

import type { VarianteMedalha } from "../../types/Patente";

export interface MedalhaPatenteProps {
  variante: VarianteMedalha;
  tamanho: "destaque" | "compacta";
  // Texto alternativo quando a medalha informa algo (patente atual ou anterior).
  titulo?: string;
}

// Medalha provisória em SVG, sem imagens externas. A cor vem do tema (ver COR_DA_VARIANTE), e o
// desenho é o mesmo em todas as variantes, para não sugerir uma hierarquia de regras.
// Sem `titulo`, a medalha é decorativa e fica oculta para leitores de tela.
export function MedalhaPatente({ variante, tamanho, titulo }: MedalhaPatenteProps) {
  const informativa = titulo !== undefined;

  return (
    <Wrapper
      $variante={variante}
      $tamanho={tamanho}
      role={informativa ? "img" : undefined}
      aria-label={informativa ? titulo : undefined}
      aria-hidden={informativa ? undefined : true}
    >
      <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {variante === "destaque" ? (
          <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="1" />
        ) : null}
        <circle cx="24" cy="24" r="14" fill="currentColor" fillOpacity="0.15" />
        <polygon
          points="24,15 26.35,20.76 32.56,21.22 27.8,25.24 29.29,31.28 24,28 18.71,31.28 20.2,25.24 15.44,21.22 21.65,20.76"
          fill="currentColor"
        />
      </svg>
    </Wrapper>
  );
}

// Cada variante usa um token do tema. Nenhum valor de cor é escrito aqui.
const COR_DA_VARIANTE = {
  inicial: (tema: { colors: { textSecondary: string } }) => tema.colors.textSecondary,
  intermediaria: (tema: { colors: { purple: string } }) => tema.colors.purple,
  investigador: (tema: { colors: { pink: string } }) => tema.colors.pink,
  destaque: (tema: { colors: { investigating: string } }) => tema.colors.investigating,
} as const;

const Wrapper = styled.span<{ $variante: VarianteMedalha; $tamanho: "destaque" | "compacta" }>`
  display: inline-block;
  flex: 0 0 auto;
  width: ${({ $tamanho }) => ($tamanho === "destaque" ? "104px" : "40px")};
  height: ${({ $tamanho }) => ($tamanho === "destaque" ? "104px" : "40px")};
  color: ${({ $variante, theme }) => COR_DA_VARIANTE[$variante](theme)};

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
