"use client";

import styled from "styled-components";

import { formatarData } from "../../lib/formatacao";
import type { RegistroHistorico } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";

export interface HistoricoTimelineProps {
  registros: RegistroHistorico[];
}

// Vertical timeline of edits. Dates are shown in order from the oldest record.
export function HistoricoTimeline({ registros }: HistoricoTimelineProps) {
  return (
    <Lista aria-label="Linha do tempo de edições">
      {registros.map((registro) => (
        <Item key={registro.id}>
          <Data dateTime={registro.data}>{formatarData(registro.data)}</Data>
          <Corpo>
            <Titulo>{registro.titulo}</Titulo>
            <Autor>
              <Avatar nome={registro.autor.nome} size="small" />
              <span>
                {registro.autor.nome} <Usuario>@{registro.autor.usuario}</Usuario>
              </span>
            </Autor>
            <Resumo>{registro.resumo}</Resumo>
          </Corpo>
        </Item>
      ))}
    </Lista>
  );
}

const Lista = styled.ol`
  display: flex;
  flex-direction: column;
  list-style: none;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 16px;
  position: relative;
  padding-bottom: 24px;

  &::before {
    content: "";
    position: absolute;
    left: 108px;
    top: 6px;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.border};
  }

  &:last-child::before {
    display: none;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 6px;
    padding-left: 20px;

    &::before {
      left: 4px;
    }
  }
`;

const Data = styled.time`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-right: 20px;
`;

const Corpo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const Titulo = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Autor = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Usuario = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Resumo = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
