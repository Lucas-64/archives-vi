"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { categoriaDoStatus } from "../../lib/investigacao";
import { formatarData } from "../../lib/formatacao";
import type { Case } from "../../types/Case";
import { StatusBadge } from "../ui/StatusBadge";

export interface CaseCardProps {
  caso: Case;
}

// Investigation card. The status text is the visible category; color follows the internal status.
export function CaseCard({ caso }: CaseCardProps) {
  const categoria = categoriaDoStatus(caso.status);

  return (
    <Article>
      <Media>
        <Image
          src={caso.image}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </Media>

      <Body>
        <StatusBadge
          status={caso.status}
          label={categoria ?? undefined}
          size="small"
          uppercase
        />
        <Titulo>
          <Link href={ROUTES.publicacao(caso.id)}>{caso.title}</Link>
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

const Article = styled.article`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
  }
`;

const Media = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
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
