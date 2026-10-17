"use client";

import styled from "styled-components";

import { CaseCard } from "../cards/CaseCard";
import { CardList } from "../page/CardList";
import { EmptyState } from "../states/EmptyState";
import type { Case } from "../../types/Case";

export interface InvestigacoesPerfilProps {
  // Investigações com detalhe publicado em que o membro é o autor, e as em que ele participa.
  // Ambas vêm de investigacoesDoMembro (src/lib/perfil.ts) e são Cases reais dos mocks.
  criadas: Case[];
  participacoes: Case[];
}

// Aba "Investigações" do perfil. Separa o que o membro criou do que ele apenas participa.
// Os cards são os da listagem (CaseCard, na horizontal). Os estados vazios dizem o motivo real:
// só investigações com detalhe publicado têm autoria, então é esse o recorte exibido.
export function InvestigacoesPerfil({ criadas, participacoes }: InvestigacoesPerfilProps) {
  return (
    <Area>
      <Secao aria-labelledby="perfil-investigacoes-criadas">
        <Titulo id="perfil-investigacoes-criadas">Criadas por este membro</Titulo>
        {criadas.length === 0 ? (
          <EmptyState
            titulo="Nenhuma investigação criada aqui"
            descricao="Este membro não é autor de nenhuma investigação com detalhe publicado."
          />
        ) : (
          <CardList>
            {criadas.map((caso) => (
              <CaseCard key={caso.id} caso={caso} orientacao="horizontal" />
            ))}
          </CardList>
        )}
      </Secao>

      <Secao aria-labelledby="perfil-investigacoes-participacoes">
        <Titulo id="perfil-investigacoes-participacoes">Em que participa</Titulo>
        {participacoes.length === 0 ? (
          <EmptyState
            titulo="Nenhuma participação aqui"
            descricao="Este membro não aparece como participante de nenhuma investigação com detalhe publicado."
          />
        ) : (
          <CardList>
            {participacoes.map((caso) => (
              <CaseCard key={caso.id} caso={caso} orientacao="horizontal" />
            ))}
          </CardList>
        )}
      </Secao>
    </Area>
  );
}

const Area = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
`;
