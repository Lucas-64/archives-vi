"use client";

import styled from "styled-components";

import { formatarNumero } from "../../lib/formatacao";

export interface IndicadorContribuicao {
  rotulo: string;
  valor: number;
}

export interface IndicadoresContribuicaoProps {
  itens: readonly IndicadorContribuicao[];
  // Explica de onde vêm os números. Opcional.
  nota?: string;
}

// Faixa compacta de indicadores. Os números chegam prontos (perfil real, vindos do servidor);
// este componente só apresenta. Não há seguidores, curtidas, reconhecimento nem XP aqui.
export function IndicadoresContribuicao({ itens, nota }: IndicadoresContribuicaoProps) {
  return (
    <Secao aria-label="Indicadores de contribuição">
      <Faixa $colunas={itens.length}>
        {itens.map((item) => (
          <Item key={item.rotulo}>
            <Valor>{formatarNumero(item.valor)}</Valor>
            <Rotulo>{item.rotulo}</Rotulo>
          </Item>
        ))}
      </Faixa>
      {nota ? <Nota>{nota}</Nota> : null}
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const Faixa = styled.dl<{ $colunas: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $colunas }) => $colunas}, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  // Os separadores são o fundo aparecendo entre as células, o que funciona com qualquer número de colunas.
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;

  @media (max-width: 767px) {
    grid-template-columns: repeat(${({ $colunas }) => Math.min($colunas, 2)}, minmax(0, 1fr));
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  min-width: 0;
  background: ${({ theme }) => theme.colors.card};

  @media (max-width: 767px) {
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  }
`;

const Valor = styled.dt`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 767px) {
    font-size: 22px;
  }
`;

const Rotulo = styled.dd`
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
