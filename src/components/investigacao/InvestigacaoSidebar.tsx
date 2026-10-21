"use client";

import styled from "styled-components";

import {
  ENCERRADA_PELO_AUTOR,
  ESTADO_INVESTIGACAO,
} from "../../lib/investigacaoEstado";
import type { DetalheReal } from "../../lib/adaptadores";
import type { CasoDeCard } from "../../types/Case";
import { Badge } from "../ui/Badge";
import { SidebarBox } from "../sidebar/SidebarBox";

export interface InvestigacaoSidebarProps {
  caso: CasoDeCard;
  detalhe: Pick<DetalheReal, "estado" | "encerradaPeloAutor">;
}

// Sidebar da investigação: estado e resumo, com dados reais. Atividade recente e participantes não existem na API.
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
