"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

export interface SecaoProps {
  id: string;
  titulo: string;
  children: ReactNode;
}

// Section with a stable id (used by AnchorNav) and a visible heading.
export function Secao({ id, titulo, children }: SecaoProps) {
  return (
    <Wrapper id={id} aria-labelledby={`${id}-titulo`}>
      <Titulo id={`${id}-titulo`}>{titulo}</Titulo>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  scroll-margin-top: 96px;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

// Sub-heading inside a section (level 3), so the heading order stays h1 > h2 > h3.
export function Subtitulo({ children }: { children: ReactNode }) {
  return <SubTitle>{children}</SubTitle>;
}

const SubTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
`;
