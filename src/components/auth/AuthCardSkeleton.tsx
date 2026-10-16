"use client";

import styled from "styled-components";

import { Card } from "../ui/Card";
import { Skeleton } from "../states/Skeleton";

export interface AuthCardSkeletonProps {
  campos: number;
}

// Loading placeholder with the same shape as AuthCard: title, context, fields, button and notice.
export function AuthCardSkeleton({ campos }: AuthCardSkeletonProps) {
  return (
    <Pagina>
      <Card variant="elevated" padding="large">
        <Pilha>
          <Skeleton height="32px" width="50%" />
          <Skeleton height="44px" />
          {Array.from({ length: campos }, (_, indice) => (
            <Skeleton key={indice} height="68px" />
          ))}
          <Skeleton height="44px" radius="md" />
          <Skeleton height="64px" radius="md" />
        </Pilha>
      </Card>
    </Pagina>
  );
}

const Pagina = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 32px 0 48px;
  min-width: 0;
`;

const Pilha = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
