"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

// Vertical list of cards: one card per row, full width of the main column, at every screen size.
export function CardList({ children }: { children: ReactNode }) {
  return <List>{children}</List>;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
