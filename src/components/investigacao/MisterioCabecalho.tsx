"use client";

import Image from "next/image";
import styled from "styled-components";

import { AcaoRestrita } from "../acoes/AcaoRestrita";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { ROUTES } from "../../constants/routes";
import { formatarData } from "../../lib/formatacao";
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

export interface MisterioCabecalhoProps {
  caso: Case;
  detalhe: InvestigacaoDetalhe;
}

// Apresentação editorial do mistério (página /investigacoes/[slug]). Mantém o cabeçalho, a largura e
// os componentes do site: só muda a organização do conteúdo. Os dados vêm do próprio registro.
export function MisterioCabecalho({ caso, detalhe }: MisterioCabecalhoProps) {
  const estado = ESTADO_INVESTIGACAO[detalhe.estado];
  const { autor } = detalhe;

  return (
    <Wrapper>
      <Breadcrumb
        itens={[
          { label: "Início", href: ROUTES.inicio },
          { label: "Mistérios", href: ROUTES.misterios },
          { label: caso.title },
        ]}
      />

      <Etiquetas>
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
      </Etiquetas>

      <Titulo>{caso.title}</Titulo>
      <Resumo>{caso.description}</Resumo>

      <Autoria>
        <Avatar nome={autor.nome} />
        <div>
          <strong>{autor.nome}</strong> <Usuario>@{autor.usuario}</Usuario>
          <Datas>
            Publicado em <time dateTime={detalhe.criadoEm}>{formatarData(detalhe.criadoEm)}</time>
            {" · "}
            Atualizado em <time dateTime={detalhe.atualizadoEm}>{formatarData(detalhe.atualizadoEm)}</time>
          </Datas>
        </div>
      </Autoria>

      <Acoes>
        <AcaoRestrita rotulo="Acompanhar" mensagem="Acompanhar exige autenticação." />
        <CopyLinkButton />
      </Acoes>

      <Capa>
        <Image
          src={caso.image}
          alt=""
          fill
          sizes="(max-width: 1023px) 100vw, 900px"
          style={{ objectFit: "cover" }}
          priority
        />
      </Capa>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

const Etiquetas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 40px;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 30px;
  }
`;

const Resumo = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Autoria = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
`;

const Usuario = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Datas = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const Capa = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 767px) {
    aspect-ratio: 16 / 10;
  }
`;
