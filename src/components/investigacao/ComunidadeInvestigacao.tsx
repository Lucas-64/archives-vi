"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { DetalheReal } from "../../lib/adaptadores";
import type { CasoDeCard } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { AnchorNav } from "./AnchorNav";
import { BlocoDemonstracao, SemDados } from "./BlocoDemonstracao";
import { DiscussaoSection } from "./DiscussaoSection";
import { LocalizacaoEvidencias } from "./LocalizacaoEvidencias";
import { Secao, Subtitulo } from "./Secao";
import { SinteseSection } from "./SinteseSection";
import { TeoriaSection } from "./TeoriaSection";

export interface ComunidadeInvestigacaoProps {
  caso: CasoDeCard;
  detalhe: DetalheReal;
  // Seções com dados do servidor, montadas pela página (cada uma com o seu estado de carregamento).
  historico: ReactNode;
  // Seção de evidências (lista pública, envio, sugestões e fila), montada pela página com dados do servidor.
  evidencias: ReactNode;
  // Exemplo de discussão e síntese (só para slugs com mock). Sem ele, as seções mostram estado vazio rotulado.
  demonstracao?: InvestigacaoDetalhe;
}

const SECOES = [
  { id: "teoria", rotulo: "Teoria" },
  { id: "evidencias", rotulo: "Evidências" },
  { id: "discussao", rotulo: "Discussão" },
  { id: "localizacao", rotulo: "Localização" },
  { id: "historico", rotulo: "Histórico" },
];

// Área comunitária de uma investigação, em /publicacoes/investigacao/[slug] (ADR-020), com o layout antigo
// restaurado (ADR-039). Teoria, evidências e histórico vêm da API. Discussão, localização e síntese não têm fonte
// real (ADR-031): mostram o exemplo do slug, rotulado como demonstração, ou um estado vazio rotulado.
export function ComunidadeInvestigacao({ caso, detalhe, historico, evidencias, demonstracao }: ComunidadeInvestigacaoProps) {
  const evidenciaDiscussao = demonstracao?.evidencias.find(
    (evidencia) => evidencia.id === demonstracao.discussaoEvidenciaId,
  );

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
        <Rotulo>Discussão da comunidade</Rotulo>
        <Titulo>{caso.title}</Titulo>
        <LinkMisterio href={ROUTES.investigacao(caso.id)}>Ler o mistério</LinkMisterio>
      </Cabecalho>

      <AnchorNav itens={SECOES} />

      <Secao id="teoria" titulo="Teoria">
        <TeoriaSection teoria={detalhe.teoria} revisoes={detalhe.contagens.revisoes} />
      </Secao>

      <Secao id="evidencias" titulo="Evidências">
        {evidencias}
      </Secao>

      <Secao id="discussao" titulo="Discussão">
        {demonstracao ? (
          <BlocoDemonstracao>
            <DiscussaoSection
              evidenciaId={demonstracao.discussaoEvidenciaId}
              evidenciaTitulo={evidenciaDiscussao?.titulo ?? ""}
              discussaoContextual={demonstracao.discussaoContextual}
              discussaoGeral={demonstracao.discussaoGeral}
            />
          </BlocoDemonstracao>
        ) : (
          <SemDados>A discussão desta investigação aparece aqui quando houver registro.</SemDados>
        )}
      </Secao>

      <Secao id="localizacao" titulo="Localização das evidências">
        <BlocoDemonstracao>
          <LocalizacaoEvidencias />
        </BlocoDemonstracao>
      </Secao>

      <Secao id="historico" titulo="Histórico e síntese">
        <Subtitulo>Linha do tempo</Subtitulo>
        {historico}
        <Subtitulo>Síntese</Subtitulo>
        {demonstracao ? (
          <BlocoDemonstracao>
            <SinteseSection sintese={demonstracao.sintese} />
          </BlocoDemonstracao>
        ) : (
          <SemDados>A síntese desta investigação aparece aqui quando houver registro.</SemDados>
        )}
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
