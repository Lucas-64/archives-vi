"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Criador } from "../../types/Criador";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";

export interface CreatorCardProps {
  criador: Criador;
  // Heading level of the name. Use 3 when the card sits under an h2 section heading.
  nivelTitulo?: 2 | 3;
}

export function CreatorCard({ criador, nivelTitulo = 2 }: CreatorCardProps) {
  return (
    <Card padding="medium" hoverable>
      <Cabecalho>
        <Avatar nome={criador.nome} size="medium" />
        <Identidade>
          <Nome as={nivelTitulo === 3 ? "h3" : "h2"}>
            <Link href={ROUTES.perfil(criador.usuario)}>{criador.nome}</Link>
          </Nome>
          <Usuario>@{criador.usuario}</Usuario>
        </Identidade>
      </Cabecalho>
      <Bio>{criador.bio}</Bio>
    </Card>
  );
}

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const Identidade = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Nome = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  a {
    color: ${({ theme }) => theme.colors.text};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const Usuario = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Bio = styled.p`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
