"use client";

import styled from "styled-components";

import { Skeleton } from "../states/Skeleton";

// Alturas medidas na página real, em produção (ver docs/features/perfil-social.md, etapa 8).
// Desktop: largura de 950 px. Celular: 343 px. As alturas dependem dos dados, então são aproximadas.
const ALTURAS = {
  identidade: { desktop: "231px", mobile: "350px" },
  indicadores: { desktop: "109px", mobile: "140px" },
  destaque: { desktop: "381px", mobile: "631px" },
  contribuicoes: { desktop: "546px", mobile: "697px" },
  publicacoes: { desktop: "396px", mobile: "534px" },
} as const;

// Skeleton do perfil: a mesma hierarquia da página, sem sidebar. Os blocos seguem o ContentGrid
// (coluna principal com largura total). Os skeletons são aria-hidden, como os demais loadings.
export function PerfilSkeleton() {
  return (
    <>
      <Skeleton height="15px" width="260px" radius="sm" />
      <Altura $desktop={ALTURAS.identidade.desktop} $mobile={ALTURAS.identidade.mobile}>
        <Skeleton height="100%" radius="lg" />
      </Altura>
      <Altura $desktop={ALTURAS.indicadores.desktop} $mobile={ALTURAS.indicadores.mobile}>
        <Skeleton height="100%" radius="lg" />
      </Altura>
      <Abas>
        <Skeleton height="45px" radius="sm" />
        <Coluna>
          <Altura $desktop={ALTURAS.destaque.desktop} $mobile={ALTURAS.destaque.mobile}>
            <Skeleton height="100%" radius="lg" />
          </Altura>
          <Altura $desktop={ALTURAS.contribuicoes.desktop} $mobile={ALTURAS.contribuicoes.mobile}>
            <Skeleton height="100%" radius="lg" />
          </Altura>
          <Altura $desktop={ALTURAS.publicacoes.desktop} $mobile={ALTURAS.publicacoes.mobile}>
            <Skeleton height="100%" radius="lg" />
          </Altura>
        </Coluna>
      </Abas>
    </>
  );
}

// Espelha o AbasPerfil: faixa de abas e painel com 24px entre os blocos.
const Abas = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

// A altura do bloco é controlada aqui; o Skeleton interno ocupa 100% dela.
const Altura = styled.div<{ $desktop: string; $mobile: string }>`
  height: ${({ $desktop }) => $desktop};
  min-width: 0;

  @media (max-width: 767px) {
    height: ${({ $mobile }) => $mobile};
  }
`;
