"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface SidebarBoxProps {
  titulo: string;
  children: ReactNode;
}

// Titled panel used in sidebars, with the same look as ForumTopicList and UpdateList.
export function SidebarBox({ titulo, children }: SidebarBoxProps) {
  return (
    <Section>
      <Titulo>{titulo}</Titulo>
      {children}
    </Section>
  );
}

const Section = styled.section`
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Titulo = styled.h2`
  margin-bottom: 12px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
`;
