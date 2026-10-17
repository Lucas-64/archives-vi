"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

import type { TagTematica as IdTagTematica } from "../../constants/tagsTematicas";
import { rotuloDaTag } from "../../lib/tags";

export interface TagTematicaProps {
  tag: IdTagTematica;
  // Sem href, a tag é um rótulo estático. Com href, é um filtro, e `ativa` marca a seleção.
  href?: string;
  ativa?: boolean;
}

// Tag temática do catálogo (ADR-018). O texto vem do catálogo, pelo id canônico.
// Estados: estático; link de filtro; link com foco visível; link ativo (aria-current).
// O design system não define estados de tag. Eles reutilizam os tokens de Badge e de FilterTabs.
export function TagTematica({ tag, href, ativa = false }: TagTematicaProps) {
  const rotulo = rotuloDaTag(tag);

  if (!href) {
    return <Pilula>{rotulo}</Pilula>;
  }

  return (
    <PilulaLink href={href} aria-current={ativa ? "true" : undefined} $ativa={ativa}>
      {rotulo}
    </PilulaLink>
  );
}

const pilulaBase = css`
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.card};
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
`;

const Pilula = styled.span`
  ${pilulaBase}
  min-height: 28px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Link de filtro. A área de toque tem 44px de altura, como os demais links de navegação.
export const PilulaLink = styled(Link)<{ $ativa: boolean }>`
  ${pilulaBase}
  min-height: 44px;
  text-decoration: none;
  cursor: pointer;
  color: ${({ $ativa, theme }) => ($ativa ? theme.colors.text : theme.colors.textSecondary)};
  border-color: ${({ $ativa, theme }) => ($ativa ? theme.colors.pink : theme.colors.border)};
  background: ${({ $ativa, theme }) => ($ativa ? theme.colors.backgroundSecondary : theme.colors.card)};
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
