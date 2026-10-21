import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvestigacaoSidebar } from "../../../../components/investigacao/InvestigacaoSidebar";
import { MisterioCabecalho } from "../../../../components/investigacao/MisterioCabecalho";
import { MisterioCorpo, TransicaoComunidade } from "../../../../components/investigacao/MisterioArtigo";
import { VideoYoutube } from "../../../../components/investigacao/VideoYoutube";
import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { investigacaoDetalheParaFront, investigacaoParaCaso } from "../../../../lib/adaptadores";
import { investigacaoPorSlug } from "../../../../server/leitura/investigacoes";

type Params = Promise<{ slug: string }>;

// Página editorial do mistério (ADR-020) com dados reais. Dinâmica: investigações criadas depois do build abrem
// sem recompilar, e um slug inexistente responde HTTP 404 real (ADR-028). As fotografias não aparecem: a API não
// tem imagens de evidência (ADR-031).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const dados = await investigacaoPorSlug(slug);
  if (!dados) return { title: "Mistério não encontrado | ARCHIVES VI" };
  return { title: `${dados.titulo} | ARCHIVES VI`, description: dados.descricao };
}

export default async function MisterioPage({ params }: { params: Params }) {
  const { slug } = await params;
  const dados = await investigacaoPorSlug(slug);

  if (!dados) notFound();

  const caso = investigacaoParaCaso(dados);
  const detalhe = investigacaoDetalheParaFront(dados);

  return (
    <ContentGrid
      main={
        <>
          <MisterioCabecalho caso={caso} detalhe={detalhe} />
          <VideoYoutube url={caso.video?.url} titulo={caso.video?.titulo} />
          <MisterioCorpo teoria={detalhe.teoria} />
          <TransicaoComunidade slug={caso.id} />
        </>
      }
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} />}
    />
  );
}
