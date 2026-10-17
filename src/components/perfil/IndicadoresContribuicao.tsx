"use client";

import styled from "styled-components";

import { formatarNumero } from "../../lib/formatacao";
import type { ContagensContribuicao } from "../../lib/perfil";

export interface IndicadoresContribuicaoProps {
  contagens: ContagensContribuicao;
}

// Faixa compacta de indicadores. Os números vêm de contarContribuicoes (src/lib/perfil.ts);
// este componente só apresenta. Não há seguidores, curtidas, reconhecimento nem XP aqui.
export function IndicadoresContribuicao({ contagens }: IndicadoresContribuicaoProps) {
  return (
    <Secao aria-label="Indicadores de contribuição">
      <Faixa>
        <Item>
          <Valor>{formatarNumero(contagens.investigacoesCriadas)}</Valor>
          <Rotulo>Investigações criadas</Rotulo>
        </Item>
        <Item>
          <Valor>{formatarNumero(contagens.teoriasPublicadas)}</Valor>
          <Rotulo>Teorias publicadas</Rotulo>
        </Item>
        <Item>
          <Valor>{formatarNumero(contagens.evidenciasEnviadas)}</Valor>
          <Rotulo>Evidências enviadas</Rotulo>
        </Item>
      </Faixa>
      <Nota>
        Contagens calculadas a partir dos dados demonstrativos do site. Investigações criadas considera
        apenas as que têm detalhe publicado.
      </Nota>
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

const Faixa = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  min-width: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-right: 0;
  }

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
