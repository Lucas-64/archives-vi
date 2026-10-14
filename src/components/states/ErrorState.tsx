"use client";

import styled from "styled-components";

import { Button } from "../ui/Button";

export interface ErrorStateProps {
  titulo?: string;
  descricao?: string;
  onRetry?: () => void;
}

export function ErrorState({
  titulo = "Não foi possível carregar este conteúdo",
  descricao = "Algo deu errado do nosso lado. Tente novamente em instantes.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Container role="alert">
      <Titulo>{titulo}</Titulo>
      <Descricao>{descricao}</Descricao>
      {onRetry ? (
        <Button variant="outline" size="medium" onClick={onRetry}>
          Tentar de novo
        </Button>
      ) : null}
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
  border: 1px solid ${({ theme }) => theme.colors.debunked};
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
  margin-bottom: 8px;
`;
