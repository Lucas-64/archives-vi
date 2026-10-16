"use client";

import styled from "styled-components";

import type { Criador } from "../../types/Criador";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";

export interface ProfileHeaderProps {
  criador: Criador;
}

// Cabeçalho do perfil público: avatar, nome, @usuario e bio. Não há ações nesta versão.
export function ProfileHeader({ criador }: ProfileHeaderProps) {
  return (
    <Card padding="large">
      <Cabecalho>
        <Avatar nome={criador.nome} size="medium" />
        <Identidade>
          <Nome>{criador.nome}</Nome>
          <Usuario>@{criador.usuario}</Usuario>
        </Identidade>
      </Cabecalho>
      <Bio>{criador.bio}</Bio>
    </Card>
  );
}

const Cabecalho = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const Identidade = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Nome = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 28px;
  }
`;

const Usuario = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Bio = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;
