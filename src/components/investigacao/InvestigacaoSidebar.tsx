"use client";

import styled from "styled-components";

import {
  ENCERRADA_PELO_AUTOR,
  ESTADO_INVESTIGACAO,
} from "../../lib/investigacaoEstado";
import type { Case } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { SidebarBox } from "../sidebar/SidebarBox";

export interface InvestigacaoSidebarProps {
  caso: Case;
  detalhe: InvestigacaoDetalhe;
}

// Investigation sidebar: state, summary, recent activity and participants.
// It replaces the home sidebar on this page and uses the same SidebarBox.
export function InvestigacaoSidebar({ caso, detalhe }: InvestigacaoSidebarProps) {
  const estado = ESTADO_INVESTIGACAO[detalhe.estado];

  return (
    <>
      <SidebarBox titulo="Estado da investigação">
        <Badge size="small" variant={estado.variant} uppercase>
          {estado.rotulo}
        </Badge>
        <Nota>{estado.descricao}</Nota>
        {detalhe.encerradaPeloAutor ? (
          <>
            <Badge size="small" variant={ENCERRADA_PELO_AUTOR.variant} uppercase>
              {ENCERRADA_PELO_AUTOR.rotulo}
            </Badge>
            <Nota>{ENCERRADA_PELO_AUTOR.descricao}</Nota>
          </>
        ) : null}
      </SidebarBox>

      <SidebarBox titulo="Resumo">
        <Texto>{caso.description}</Texto>
        <Nota>Local: {caso.location ?? "não informado"}</Nota>
      </SidebarBox>

      <SidebarBox titulo="Atividade recente">
        <Nota>Itens demonstrativos, não ações reais de usuários.</Nota>
        <Lista>
          {detalhe.atividadeRecente.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Lista>
      </SidebarBox>

      <SidebarBox titulo="Participantes">
        <Nota>
          {detalhe.contagens.participantes} participantes. Lista parcial demonstrativa.
        </Nota>
        <Participantes>
          {detalhe.participantes.map((pessoa) => (
            <li key={pessoa.usuario}>
              <Avatar nome={pessoa.nome} size="small" />
              <span>
                {pessoa.nome} <Usuario>@{pessoa.usuario}</Usuario>
              </span>
            </li>
          ))}
        </Participantes>
      </SidebarBox>
    </>
  );
}

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Texto = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 18px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Participantes = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Usuario = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;
