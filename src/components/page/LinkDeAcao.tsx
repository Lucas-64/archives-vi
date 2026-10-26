"use client";

import Link from "next/link";
import styled from "styled-components";

// Link de ação no cabeçalho de uma página (por exemplo, "Criar mistério"). Mesmo gradiente do cabeçalho do site.
export const LinkDeAcao = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gradientStart}, ${({ theme }) => theme.colors.gradientEnd});

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
