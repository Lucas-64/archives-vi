"use client";

import styled from "styled-components";

import { AcaoRestrita } from "../acoes/AcaoRestrita";
import type { Criador } from "../../types/Criador";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import { MenuAcoesPerfil } from "./MenuAcoesPerfil";

export interface ProfileHeaderProps {
  criador: Criador;
}

// Cabeçalho do perfil público: avatar de iniciais, nome, @usuario, bio e ações sociais.
// Data de entrada, jogos e interesses não existem em Criador: não são exibidos, sem texto de
// substituição. Seguir exige conta (ADR-010): a ação fica desabilitada, com link para /entrar.
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
      <Acoes>
        <AcaoRestrita rotulo="Seguir" mensagem="Seguir exige conta." />
        <MenuAcoesPerfil />
      </Acoes>
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

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;
