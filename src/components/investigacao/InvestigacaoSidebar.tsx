"use client";

import styled from "styled-components";

import {
  ENCERRADA_PELO_AUTOR,
  ESTADO_INVESTIGACAO,
} from "../../lib/investigacaoEstado";
import type { DetalheReal } from "../../lib/adaptadores";
import type { CasoDeCard } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { SidebarBox } from "../sidebar/SidebarBox";
import { BlocoDemonstracao, SemDados } from "./BlocoDemonstracao";

export interface InvestigacaoSidebarProps {
  caso: CasoDeCard;
  detalhe: Pick<DetalheReal, "estado" | "encerradaPeloAutor">;
  // Exemplo de atividade e participantes (só para slugs com mock). Sem ele, as caixas mostram estado vazio rotulado.
  demonstracao?: Pick<InvestigacaoDetalhe, "atividadeRecente" | "participantes" | "contagens">;
}

// Sidebar da investigação (layout antigo restaurado, ADR-039): estado e resumo vêm da API. Atividade recente e
// participantes não existem na API: mostram o exemplo do slug, rotulado como demonstração, ou estado vazio rotulado.
export function InvestigacaoSidebar({ caso, detalhe, demonstracao }: InvestigacaoSidebarProps) {
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
        {demonstracao ? (
          <BlocoDemonstracao>
            <Lista>
              {demonstracao.atividadeRecente.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </Lista>
          </BlocoDemonstracao>
        ) : (
          <SemDados />
        )}
      </SidebarBox>

      <SidebarBox titulo="Participantes">
        {demonstracao ? (
          <BlocoDemonstracao>
            <Nota>{demonstracao.contagens.participantes} participantes. Lista parcial demonstrativa.</Nota>
            <Participantes>
              {demonstracao.participantes.map((pessoa) => (
                <li key={pessoa.usuario}>
                  <Avatar nome={pessoa.nome} size="small" />
                  <span>
                    {pessoa.nome} <Usuario>@{pessoa.usuario}</Usuario>
                  </span>
                </li>
              ))}
            </Participantes>
          </BlocoDemonstracao>
        ) : (
          <SemDados />
        )}
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
