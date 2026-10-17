"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface ContentGridProps {
  main: ReactNode;
  sidebar?: ReactNode;
}

// Desktop: main column + 320px sidebar. Tablet: 280px sidebar. Mobile: single column, sidebar after main.
// Without `sidebar`, the main column takes the full width and no empty column is reserved.
// Every consumer passes a sidebar today, so their layout is unchanged.
export function ContentGrid({ main, sidebar }: ContentGridProps) {
  const comSidebar = Boolean(sidebar);

  return (
    <Grid $comSidebar={comSidebar}>
      <Main>{main}</Main>
      {comSidebar ? <Aside>{sidebar}</Aside> : null}
    </Grid>
  );
}

const Grid = styled.div<{ $comSidebar: boolean }>`
  display: grid;
  grid-template-columns: ${({ $comSidebar }) =>
    $comSidebar ? "minmax(0, 1fr) 320px" : "minmax(0, 1fr)"};
  gap: 24px;
  padding: 24px 0 0;

  @media (max-width: 1023px) {
    grid-template-columns: ${({ $comSidebar }) =>
      $comSidebar ? "minmax(0, 1fr) 280px" : "minmax(0, 1fr)"};
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
