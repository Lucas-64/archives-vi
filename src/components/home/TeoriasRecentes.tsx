"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import { PublicationCard } from "../cards/PublicationCard";
import { EmptyState } from "../states/EmptyState";

export interface TeoriasRecentesProps {
  itens: { publicacao: Publicacao; autor: Criador }[];
}

// Teorias publicadas mais recentes (dados reais). Mesmo formato de "Investigações recentes".
export function TeoriasRecentes({ itens }: TeoriasRecentesProps) {
  return (
    <section aria-labelledby="teorias-recentes-titulo">
      <Header>
        <Titulo id="teorias-recentes-titulo">Teorias recentes</Titulo>
        <Link href={ROUTES.teorias}>Ver todas</Link>
      </Header>

      {itens.length === 0 ? (
        <EmptyState
          titulo="Nenhuma teoria por enquanto"
          descricao="Assim que novas teorias forem publicadas, elas aparecem aqui."
        />
      ) : (
        <Grid>
          {itens.map(({ publicacao, autor }) => (
            <PublicationCard key={publicacao.id} publicacao={publicacao} autor={autor} nivelTitulo={3} />
          ))}
        </Grid>
      )}
    </section>
  );
}

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  a {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
