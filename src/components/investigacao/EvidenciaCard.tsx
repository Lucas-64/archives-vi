"use client";

import styled from "styled-components";

import { formatarData } from "../../lib/formatacao";
import { ROTULO_ORIGEM } from "../../lib/investigacaoEstado";
import type { Evidencia, OrigemEvidencia } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

export interface EvidenciaCardProps {
  evidencia: Evidencia;
  // True only when the author of the evidence is the investigation's creator.
  // Acceptance of a community suggestion never sets this.
  ehDoCriador: boolean;
}

// Evidência aceita, como a API a entrega: sem imagens, avaliações nem discussão (não existem na API).
// Nenhuma pontuação, porcentagem ou ranking.
export function EvidenciaCard({ evidencia, ehDoCriador }: EvidenciaCardProps) {
  const { id, origem, titulo, descricao, autor, data, fonte } = evidencia;
  const tituloId = `evidencia-${id}-titulo`;

  return (
    <Card id={`evidencia-${id}`} aria-labelledby={tituloId}>
      <Corpo>
        <Topo>
          <Identificadores>
            <Identificador>EVIDÊNCIA</Identificador>
            {ehDoCriador ? (
              <Badge size="small" variant="secondary">
                Evidência do criador
              </Badge>
            ) : null}
          </Identificadores>
          <Badge size="small" variant={variantOrigem(origem)}>
            {ROTULO_ORIGEM[origem]}
          </Badge>
        </Topo>

        <Titulo id={tituloId}>{titulo}</Titulo>
        <Descricao>{descricao}</Descricao>

        <Meta>
          <Avatar nome={autor.nome} size="small" />
          <span>
            {autor.nome} <Usuario>@{autor.usuario}</Usuario>
          </span>
          <time dateTime={data}>{formatarData(data)}</time>
        </Meta>

        {evidencia.origemComunidade ? (
          <Procedencia>
            <span>
              Evidência enviada por <Usuario>@{evidencia.origemComunidade.enviadaPor.usuario}</Usuario>
            </span>
            <span>
              Aceita por <Usuario>@{evidencia.origemComunidade.aceitaPor.usuario}</Usuario>
            </span>
          </Procedencia>
        ) : null}

        <Fonte>
          {fonte ? `Fonte: ${fonte}` : "Fonte pendente de verificação."}
        </Fonte>

        {evidencia.relacionadaA ? (
          <Acoes>
            <a href={`#evidencia-${evidencia.relacionadaA}`}>Relacionada a outra evidência desta investigação</a>
          </Acoes>
        ) : null}
      </Corpo>
    </Card>
  );
}

function variantOrigem(origem: OrigemEvidencia) {
  return origem === "origem_nao_verificada" ? "warning" : "default";
}

const Card = styled.article`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  scroll-margin-top: 96px;
`;

const Corpo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
`;

const Topo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Identificadores = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const Identificador = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Titulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
`;

const Descricao = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Procedencia = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Usuario = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Fonte = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 13px;
  font-weight: 600;

  a {
    color: ${({ theme }) => theme.colors.pink};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
