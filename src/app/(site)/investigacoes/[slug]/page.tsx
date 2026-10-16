import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { AnchorNav } from "../../../../components/investigacao/AnchorNav";
import { DiscussaoSection } from "../../../../components/investigacao/DiscussaoSection";
import { EvidenciasList } from "../../../../components/investigacao/EvidenciasList";
import { HistoricoTimeline } from "../../../../components/investigacao/HistoricoTimeline";
import { LocalizacaoEvidencias } from "../../../../components/investigacao/LocalizacaoEvidencias";
import { InvestigacaoCabecalho } from "../../../../components/investigacao/InvestigacaoCabecalho";
import { InvestigacaoSidebar } from "../../../../components/investigacao/InvestigacaoSidebar";
import { Secao, Subtitulo } from "../../../../components/investigacao/Secao";
import { SinteseSection } from "../../../../components/investigacao/SinteseSection";
import { TeoriaSection } from "../../../../components/investigacao/TeoriaSection";
import { EmptyState } from "../../../../components/states/EmptyState";
import { getInvestigacaoPorSlug } from "../../../../lib/data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const resultado = await getInvestigacaoPorSlug(slug);

  if (!resultado) {
    return { title: "Investigação não encontrada | ARCHIVES VI" };
  }

  return { title: `${resultado.caso.title} | ARCHIVES VI`, description: resultado.caso.description };
}

export default async function InvestigacaoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const resultado = await getInvestigacaoPorSlug(slug);

  // Unknown slug: the (site) not-found page is rendered.
  if (!resultado) notFound();

  const { caso, detalhe } = resultado;

  // The listing exists but its detailed content has not been published yet.
  if (!detalhe) {
    return (
      <EmptyState
        titulo={caso.title}
        descricao="Os detalhes desta investigação ainda não foram publicados."
      />
    );
  }

  const evidenciaDiscussao = detalhe.evidencias.find(
    (evidencia) => evidencia.id === detalhe.discussaoEvidenciaId,
  );

  return (
    <ContentGrid
      main={
        <>
          <InvestigacaoCabecalho caso={caso} detalhe={detalhe} />
          <AnchorNav />

          <Secao id="teoria" titulo="Teoria">
            <TeoriaSection teoria={detalhe.teoria} revisoes={detalhe.contagens.revisoes} />
          </Secao>

          <Secao id="evidencias" titulo="Evidências">
            <EvidenciasList
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
      }
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} />}
    />
  );
}
