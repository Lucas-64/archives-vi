"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface ContentGridProps {
  main: ReactNode;
  sidebar?: ReactNode;
}

// Desktop: main column + 320px sidebar. Mobile: single column, sidebar after main.
export function ContentGrid({ main, sidebar }: ContentGridProps) {
  return (
    <Grid>
      <Main>{main}</Main>
      {sidebar ? <Aside>{sidebar}</Aside> : null}
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  padding: 24px 0 0;

  @media (max-width: 1023px) {
    grid-template-columns: minmax(0, 1fr) 280px;
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
    padding-top: 16px;
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-width: 0;
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;
