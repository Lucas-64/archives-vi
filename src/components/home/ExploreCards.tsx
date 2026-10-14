"use client";

import Link from "next/link";
import styled from "styled-components";

import { EXPLORAR_ITENS, type ExplorarItem } from "../../constants/explorar";

export function ExploreCards() {
  return (
    <section aria-labelledby="explorar-titulo">
      <Titulo id="explorar-titulo">Explorar</Titulo>
      <Grid>
        {EXPLORAR_ITENS.map((item) => (
          <ExploreTile key={item.titulo} item={item} />
        ))}
      </Grid>
    </section>
  );
}

function ExploreTile({ item }: { item: ExplorarItem }) {
  const Icon = item.icon;

  return (
    <Tile>
      <Icon aria-hidden="true" size={24} />
      <TileTitulo>{item.titulo}</TileTitulo>
      <TileDescricao>{item.descricao}</TileDescricao>
      {item.href ? (
        <TileLink href={item.href}>Explorar</TileLink>
      ) : (
        <TileDisabled aria-disabled="true">Explorar</TileDisabled>
      )}
    </Tile>
  );
}

const Titulo = styled.h2`
  margin-bottom: 16px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.pink};
`;

const TileTitulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;

const TileDescricao = styled.p`
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TileLink = styled(Link)`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const TileDisabled = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
`;
