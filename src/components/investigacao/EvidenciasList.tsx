"use client";

import styled from "styled-components";

import { AcaoRestrita } from "../acoes/AcaoRestrita";
import type { Evidencia } from "../../types/InvestigacaoDetalhe";
import { EvidenciaCard } from "./EvidenciaCard";

export interface EvidenciasListProps {
  evidencias: Evidencia[];
  total: number;
}

// Vertical list, one card per row, at every screen size (same decision as /publicacoes).
export function EvidenciasList({ evidencias, total }: EvidenciasListProps) {
  return (
    <Wrapper>
      <Cabecalho>
        <Resumo>
          Exibindo {evidencias.length} de {total} evidências. Dados demonstrativos.
        </Resumo>
        <AcaoRestrita rotulo="+ Adicionar pista" mensagem="Adicionar pistas exige autenticação." />
      </Cabecalho>

      <Lista>
        {evidencias.map((evidencia) => (
          <li key={evidencia.id}>
            <EvidenciaCard evidencia={evidencia} />
          </li>
        ))}
      </Lista>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
`;

const Resumo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Lista = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
`;
