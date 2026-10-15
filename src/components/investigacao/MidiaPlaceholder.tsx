"use client";

import styled from "styled-components";

import type { OrigemEvidencia } from "../../types/InvestigacaoDetalhe";

// Labeled placeholder for media. It never loads external URLs or third-party images.
// Real media can later replace this block through the same origin-based rule.
const TEXTO_PLACEHOLDER: Record<OrigemEvidencia, string | null> = {
  imagem_propria: "Placeholder: imagem própria ainda não publicada.",
  imagem_terceiro: "Placeholder: imagem de terceiro, sem link externo.",
  origem_nao_verificada: "Sem imagem disponível. Origem não verificada.",
  referencia_textual: null,
};

export interface MidiaPlaceholderProps {
  origem: OrigemEvidencia;
}

export function MidiaPlaceholder({ origem }: MidiaPlaceholderProps) {
  const texto = TEXTO_PLACEHOLDER[origem];
  if (!texto) return null;

  return (
    <Caixa role="img" aria-label={texto}>
      <Rotulo>{texto}</Rotulo>
    </Caixa>
  );
}

const Caixa = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  padding: 16px;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  @media (max-width: 767px) {
    height: 140px;
  }
`;

const Rotulo = styled.span`
  max-width: 420px;
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
