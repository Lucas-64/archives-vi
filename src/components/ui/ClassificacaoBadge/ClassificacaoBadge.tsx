"use client";

import styled from "styled-components";

import type { ClassificacaoMisterio } from "../../../constants/classificacoesMisterio";
import type { theme } from "../../../styles/theme";

export interface ClassificacaoBadgeProps {
  classificacao: ClassificacaoMisterio;
  size?: "small" | "medium";
}

// Selo informativo de classificação de mistério. A cor vem do token indicado na fonte única. Não é um
// controle: sem hover, sem cursor de ação e sem sublinhado, para o rosa do Easter egg não parecer link.
export function ClassificacaoBadge({ classificacao, size = "small" }: ClassificacaoBadgeProps) {
  return (
    <Selo $cor={classificacao.cor} $size={size}>
      <Ponto aria-hidden="true" />
      {classificacao.rotulo}
    </Selo>
  );
}

const Selo = styled.span<{ $cor: keyof typeof theme.colors; $size: "small" | "medium" }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: fit-content;
  min-height: ${({ $size }) => ($size === "small" ? "22px" : "28px")};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ $cor, theme }) => `color-mix(in srgb, ${theme.colors[$cor]} 14%, transparent)`};
  color: ${({ $cor, theme }) => theme.colors[$cor]};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: default;
  user-select: none;
`;

const Ponto = styled.span`
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: currentColor;
`;
