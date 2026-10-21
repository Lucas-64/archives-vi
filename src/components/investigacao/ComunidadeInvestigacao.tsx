"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { DetalheReal } from "../../lib/adaptadores";
import type { CasoDeCard } from "../../types/Case";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { AnchorNav } from "./AnchorNav";
import { Secao } from "./Secao";
import { TeoriaSection } from "./TeoriaSection";

export interface ComunidadeInvestigacaoProps {
  caso: CasoDeCard;
  detalhe: DetalheReal;
  // Seções com dados do servidor, montadas pela página (cada uma com o seu estado de carregamento).
  historico: ReactNode;
  // Seção de evidências (lista pública, envio, sugestões e fila), montada pela página com dados do servidor.
  evidencias: ReactNode;
}

// Área comunitária de uma investigação, em /publicacoes/investigacao/[slug] (ADR-020), com dados reais:
// teoria, evidências e histórico. Discussão, localização das evidências e síntese não aparecem porque a API
// não tem esses dados (ADR-031); nada é inventado para preenchê-las.
export function ComunidadeInvestigacao({ caso, detalhe, historico, evidencias }: ComunidadeInvestigacaoProps) {
  return (
    <>
      <Cabecalho>
        <Breadcrumb
          itens={[
            { label: "Início", href: ROUTES.inicio },
            { label: "Teorias e investigações", href: ROUTES.teorias },
            { label: caso.title },
          ]}
        />
        <Rotulo>Área da comunidade</Rotulo>
        <Titulo>{caso.title}</Titulo>
        <LinkMisterio href={ROUTES.investigacao(caso.id)}>Ler o mistério</LinkMisterio>
      </Cabecalho>

      <AnchorNav />

      <Secao id="teoria" titulo="Teoria">
        <TeoriaSection teoria={detalhe.teoria} revisoes={detalhe.contagens.revisoes} />
      </Secao>

      <Secao id="evidencias" titulo="Evidências">
        {evidencias}
      </Secao>

      <Secao id="historico" titulo="Histórico">
        {historico}
      </Secao>
    </>
  );
}

const Cabecalho = styled.header`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const Rotulo = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.pink};
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 34px;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

const LinkMisterio = styled(Link)`
  align-self: flex-start;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};
`;
