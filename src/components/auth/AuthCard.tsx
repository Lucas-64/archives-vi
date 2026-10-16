"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

import { Card } from "../ui/Card";

export interface AuthCardProps {
  titulo: string;
  contexto: string;
  children: ReactNode;
  rodape?: ReactNode;
}

// Centered card shared by /entrar and /criar-conta. Max width 420px; full width on mobile.
export function AuthCard({ titulo, contexto, children, rodape }: AuthCardProps) {
  return (
    <Pagina>
      <Card variant="elevated" padding="large">
        <Cabecalho>
          <Titulo>{titulo}</Titulo>
          <Contexto>{contexto}</Contexto>
        </Cabecalho>
        {children}
        {rodape ? <Rodape>{rodape}</Rodape> : null}
      </Card>
    </Pagina>
  );
}

// Field stack used by both forms.
export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// Makes the submit button fill the card width.
export const AuthBotao = styled.div`
  & > button {
    width: 100%;
  }
`;

const Pagina = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 32px 0 48px;
  min-width: 0;
`;

const Cabecalho = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
`;

const Contexto = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Rodape = styled.p`
  margin-top: 20px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;
