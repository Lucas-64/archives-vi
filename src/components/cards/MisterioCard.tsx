"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";

import { ImagemCapa } from "../investigacao-classica/ImagemCapa";

export interface MisterioCardProps {
  titulo: string;
  descricao: string;
  // Imagem enviada. Vazia: imagem padrão.
  imagem?: string | null;
  selo?: ReactNode;
  meta?: readonly string[];
  // Sem `href` o card é uma prévia: o título não vira link (rascunho não tem rota).
  href?: string;
  orientacao?: "vertical" | "horizontal";
}

// Card de listagem de mistério. Também serve de prévia nos formulários de criação (sem `href`).
export function MisterioCard({ titulo, descricao, imagem, selo, meta = [], href, orientacao = "horizontal" }: MisterioCardProps) {
  return (
    <Article $horizontal={orientacao === "horizontal"}>
      <Media $horizontal={orientacao === "horizontal"}>
        <ImagemCapa src={imagem} sizes="(max-width: 767px) 100vw, 320px" />
      </Media>
      <Body>
        {selo}
        <Titulo>{href ? <Link href={href}>{titulo}</Link> : titulo}</Titulo>
        <Descricao>{descricao}</Descricao>
        {meta.length > 0 ? (
          <Meta>
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </Meta>
        ) : null}
      </Body>
    </Article>
  );
}

const Article = styled.article<{ $horizontal: boolean }>`
  display: flex;
  flex-direction: ${({ $horizontal }) => ($horizontal ? "row" : "column")};
  min-width: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};

  @media (max-width: 1023px) {
    flex-direction: column;
  }
`;

const Media = styled.div<{ $horizontal: boolean }>`
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  ${({ $horizontal }) => $horizontal && "width: 280px; flex: 0 0 280px; aspect-ratio: auto;"}

  @media (max-width: 1023px) {
    width: auto;
    flex: none;
    aspect-ratio: 16 / 9;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  min-width: 0;
`;

const Titulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  a {
    color: ${({ theme }) => theme.colors.text};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const Descricao = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
