"use client";

import styled from "styled-components";

import { Breadcrumb } from "../navigation/Breadcrumb";
import { AcaoRestrita } from "../acoes/AcaoRestrita";
import { ROUTES } from "../../constants/routes";
import { formatarData, formatarNumero } from "../../lib/formatacao";
import {
  ENCERRADA_PELO_AUTOR,
  ESTADO_INVESTIGACAO,
  ROTULO_CATEGORIA,
} from "../../lib/investigacaoEstado";
import type { Case } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { CopyLinkButton } from "./CopyLinkButton";

export interface InvestigacaoCabecalhoProps {
  caso: Case;
  detalhe: InvestigacaoDetalhe;
}

export function InvestigacaoCabecalho({ caso, detalhe }: InvestigacaoCabecalhoProps) {
  const estado = ESTADO_INVESTIGACAO[detalhe.estado];
  const { contagens, autor } = detalhe;

  return (
    <Wrapper>
      <Breadcrumb
        itens={[
          { label: "Início", href: ROUTES.inicio },
          { label: "Investigações", href: ROUTES.investigacoes },
          { label: caso.title },
        ]}
      />

      <Tags>
        <Badge size="small" variant={estado.variant} uppercase>
          {estado.rotulo}
        </Badge>
        {detalhe.encerradaPeloAutor ? (
          <Badge size="small" variant={ENCERRADA_PELO_AUTOR.variant} uppercase>
            {ENCERRADA_PELO_AUTOR.rotulo}
          </Badge>
        ) : null}
        <Badge size="small" variant="default">
          {ROTULO_CATEGORIA[caso.category] ?? caso.category}
        </Badge>
      </Tags>

      <Titulo>{caso.title}</Titulo>

      <Autor>
        <Avatar nome={autor.nome} />
        <div>
          <strong>{autor.nome}</strong> <Usuario>@{autor.usuario}</Usuario>
          <Datas>
            Publicada em <time dateTime={detalhe.criadoEm}>{formatarData(detalhe.criadoEm)}</time>
            {" · "}
            Atualizada em <time dateTime={detalhe.atualizadoEm}>{formatarData(detalhe.atualizadoEm)}</time>
          </Datas>
        </div>
      </Autor>

      <Contagens aria-label="Números da investigação (dados demonstrativos)">
        <li>
          <strong>{formatarNumero(contagens.participantes)}</strong> participantes
        </li>
        <li>
          <strong>{formatarNumero(contagens.evidencias)}</strong> evidências
        </li>
        <li>
          <strong>{formatarNumero(contagens.comentarios)}</strong> comentários
        </li>
        <li>
          <strong>{formatarNumero(contagens.revisoes)}</strong> revisões
        </li>
      </Contagens>
      <Aviso>Os números desta página são demonstrativos.</Aviso>

      <Acoes>
        <AcaoRestrita rotulo="Acompanhar" mensagem="Acompanhar exige autenticação." />
        <CopyLinkButton />
      </Acoes>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 32px;
  }
`;

const Autor = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const Usuario = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Datas = styled.p`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Contagens = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  list-style: none;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Aviso = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px 24px;
`;
