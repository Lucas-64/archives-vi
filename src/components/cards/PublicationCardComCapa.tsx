"use client";

// Variante dedicada do PublicationCard para a listagem de Teorias e investigações (ADR-042): mesmo conteúdo, com a
// capa no mesmo formato do CaseCardClassico (280px ao lado no desktop, 16:9 no alto no celular). Publicações não
// têm imagem própria só quando a pessoa enviou uma; sem ela, vale a imagem padrão. O PublicationCard (Início, Explorar, perfil) não muda.
import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarData, formatarNumero } from "../../lib/formatacao";
import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import { ImagemCapa } from "../investigacao-classica/ImagemCapa";
import { Badge } from "../ui/Badge";

export interface PublicationCardComCapaProps {
  publicacao: Publicacao;
  autor: Criador | undefined;
  nivelTitulo?: 2 | 3;
}

const ROTULO_TIPO = {
  teoria: { texto: "Teoria", variant: "primary" },
  investigacao: { texto: "Investigação", variant: "info" },
} as const;

export function PublicationCardComCapa({ publicacao, autor, nivelTitulo = 2 }: PublicationCardComCapaProps) {
  const tipo = ROTULO_TIPO[publicacao.tipo];

  return (
    <Article>
      <Media>
        <ImagemCapa src={publicacao.imagemUrl} sizes="(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 33vw" />
      </Media>

      <Body>
        <Badge variant={tipo.variant} size="small" uppercase>
          {tipo.texto}
        </Badge>

        <Titulo as={nivelTitulo === 3 ? "h3" : "h2"}>
          <Link href={ROUTES.publicacao(publicacao.slug)}>{publicacao.titulo}</Link>
        </Titulo>

        <Resumo>{publicacao.resumo}</Resumo>

        <Meta>
          <span>{autor ? `@${autor.usuario}` : "Autor desconhecido"}</span>
          <time dateTime={publicacao.data}>{formatarData(publicacao.data)}</time>
          <span>{formatarNumero(publicacao.comentarios)} {publicacao.comentarios === 1 ? "comentário" : "comentários"}</span>
        </Meta>
      </Body>
    </Article>
  );
}

const Article = styled.article`
  display: flex;
  flex-direction: row;
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

const Media = styled.div`
  position: relative;
  width: 280px;
  flex: 0 0 280px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  @media (max-width: 1023px) {
    width: auto;
    flex: none;
    aspect-ratio: 16 / 9;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  padding: 20px;
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
