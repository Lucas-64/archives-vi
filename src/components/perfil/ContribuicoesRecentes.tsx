"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarData } from "../../lib/formatacao";
import type { ContribuicaoRecente } from "../../lib/perfil";
import type { Case } from "../../types/Case";
import { Badge, type BadgeVariant } from "../ui/Badge";
import { EmptyState } from "../states/EmptyState";

export interface ContribuicoesRecentesProps {
  // Já filtradas, ordenadas e limitadas por contribuicoesRecentes (src/lib/perfil.ts).
  itens: ContribuicaoRecente[];
  // Usados só para o título das investigações. Itens sem caso correspondente não são exibidos.
  investigacoes: Case[];
}

// Rótulos de tipo seguem PublicationCard e a página de publicação.
const ROTULO_PUBLICACAO = {
  teoria: { texto: "Teoria", variant: "primary" },
  investigacao: { texto: "Investigação", variant: "info" },
} as const;

interface ItemExibido {
  chave: string;
  rotulo: string;
  variant: BadgeVariant;
  titulo: string;
  href: string;
  contexto: string | null;
  rotuloData: string;
  data: string;
}

// Apresentação de cada tipo. Os destinos existem: /publicacao/[slug] (página de publicação),
// /publicacoes/investigacao/[slug] (área comunitária) e a âncora #evidencia-{id}, que EvidenciaCard define para cada evidência
// pública e sugestão aceita.
function montarItem(item: ContribuicaoRecente, investigacoes: Case[]): ItemExibido | null {
  if (item.tipo === "publicacao") {
    const tipo = ROTULO_PUBLICACAO[item.subtipo];
    return {
      chave: `publicacao-${item.id}`,
      rotulo: tipo.texto,
      variant: tipo.variant,
      titulo: item.titulo,
      href: ROUTES.publicacao(item.slug),
      contexto: item.resumo,
      rotuloData: "Publicada em",
      data: item.data,
    };
  }

  const caso = investigacoes.find((registro) => registro.id === item.investigacaoId);
  if (!caso) return null;

  if (item.tipo === "evidencia") {
    return {
      chave: `evidencia-${item.investigacaoId}-${item.id}`,
      rotulo: "Evidência",
      variant: "default",
      titulo: item.titulo,
      href: `${ROUTES.comunidadeInvestigacao(item.investigacaoId)}#evidencia-${item.id}`,
      contexto: `Na investigação ${caso.title}`,
      rotuloData: "Enviada em",
      data: item.data,
    };
  }

  // Investigação criada ou de participação. A data é a última atualização da investigação.
  return {
    chave: `investigacao-${item.investigacaoId}-${item.papel}`,
    rotulo: item.papel === "criou" ? "Investigação criada" : "Participação",
    variant: item.papel === "criou" ? "success" : "secondary",
    titulo: caso.title,
    href: ROUTES.investigacao(item.investigacaoId),
    contexto: null,
    rotuloData: "Atualizada em",
    data: item.data,
  };
}

// Contribuições recentes da Visão geral: lista vertical mista, na ordem recebida.
export function ContribuicoesRecentes({ itens, investigacoes }: ContribuicoesRecentesProps) {
  const exibidos = itens
    .map((item) => montarItem(item, investigacoes))
    .filter((item): item is ItemExibido => item !== null);

  return (
    <Secao aria-labelledby="perfil-contribuicoes">
      <Titulo id="perfil-contribuicoes">Contribuições recentes</Titulo>

      {exibidos.length === 0 ? (
        <EmptyState
          titulo="Ainda não há contribuições recentes"
          descricao="Publicações, evidências e participações em investigações aparecem aqui quando existirem."
        />
      ) : (
        <Lista>
          {exibidos.map((item) => (
            <Item key={item.chave}>
              <Badge size="small" variant={item.variant} uppercase>
                {item.rotulo}
              </Badge>
              <Nome>
                <Link href={item.href}>{item.titulo}</Link>
              </Nome>
              {item.contexto ? <Contexto>{item.contexto}</Contexto> : null}
              <Data>
                {item.rotuloData} <time dateTime={item.data}>{formatarData(item.data)}</time>
              </Data>
            </Item>
          ))}
        </Lista>
      )}
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;

  @media (max-width: 767px) {
    font-size: 24px;
  }
`;

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.card};
  overflow: hidden;
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: 0;
  }

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Nome = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 700;
  line-height: 1.15;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  a {
    color: ${({ theme }) => theme.colors.text};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.pink};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const Contexto = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Data = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
