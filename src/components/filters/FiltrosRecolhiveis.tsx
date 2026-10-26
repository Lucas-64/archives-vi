"use client";

import { useId, useState, type ReactNode } from "react";
import styled from "styled-components";

export interface FiltrosRecolhiveisProps {
  children: ReactNode;
  // Texto curto mostrado ao lado do botão quando há filtro ativo e o painel está oculto.
  resumoAtivo?: string;
}

// Componente reutilizável de mostrar e ocultar filtros. Ocultar só esconde o painel: a seleção continua
// aplicada (ela vive na URL ou no estado de quem usa o componente). Estado inicial: sempre oculto, no
// celular e no desktop; o painel só aparece depois do clique no botão.
export function FiltrosRecolhiveis({ children, resumoAtivo }: FiltrosRecolhiveisProps) {
  const [aberto, setAberto] = useState(false);
  const idPainel = useId();

  return (
    <Area>
      <Barra>
        <Botao
          type="button"
          aria-expanded={aberto}
          aria-controls={idPainel}
          onClick={() => setAberto((valor) => !valor)}
        >
          {aberto ? "Ocultar filtros" : "Mostrar filtros"}
        </Botao>
        {resumoAtivo && !aberto ? <Ativo>{resumoAtivo}</Ativo> : null}
      </Barra>

      <Painel id={idPainel} hidden={!aberto}>
        {children}
      </Painel>
    </Area>
  );
}

const Area = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const Barra = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
`;

const Botao = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.card};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;

const Ativo = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// `hidden` precisa vencer o display do painel. Por isso o seletor explícito.
const Painel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  &[hidden] {
    display: none;
  }
`;
