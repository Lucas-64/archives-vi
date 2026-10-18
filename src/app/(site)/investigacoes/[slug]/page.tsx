import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { InvestigacaoSidebar } from "../../../../components/investigacao/InvestigacaoSidebar";
import { MisterioCabecalho } from "../../../../components/investigacao/MisterioCabecalho";
import { FotografiasMisterio, MisterioCorpo, TransicaoComunidade } from "../../../../components/investigacao/MisterioArtigo";
import { VideoYoutube } from "../../../../components/investigacao/VideoYoutube";
import { EmptyState } from "../../../../components/states/EmptyState";
import { getInvestigacaoPorSlug, getInvestigacoes } from "../../../../lib/data";

type Params = Promise<{ slug: string }>;

// Página editorial do mistério (ADR-020). Os slugs são os ids dos registros Case, gerados no build a
// partir dos mocks. Com dynamicParams = false, um slug desconhecido recebe HTTP 404 real do roteador,
// antes do streaming. Ver docs/DECISIONS.md, ADR-014.
export const dynamicParams = false;

export async function generateStaticParams() {
  const investigacoes = await getInvestigacoes();
  return investigacoes.map((caso) => ({ slug: caso.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const resultado = await getInvestigacaoPorSlug(slug);

  if (!resultado) {
    return { title: "Mistério não encontrado | ARCHIVES VI" };
  }

  return { title: `${resultado.caso.title} | ARCHIVES VI`, description: resultado.caso.description };
}

export default async function MisterioPage({ params }: { params: Params }) {
  const { slug } = await params;
  const resultado = await getInvestigacaoPorSlug(slug);

  // Slug desconhecido: a página "não encontrada" do grupo (site) é renderizada.
  if (!resultado) notFound();

  const { caso, detalhe } = resultado;

  // O registro existe, mas o conteúdo detalhado ainda não foi publicado.
  if (!detalhe) {
    return (
      <EmptyState
        titulo={caso.title}
        descricao="Os detalhes deste mistério ainda não foram publicados."
      />
    );
  }

  return (
    <ContentGrid
      main={
        <>
          <MisterioCabecalho caso={caso} detalhe={detalhe} />
          <VideoYoutube url={caso.video?.url} titulo={caso.video?.titulo} />
          <MisterioCorpo teoria={detalhe.teoria} />
          <FotografiasMisterio evidencias={detalhe.evidencias} />
          <TransicaoComunidade slug={caso.id} />
        </>
      }
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} />}
    />
  );
}
