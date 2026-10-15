"use client";

import styled from "styled-components";

import type { Criador } from "../../types/Criador";
import { SidebarBox } from "./SidebarBox";

export interface AutorCardProps {
  autor: Criador;
}

export function AutorCard({ autor }: AutorCardProps) {
  return (
    <SidebarBox titulo="Sobre o autor">
      <Nome>{autor.nome}</Nome>
      <Usuario>@{autor.usuario}</Usuario>
      <Bio>{autor.bio}</Bio>
    </SidebarBox>
  );
}

const Nome = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Usuario = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.pink};
`;

const Bio = styled.p`
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
