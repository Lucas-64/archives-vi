"use client";

import styled from "styled-components";

import { Skeleton } from "../states/Skeleton";

// Loading de Meu Perfil, no mesmo layout da página: identidade e patente, linha de abas e duas colunas.
// Os skeletons são aria-hidden, como nos demais loadings.
export function MeuPerfilSkeleton() {
  return (
    <Blocos>
      <Topo>
        <Skeleton height="260px" radius="lg" />
        <Skeleton height="260px" radius="lg" />
      </Topo>
      <Skeleton height="44px" />
      <Colunas>
        <Skeleton height="420px" radius="lg" />
        <Skeleton height="420px" radius="lg" />
      </Colunas>
    </Blocos>
  );
}

const Blocos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Topo = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 380px;
  }
`;

const Colunas = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
`;
