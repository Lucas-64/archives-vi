"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { CasoDeCard } from "../../types/Case";
import { CaseCard } from "../cards/CaseCard";
import { EmptyState } from "../states/EmptyState";

export interface InvestigacoesRecentesProps {
  casos: CasoDeCard[];
}

export function InvestigacoesRecentes({ casos }: InvestigacoesRecentesProps) {
  return (
    <section aria-labelledby="recentes-titulo">
      <Header>
        <Titulo id="recentes-titulo">Investigações recentes</Titulo>
        <Link href={ROUTES.investigacoes}>Ver todos</Link>
      </Header>

      {casos.length === 0 ? (
        <EmptyState
          titulo="Nenhuma investigação por enquanto"
          descricao="Assim que novas investigações forem abertas, elas aparecem aqui."
        />
      ) : (
        <Grid>
          {casos.map((caso) => (
            <CaseCard key={caso.id} caso={caso} />
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
