"use client";

import styled from "styled-components";

import { ComposerBloqueado } from "../comentarios/ComposerBloqueado";
import type { Comentario } from "../../types/InvestigacaoDetalhe";
import { ThreadItem } from "./ThreadItem";

export interface DiscussaoSectionProps {
  evidenciaId: string;
  evidenciaTitulo: string;
  discussaoContextual: Comentario[];
  discussaoGeral: Comentario[];
}

// Two discussions: one attached to a specific evidence, and a general one for the investigation.
export function DiscussaoSection({
  evidenciaId,
  evidenciaTitulo,
  discussaoContextual,
  discussaoGeral,
}: DiscussaoSectionProps) {
  return (
    <Wrapper>
      <Bloco aria-labelledby="discussao-evidencia-titulo">
        <SubTitulo id="discussao-evidencia-titulo">
          Discussão da evidência #{evidenciaId}
        </SubTitulo>
        <Contexto>
          {evidenciaTitulo} ·{" "}
          <a href={`#evidencia-${evidenciaId}`}>Ver evidência</a>
        </Contexto>
        <Lista aria-label={`Comentários da evidência #${evidenciaId}`}>
          {discussaoContextual.map((comentario) => (
            <li key={comentario.id}>
              <ThreadItem comentario={comentario} />
            </li>
          ))}
        </Lista>
        <ComposerBloqueado rotulo={`Responder à evidência #${evidenciaId}`} />
      </Bloco>

      <Bloco aria-labelledby="discussao-geral-titulo">
        <SubTitulo id="discussao-geral-titulo">Discussão geral</SubTitulo>
        <Lista aria-label="Comentários gerais da investigação">
          {discussaoGeral.map((comentario) => (
            <li key={comentario.id}>
              <ThreadItem comentario={comentario} />
            </li>
          ))}
        </Lista>
        <ComposerBloqueado rotulo="Comentar na discussão geral" />
      </Bloco>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Bloco = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubTitulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Contexto = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Lista = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 20px;
  list-style: none;
`;
