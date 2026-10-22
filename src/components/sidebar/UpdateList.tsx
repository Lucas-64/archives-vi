"use client";

import styled from "styled-components";

import type { Atualizacao } from "../../types/Atualizacao";
import { formatarData } from "../../lib/formatacao";
import { Badge } from "../ui/Badge";

export interface UpdateListProps {
  atualizacoes: Atualizacao[];
  // Rotula o bloco como conteúdo de demonstração (não há feed de atualizações; ADR-036).
  demonstracao?: boolean;
}

const ROTULO_TIPO = {
  novo: { texto: "Novo", variant: "primary" },
  atualizado: { texto: "Atualizado", variant: "secondary" },
} as const;

export function UpdateList({ atualizacoes, demonstracao = false }: UpdateListProps) {
  return (
    <Section aria-labelledby="atualizacoes-titulo">
      <Titulo id="atualizacoes-titulo">Atualizações recentes</Titulo>
      {demonstracao ? <Badge size="small" uppercase>Demonstração</Badge> : null}
      <List>
        {atualizacoes.map((item) => {
          const rotulo = ROTULO_TIPO[item.tipo];
          return (
            <Item key={item.id}>
              <Badge variant={rotulo.variant} size="small" uppercase>
                {rotulo.texto}
              </Badge>
              <Texto>{item.titulo}</Texto>
              <Data dateTime={item.data}>{formatarData(item.data)}</Data>
            </Item>
          );
        })}
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
  flex-direction: column;
  gap: 6px;
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Texto = styled.p`
  font-size: 14px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.text};
`;

const Data = styled.time`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
