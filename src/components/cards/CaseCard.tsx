"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { classificacaoDoCaso } from "../../lib/investigacao";
import { formatarData } from "../../lib/formatacao";
import type { CasoDeCard } from "../../types/Case";
import { ClassificacaoBadge } from "../ui/ClassificacaoBadge";

export interface CaseCardProps {
  caso: CasoDeCard;
  // "vertical" (default, used in grids). "horizontal" puts the image beside the text
  // and is used in one-card-per-row lists.
  orientacao?: "vertical" | "horizontal";
  // Destino do título. Padrão: a página editorial do mistério. A área comunitária passa o seu próprio.
  href?: string;
}

// Investigation card. O selo mostra a classificação do mistério (fonte única em constants/classificacoesMisterio).
export function CaseCard({ caso, orientacao = "vertical", href }: CaseCardProps) {
  const classificacao = classificacaoDoCaso(caso);

  return (
    <Article $horizontal={orientacao === "horizontal"}>
      <Media $horizontal={orientacao === "horizontal"}>
        {caso.image ? (
          <Image
            src={caso.image}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : null}
      </Media>

      <Body>
        <ClassificacaoBadge classificacao={classificacao} />
        <Titulo>
          <Link href={href ?? ROUTES.investigacao(caso.id)}>{caso.title}</Link>
        </Titulo>
        <Descricao>{caso.description}</Descricao>
        <Meta>
          <span>{caso.location}</span>
          <span>{caso.evidenceCount ?? 0} evidências</span>
          {caso.updatedAt ? <span>Atualizado em {formatarData(caso.updatedAt)}</span> : null}
        </Meta>
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
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
  }

  @media (max-width: 1023px) {
    flex-direction: column;
  }
`;

const Media = styled.div<{ $horizontal: boolean }>`
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  ${({ $horizontal }) =>
    $horizontal &&
    `
    width: 280px;
    flex: 0 0 280px;
    aspect-ratio: auto;
  `}

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
`;

const Titulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;

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
