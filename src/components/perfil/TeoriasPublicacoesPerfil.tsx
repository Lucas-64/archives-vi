"use client";

import { useId, useState, useSyncExternalStore } from "react";
import styled from "styled-components";

import { TAGS_TEMATICAS } from "../../constants/tagsTematicas";
import { filtrarPorTag, lerTagTematica, rotuloDaTag } from "../../lib/tags";
import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import { FiltroTemas } from "../tags/FiltroTemas";
import { EmptyState } from "../states/EmptyState";
import { PublicacoesSecao } from "./PublicacoesSecao";
import {
  assinarLocalizacao,
  definirParametroDaUrl,
  lerBuscaNoNavegador,
  lerBuscaNoServidor,
} from "./localizacao";

export interface TeoriasPublicacoesPerfilProps {
  publicacoes: Publicacao[];
  autor: Criador;
}

// Aba "Teorias e publicações" do perfil. O filtro por tema fica recolhido por padrão, para não
// ocupar espaço o tempo todo. O tema vem da URL (?tag=), então um filtro ativo continua aplicado
// mesmo com o painel fechado. O painel reutiliza FiltroTemas (catálogo único, ADR-018).
export function TeoriasPublicacoesPerfil({ publicacoes, autor }: TeoriasPublicacoesPerfilProps) {
  const busca = useSyncExternalStore(assinarLocalizacao, lerBuscaNoNavegador, lerBuscaNoServidor);
  const tag = lerTagTematica(new URLSearchParams(busca).get("tag"));

  const [aberto, setAberto] = useState(false);
  const idPainel = useId();

  const exibidas = filtrarPorTag(publicacoes, tag);
  const semResultado = tag !== undefined && exibidas.length === 0;

  return (
    <Area>
      <Barra>
        <BotaoFiltro
          type="button"
          aria-expanded={aberto}
          aria-controls={idPainel}
          onClick={() => setAberto((valor) => !valor)}
        >
          {aberto ? "Ocultar filtros" : "Filtrar temas"}
        </BotaoFiltro>
        {tag !== undefined && !aberto ? <Ativo>Tema: {rotuloDaTag(tag)}</Ativo> : null}
      </Barra>

      <Painel id={idPainel} hidden={!aberto}>
        <FiltroTemas
          label="Filtrar publicações por tema"
          opcoes={[
            { ativa: tag === undefined },
            ...TAGS_TEMATICAS.map((item) => ({ tag: item.id, ativa: tag === item.id })),
          ]}
          onSelecionar={(id) => definirParametroDaUrl("tag", id)}
        />
      </Painel>

      {semResultado ? (
        <EmptyState
          titulo="Nenhuma publicação com este tema"
          descricao="Este membro não tem publicações com o tema selecionado."
          acao={
            <AcaoLimpar type="button" onClick={() => definirParametroDaUrl("tag")}>
              Ver todas as publicações
            </AcaoLimpar>
          }
        />
      ) : (
        <PublicacoesSecao publicacoes={exibidas} autor={autor} />
      )}
    </Area>
  );
}

const Area = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const Barra = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
`;

// Botão de expandir e recolher. Área de toque de 44px, como os demais controles do perfil.
const BotaoFiltro = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.card};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;

// Indica discretamente que há um tema selecionado com o painel recolhido. Sem contagem.
const Ativo = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 8px;
    border-radius: ${({ theme }) => theme.borderRadius.pill};
    background: ${({ theme }) => theme.colors.pink};
    vertical-align: middle;
  }
`;

// `hidden` precisa vencer o display do painel. Por isso o seletor explícito.
const Painel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  &[hidden] {
    display: none;
  }
`;

const AcaoLimpar = styled.button`
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};
  cursor: pointer;
  text-decoration: underline;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
