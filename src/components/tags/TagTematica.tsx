"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

import type { TagTematica as IdTagTematica } from "../../constants/tagsTematicas";
import { rotuloDaTag } from "../../lib/tags";

export interface TagTematicaProps {
  tag: IdTagTematica;
  // Sem href nem onSelecionar, a tag é um rótulo estático. Com href, é um link de filtro. Com
  // onSelecionar, é um botão de filtro (usado quando o filtro troca a URL no cliente, sem recarregar).
  // `ativa` marca a seleção.
  href?: string;
  onSelecionar?: (tag: IdTagTematica) => void;
  ativa?: boolean;
}

// Tag temática do catálogo (ADR-018). O texto vem do catálogo, pelo id canônico.
// Estados: estático; link ou botão de filtro; foco visível; ativo (aria-current ou aria-pressed).
// O design system não define estados de tag. Eles reutilizam os tokens de Badge e de FilterTabs.
export function TagTematica({ tag, href, onSelecionar, ativa = false }: TagTematicaProps) {
  const rotulo = rotuloDaTag(tag);

  if (onSelecionar) {
    return (
      <PilulaBotao type="button" aria-pressed={ativa} $ativa={ativa} onClick={() => onSelecionar(tag)}>
        {rotulo}
      </PilulaBotao>
    );
  }

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

// Estilo interativo compartilhado por link e botão de filtro. A área de toque tem 44px de altura.
const pilulaInterativa = css<{ $ativa: boolean }>`
  ${pilulaBase}
  min-height: 44px;
  text-decoration: none;
  cursor: pointer;
  font-family: inherit;
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

// Link de filtro.
export const PilulaLink = styled(Link)<{ $ativa: boolean }>`
  ${pilulaInterativa}
`;

// Botão de filtro (troca a URL no cliente).
export const PilulaBotao = styled.button<{ $ativa: boolean }>`
  ${pilulaInterativa}
`;
