"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

// Vertical rhythm for the content below a page header and its filters.
export function PageBody({ children }: { children: ReactNode }) {
  return <Body>{children}</Body>;
}

const Body = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
