"use client";

// Cópia dedicada da versão de components/investigacao/ComunidadeInvestigacao.tsx do commit 355b30ad (ADR-041). Usada só pelas páginas de investigação;
// Mistérios continua usando o componente atual. Não editar para ajustar Mistérios.
import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { ImagemDeCapa } from "../../constants/imagemPadraoInvestigacao";
import type { CasoDeCard } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { SemDados } from "../investigacao/BlocoDemonstracao";
import { AnchorNavClassica } from "./AnchorNavClassica";
import { DiscussaoSection } from "../investigacao/DiscussaoSection";
import { EvidenciasListClassica } from "./EvidenciasListClassica";
import { ImagemCapa } from "./ImagemCapa";
import { HistoricoTimeline } from "../investigacao/HistoricoTimeline";
import { LocalizacaoEvidencias } from "../investigacao/LocalizacaoEvidencias";
import { Secao, Subtitulo } from "../investigacao/Secao";
import { SinteseSection } from "../investigacao/SinteseSection";
import { TeoriaSection } from "../investigacao/TeoriaSection";

export interface ComunidadeInvestigacaoClassicaProps {
  caso: CasoDeCard;
  detalhe: InvestigacaoDetalhe;
  // Imagem de capa enviada (ou do mock). Vazia: imagem padrão (ADR-042). A capa aparece sempre.
  capa?: ImagemDeCapa | null;
  // Investigação do banco: lista de evidências real (envio, sugestões e aceitar/recusar pela API), no lugar da
  // lista do backup, que é simulada.
  evidenciasReais?: ReactNode;
  // Investigação do banco: discussão e síntese não têm fonte real e mostram estado vazio rotulado.
  semFonte?: boolean;
  // O link "Ler o mistério" só aparece quando a página do mistério existe (evita 404).
  mostrarLinkMisterio?: boolean;
}

// Área comunitária de um mistério, em /publicacoes/investigacao/[slug] (ADR-020). Reúne as seções que
// antes ficavam no detalhe da investigação: teoria, evidências com sugestões, discussão, localização,
// histórico e síntese. Os componentes são os mesmos; só a página mudou.
export function ComunidadeInvestigacaoClassica({
  caso,
  detalhe,
  capa,
  evidenciasReais,
  semFonte = false,
  mostrarLinkMisterio = true,
}: ComunidadeInvestigacaoClassicaProps) {
  const evidenciaDiscussao = detalhe.evidencias.find(
    (evidencia) => evidencia.id === detalhe.discussaoEvidenciaId,
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
        {mostrarLinkMisterio ? <LinkMisterio href={ROUTES.investigacao(caso.id)}>Ler o mistério</LinkMisterio> : null}
      </Cabecalho>

      {/* Capa: mesmo bloco da capa do backup (proporção fixa); toda investigação mostra uma imagem. */}
      <Capa>
        <ImagemCapa src={capa} sizes="(max-width: 1023px) 100vw, 900px" priority />
      </Capa>

      <AnchorNavClassica />

      <Secao id="teoria" titulo="Teoria">
        <TeoriaSection teoria={detalhe.teoria} revisoes={detalhe.contagens.revisoes} />
      </Secao>

      <Secao id="evidencias" titulo="Evidências">
        {evidenciasReais ?? (
          <EvidenciasListClassica
            evidencias={detalhe.evidencias}
            sugestoes={detalhe.sugestoes}
            investigador={detalhe.autor}
            total={detalhe.contagens.evidencias}
          />
        )}
      </Secao>

      <Secao id="discussao" titulo="Discussão">
        {semFonte ? (
          <SemDados>A discussão desta investigação aparece aqui quando houver registro.</SemDados>
        ) : (
          <DiscussaoSection
            evidenciaId={detalhe.discussaoEvidenciaId}
            evidenciaTitulo={evidenciaDiscussao?.titulo ?? ""}
            discussaoContextual={detalhe.discussaoContextual}
            discussaoGeral={detalhe.discussaoGeral}
          />
        )}
      </Secao>

      <Secao id="localizacao" titulo="Localização das evidências">
        <LocalizacaoEvidencias />
      </Secao>

      <Secao id="historico" titulo="Histórico e síntese">
        <Subtitulo>Linha do tempo</Subtitulo>
        <HistoricoTimeline registros={detalhe.historico} />
        <Subtitulo>Síntese</Subtitulo>
        {semFonte ? (
          <SemDados>A síntese desta investigação aparece aqui quando houver registro.</SemDados>
        ) : (
          <SinteseSection sintese={detalhe.sintese} />
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
