"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

import { Badge } from "../ui/Badge";

// Rótulo das seções sem fonte real (ADR-010, ADR-039). `BlocoDemonstracao` envolve conteúdo de exemplo e
// `SemDados` mostra o estado vazio quando não há exemplo para o slug. Nenhum dos dois grava nada.
export function BlocoDemonstracao({ children }: { children: ReactNode }) {
  return (
    <Bloco>
      <Selo>
        <Badge size="small" variant="secondary" uppercase>
          Demonstração
        </Badge>
        <Nota>Conteúdo de exemplo. Não são ações nem registros reais desta investigação.</Nota>
      </Selo>
      {children}
    </Bloco>
  );
}

export function SemDados({ children }: { children?: ReactNode }) {
  return (
    <Bloco role="status">
      <Selo>
        <Badge size="small" variant="secondary" uppercase>
          Demonstração
        </Badge>
      </Selo>
      <Nota>Informação ainda não disponível. {children}</Nota>
    </Bloco>
  );
}

const Bloco = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Selo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
