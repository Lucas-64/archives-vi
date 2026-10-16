"use client";

// Client Component: EXPLORAR_ITENS carries icon components (functions), which cannot
// cross the Server -> Client boundary as props. Tiles are rendered here directly.
// The trending data is read through lib/data with use(), since a Client Component cannot await.
import { use } from "react";
import styled from "styled-components";

import { ExploreTile } from "../../../components/home/ExploreCards";
import { TrendingCases } from "../../../components/home/TrendingCases";
import { PageHeader } from "../../../components/page/PageHeader";
import { EXPLORAR_ITENS } from "../../../constants/explorar";
import { getInvestigacoesEmAlta } from "../../../lib/data";

// Created once per module. Resolves immediately with the mock data.
const investigacoesEmAlta = getInvestigacoesEmAlta(3);

export default function ExplorarPage() {
  const casosEmAlta = use(investigacoesEmAlta);

  return (
    <>
      <PageHeader
        titulo="Explorar"
        descricao="Escolha por onde começar: mistérios, teorias, mapa ou galeria da comunidade."
      />

      <TituloOculto>Seções para explorar</TituloOculto>
      <Grid>
        {EXPLORAR_ITENS.map((item) => (
          <ExploreTile key={item.titulo} item={item} />
        ))}
      </Grid>

      <Secao>
        <TrendingCases casos={casosEmAlta} />
      </Secao>
    </>
  );
}

const TituloOculto = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Secao = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  min-width: 0;
`;
