"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { rotuloDaTag } from "../../lib/tags";
import type { CasoDeCard } from "../../types/Case";
import type { Publicacao } from "../../types/Publicacao";
import { StatusBadge } from "../ui/StatusBadge";
import { IrParaAba } from "./IrParaAba";

export interface MeuPerfilVisaoGeralProps {
  // Listas reais da pessoa da sessão (API, via serviço no processo). Nada vem de mocks.
  publicacoes: Publicacao[];
  investigacoes: CasoDeCard[];
}

const LIMITE_RESUMO = 3;

const INDISPONIVEL = "Informação ainda não disponível.";

// Visão geral de Meu Perfil (ADR-021, revisto pelo ADR-037). Coluna principal: "Aguardando sua ação" e
// "Atividade recente", sem fonte de dados real, então mostram estado vazio rotulado. Coluna lateral: teorias e
// investigações reais da pessoa, com mensagem de vazio em vez de o cartão sumir.
export function MeuPerfilVisaoGeral({ publicacoes, investigacoes }: MeuPerfilVisaoGeralProps) {
  return (
    <Grade>
      <Coluna>
        <Cartao aria-labelledby="meu-perfil-aguardando">
          <Cabecalho>
            <Titulo id="meu-perfil-aguardando">Aguardando sua ação</Titulo>
          </Cabecalho>
          <Vazio role="status">{INDISPONIVEL} Quando houver pendências, elas aparecem aqui.</Vazio>
        </Cartao>

        <Cartao aria-labelledby="meu-perfil-atividade">
          <Cabecalho>
            <Titulo id="meu-perfil-atividade">Atividade recente</Titulo>
          </Cabecalho>
          <Vazio role="status">{INDISPONIVEL} A atividade da sua conta aparece aqui quando houver registro.</Vazio>
        </Cartao>
      </Coluna>

      <Coluna>
        <Cartao aria-labelledby="meu-perfil-teorias">
          <Cabecalho>
            <Titulo id="meu-perfil-teorias">Minhas teorias</Titulo>
          </Cabecalho>
          {publicacoes.length === 0 ? (
            <Vazio>Você ainda não publicou teorias.</Vazio>
          ) : (
            <Resumo>
              {publicacoes.slice(0, LIMITE_RESUMO).map((item) => (
                <li key={item.id}>
                  <ResumoTitulo href={ROUTES.publicacao(item.slug)}>{item.titulo}</ResumoTitulo>
                  <Meta>
                    {item.tags.length > 0 ? rotuloDaTag(item.tags[0]) : item.tipo === "teoria" ? "Teoria" : "Investigação"}
                  </Meta>
                </li>
              ))}
            </Resumo>
          )}
          <Rodape>
            <IrParaAba aba="teorias-publicacoes">Ver todas as teorias</IrParaAba>
          </Rodape>
        </Cartao>

        <Cartao aria-labelledby="meu-perfil-investigacoes">
          <Cabecalho>
            <Titulo id="meu-perfil-investigacoes">Meus mistérios</Titulo>
          </Cabecalho>
          {investigacoes.length === 0 ? (
            <Vazio>Você ainda não abriu mistérios.</Vazio>
          ) : (
            <Resumo>
              {investigacoes.slice(0, LIMITE_RESUMO).map((caso) => (
                <li key={caso.id}>
                  <LinhaItem>
                    <ResumoTitulo href={ROUTES.comunidadeInvestigacao(caso.id)}>{caso.title}</ResumoTitulo>
                    <StatusBadge status={caso.status} />
                  </LinhaItem>
                </li>
              ))}
            </Resumo>
          )}
          <Rodape>
            <IrParaAba aba="investigacoes">Ver todos os mistérios</IrParaAba>
          </Rodape>
        </Cartao>
      </Coluna>
    </Grade>
  );
}

const Grade = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }
`;

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const Cartao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.card};

  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 17px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const LinhaItem = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-width: 0;
`;

const Meta = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Resumo = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  li:first-child {
    border-top: 0;
    padding-top: 0;
  }
`;

const ResumoTitulo = styled(Link)`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Rodape = styled.div`
  padding-top: 4px;
  font-size: 13px;
`;

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
