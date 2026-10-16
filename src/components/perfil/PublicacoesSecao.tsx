"use client";

import styled from "styled-components";

import type { Criador } from "../../types/Criador";
import type { Publicacao } from "../../types/Publicacao";
import { PublicationCard } from "../cards/PublicationCard";
import { CardList } from "../page/CardList";
import { EmptyState } from "../states/EmptyState";

export interface PublicacoesSecaoProps {
  publicacoes: Publicacao[];
  autor: Criador;
}

// Seção "Publicações" do perfil: lista vertical de publicações do criador, ou estado vazio.
// Investigações não entram aqui, porque Case não tem autor.
export function PublicacoesSecao({ publicacoes, autor }: PublicacoesSecaoProps) {
  return (
    <Secao aria-labelledby="perfil-publicacoes">
      <Titulo id="perfil-publicacoes">Publicações</Titulo>

      {publicacoes.length === 0 ? (
        <EmptyState
          titulo="Este criador ainda não tem publicações"
          descricao="Quando houver publicações deste criador, elas aparecem aqui."
        />
      ) : (
        <CardList>
          {publicacoes.map((publicacao) => (
            <PublicationCard key={publicacao.id} publicacao={publicacao} autor={autor} nivelTitulo={3} />
          ))}
        </CardList>
      )}
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
