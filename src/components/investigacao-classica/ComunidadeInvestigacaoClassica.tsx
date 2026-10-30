"use client";

// Cópia dedicada da versão de components/investigacao/ComunidadeInvestigacao.tsx do commit 355b30ad (ADR-041). Usada só pelas páginas de investigação;
// Mistérios continua usando o componente atual. Não editar para ajustar Mistérios.
import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Case } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Breadcrumb } from "../navigation/Breadcrumb";
import { AnchorNavClassica } from "./AnchorNavClassica";
import { DiscussaoSection } from "../investigacao/DiscussaoSection";
import { EvidenciasListClassica } from "./EvidenciasListClassica";
import { HistoricoTimeline } from "../investigacao/HistoricoTimeline";
import { LocalizacaoEvidencias } from "../investigacao/LocalizacaoEvidencias";
import { Secao, Subtitulo } from "../investigacao/Secao";
import { SinteseSection } from "../investigacao/SinteseSection";
import { TeoriaSection } from "../investigacao/TeoriaSection";

export interface ComunidadeInvestigacaoClassicaProps {
  caso: Case;
  detalhe: InvestigacaoDetalhe;
}

// Área comunitária de um mistério, em /publicacoes/investigacao/[slug] (ADR-020). Reúne as seções que
// antes ficavam no detalhe da investigação: teoria, evidências com sugestões, discussão, localização,
// histórico e síntese. Os componentes são os mesmos; só a página mudou.
export function ComunidadeInvestigacaoClassica({ caso, detalhe }: ComunidadeInvestigacaoClassicaProps) {
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
        <LinkMisterio href={ROUTES.investigacao(caso.id)}>Ler o mistério</LinkMisterio>
      </Cabecalho>

      <AnchorNavClassica />

      <Secao id="teoria" titulo="Teoria">
        <TeoriaSection teoria={detalhe.teoria} revisoes={detalhe.contagens.revisoes} />
      </Secao>

      <Secao id="evidencias" titulo="Evidências">
        <EvidenciasListClassica
          evidencias={detalhe.evidencias}
          sugestoes={detalhe.sugestoes}
          investigador={detalhe.autor}
          total={detalhe.contagens.evidencias}
        />
      </Secao>

      <Secao id="discussao" titulo="Discussão">
        <DiscussaoSection
          evidenciaId={detalhe.discussaoEvidenciaId}
          evidenciaTitulo={evidenciaDiscussao?.titulo ?? ""}
          discussaoContextual={detalhe.discussaoContextual}
          discussaoGeral={detalhe.discussaoGeral}
        />
      </Secao>

      <Secao id="localizacao" titulo="Localização das evidências">
        <LocalizacaoEvidencias />
      </Secao>

      <Secao id="historico" titulo="Histórico e síntese">
        <Subtitulo>Linha do tempo</Subtitulo>
        <HistoricoTimeline registros={detalhe.historico} />
        <Subtitulo>Síntese</Subtitulo>
        <SinteseSection sintese={detalhe.sintese} />
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
