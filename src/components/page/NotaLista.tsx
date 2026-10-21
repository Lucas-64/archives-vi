"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

// Aviso discreto sob uma lista (por exemplo, "mostrando as primeiras N").
export function NotaLista({ children }: { children: ReactNode }) {
  return <Nota>{children}</Nota>;
}

const Nota = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
