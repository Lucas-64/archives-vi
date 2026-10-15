"use client";

import styled from "styled-components";

import { formatarData } from "../../lib/formatacao";
import type { Comentario } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

export interface ThreadItemProps {
  comentario: Comentario;
}

// One comment with its nested replies. Replies are indented with a left rule.
export function ThreadItem({ comentario }: ThreadItemProps) {
  const { autor, data, texto, contribuicaoUtil, respostas } = comentario;

  return (
    <Item>
      <Cabecalho>
        <Avatar nome={autor.nome} size="small" />
        <Autor>{autor.nome}</Autor>
        <Usuario>@{autor.usuario}</Usuario>
        <time dateTime={data}>{formatarData(data)}</time>
        {contribuicaoUtil ? (
          <Badge size="small" variant="success">
            Contribuição útil
          </Badge>
        ) : null}
      </Cabecalho>

      <Texto>{texto}</Texto>

      {respostas.length > 0 ? (
        <Respostas aria-label="Respostas">
          {respostas.map((resposta) => (
            <li key={resposta.id}>
              <ThreadItem comentario={resposta} />
            </li>
          ))}
        </Respostas>
      ) : null}
    </Item>
  );
}

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Autor = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Usuario = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Texto = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
`;

const Respostas = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 16px;
  padding-left: 16px;
  list-style: none;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
`;
