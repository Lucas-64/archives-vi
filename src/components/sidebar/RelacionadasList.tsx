"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Publicacao } from "../../types/Publicacao";
import { SidebarBox } from "./SidebarBox";

export interface RelacionadasListProps {
  publicacoes: Publicacao[];
}

export function RelacionadasList({ publicacoes }: RelacionadasListProps) {
  return (
    <SidebarBox titulo="Relacionados">
      {publicacoes.length === 0 ? (
        <Vazio>Nenhuma publicação relacionada por enquanto.</Vazio>
      ) : (
        <List>
          {publicacoes.map((item) => (
            <li key={item.id}>
              <Link href={ROUTES.publicacao(item.slug)}>{item.titulo}</Link>
            </li>
          ))}
        </List>
      )}
    </SidebarBox>
  );
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;

  a {
    font-size: 14px;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.text};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
