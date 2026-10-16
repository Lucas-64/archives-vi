"use client";

import styled from "styled-components";

import { Skeleton } from "../../../components/states/Skeleton";

// Loading state for /explorar. Mirrors the header, the four tiles and the trending band.
export default function ExplorarLoading() {
  return (
    <>
      <Skeleton height="96px" radius="lg" />
      <Grid>
        <Skeleton height="320px" radius="lg" />
        <Skeleton height="320px" radius="lg" />
        <Skeleton height="320px" radius="lg" />
        <Skeleton height="320px" radius="lg" />
      </Grid>
      <Faixa>
        <Skeleton height="260px" radius="lg" />
      </Faixa>
    </>
  );
}

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

const Faixa = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl};
  min-width: 0;
`;
