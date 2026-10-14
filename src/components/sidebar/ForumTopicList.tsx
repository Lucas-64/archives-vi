"use client";

import styled from "styled-components";

import type { Topico } from "../../types/Topico";
import { formatarNumero } from "../../lib/formatacao";

export interface ForumTopicListProps {
  topicos: Topico[];
}

export function ForumTopicList({ topicos }: ForumTopicListProps) {
  return (
    <Section aria-labelledby="topicos-titulo">
      <Titulo id="topicos-titulo">Últimos tópicos do fórum</Titulo>
      <List>
        {topicos.map((topico) => (
          <Item key={topico.id}>
            <span>{topico.titulo}</span>
            <Count aria-label={`${topico.respostas} respostas`}>
              {formatarNumero(topico.respostas)}
            </Count>
          </Item>
        ))}
      </List>
    </Section>
  );
}

const Section = styled.section`
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Titulo = styled.h2`
  margin-bottom: 8px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
`;

const List = styled.ul`
  list-style: none;
`;

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 14px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Count = styled.strong`
  flex-shrink: 0;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.pink};
`;
