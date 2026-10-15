"use client";

import styled from "styled-components";

import type { AvaliacoesEvidencia } from "../../types/InvestigacaoDetalhe";

export interface AvaliacoesContagemProps {
  avaliacoes: AvaliacoesEvidencia;
}

// Individual counts only. No total, percentage, score or ranking.
export function AvaliacoesContagem({ avaliacoes }: AvaliacoesContagemProps) {
  const itens = [
    { rotulo: "Relevante", valor: avaliacoes.relevante },
    { rotulo: "Contradiz", valor: avaliacoes.contradiz },
    { rotulo: "Precisa de contexto", valor: avaliacoes.precisaContexto },
  ];

  return (
    <Lista aria-label="Avaliações desta evidência">
      {itens.map((item) => (
        <Item key={item.rotulo}>
          <span>{item.rotulo}</span>
          <Valor>{item.valor}</Valor>
        </Item>
      ))}
    </Lista>
  );
}

const Lista = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
`;

const Item = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Valor = styled.strong`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;
