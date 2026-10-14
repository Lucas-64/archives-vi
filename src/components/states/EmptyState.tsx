"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface EmptyStateProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

export function EmptyState({ titulo, descricao, acao }: EmptyStateProps) {
  return (
    <Container role="status">
      <Titulo>{titulo}</Titulo>
      {descricao ? <Descricao>{descricao}</Descricao> : null}
      {acao ? <Acao>{acao}</Acao> : null}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Descricao = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acao = styled.div`
  margin-top: 8px;
`;
