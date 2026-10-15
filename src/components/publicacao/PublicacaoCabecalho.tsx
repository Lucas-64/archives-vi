"use client";

import styled from "styled-components";

import { formatarData, formatarNumero } from "../../lib/formatacao";
import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import { Badge } from "../ui/Badge";

export interface PublicacaoCabecalhoProps {
  publicacao: Publicacao;
  autor: Criador | undefined;
}

const ROTULO_TIPO = {
  teoria: { texto: "Teoria", variant: "primary" },
  investigacao: { texto: "Investigação", variant: "info" },
} as const;

export function PublicacaoCabecalho({ publicacao, autor }: PublicacaoCabecalhoProps) {
  const tipo = ROTULO_TIPO[publicacao.tipo];

  return (
    <Wrapper>
      <Badge variant={tipo.variant} size="small" uppercase>
        {tipo.texto}
      </Badge>
      <Titulo>{publicacao.titulo}</Titulo>
      <Meta>
        <span>{autor ? `@${autor.usuario}` : "Autor desconhecido"}</span>
        <time dateTime={publicacao.data}>{formatarData(publicacao.data)}</time>
        <span>{formatarNumero(publicacao.comentarios)} comentários</span>
      </Meta>
      <Resumo>{publicacao.resumo}</Resumo>
      {publicacao.tags.length > 0 ? (
        <Tags aria-label="Tags">
          {publicacao.tags.map((tag) => (
            <li key={tag}>
              <Badge size="small">#{tag}</Badge>
            </li>
          ))}
        </Tags>
      ) : null}
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;

  @media (max-width: 767px) {
    font-size: 34px;
  }
`;

const Resumo = styled.p`
  font-size: 17px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
