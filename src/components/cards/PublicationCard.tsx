"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarData, formatarNumero } from "../../lib/formatacao";
import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import { Badge } from "../ui/Badge";

export interface PublicationCardProps {
  publicacao: Publicacao;
  autor: Criador | undefined;
}

const ROTULO_TIPO = {
  teoria: { texto: "Teoria", variant: "primary" },
  investigacao: { texto: "Investigação", variant: "info" },
} as const;

export function PublicationCard({ publicacao, autor }: PublicationCardProps) {
  const tipo = ROTULO_TIPO[publicacao.tipo];

  return (
    <Article>
      <Badge variant={tipo.variant} size="small" uppercase>
        {tipo.texto}
      </Badge>

      <Titulo>
        <Link href={ROUTES.publicacao(publicacao.slug)}>{publicacao.titulo}</Link>
      </Titulo>

      <Resumo>{publicacao.resumo}</Resumo>

      <Meta>
        <span>{autor ? `@${autor.usuario}` : "Autor desconhecido"}</span>
        <time dateTime={publicacao.data}>{formatarData(publicacao.data)}</time>
        <span>{formatarNumero(publicacao.comentarios)} comentários</span>
      </Meta>
    </Article>
  );
}

const Article = styled.article`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
  }
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
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

const Resumo = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
