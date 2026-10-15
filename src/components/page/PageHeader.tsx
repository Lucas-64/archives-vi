"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

// Title block shared by list pages (Publicações, Investigações, Explorar...).
export function PageHeader({ titulo, descricao, acao }: PageHeaderProps) {
  return (
    <Header>
      <TextBlock>
        <Titulo>{titulo}</Titulo>
        {descricao ? <Descricao>{descricao}</Descricao> : null}
      </TextBlock>
      {acao ? <div>{acao}</div> : null}
    </Header>
  );
}

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 0 8px;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;

  @media (max-width: 767px) {
    font-size: 34px;
  }
`;

const Descricao = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
