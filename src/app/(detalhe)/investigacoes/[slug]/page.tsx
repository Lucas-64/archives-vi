import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlocoDemonstracao, SemDados } from "../../../../components/investigacao/BlocoDemonstracao";
import { InvestigacaoSidebar } from "../../../../components/investigacao/InvestigacaoSidebar";
import { MisterioCabecalho } from "../../../../components/investigacao/MisterioCabecalho";
import { FotografiasMisterio, MisterioCorpo, TransicaoComunidade } from "../../../../components/investigacao/MisterioArtigo";
import { Subtitulo } from "../../../../components/investigacao/Secao";
import { VideoYoutube } from "../../../../components/investigacao/VideoYoutube";
import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { investigacaoDetalheParaFront, investigacaoParaCaso } from "../../../../lib/adaptadores";
import { detalheDemonstrativo } from "../../../../lib/demonstracaoInvestigacao";
import { investigacaoPorSlug } from "../../../../server/leitura/investigacoes";

type Params = Promise<{ slug: string }>;

// Página editorial do mistério (ADR-020) com dados reais. Dinâmica: investigações criadas depois do build abrem
// sem recompilar, e um slug inexistente responde HTTP 404 real (ADR-028). A API não tem imagens de evidência
// (ADR-031): a seção Fotografias (layout antigo, ADR-039) mostra o exemplo do slug, rotulado como demonstração,
// ou um estado vazio rotulado.
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
  const demonstracao = detalheDemonstrativo(slug);

  return (
    <ContentGrid
      main={
        <>
          <MisterioCabecalho caso={caso} detalhe={detalhe} />
          <VideoYoutube url={caso.video?.url} titulo={caso.video?.titulo} />
          <MisterioCorpo teoria={detalhe.teoria} />
          {demonstracao ? (
            <BlocoDemonstracao>
              <FotografiasMisterio evidencias={demonstracao.evidencias} />
            </BlocoDemonstracao>
          ) : (
            <section aria-label="Fotografias">
              <Subtitulo>Fotografias</Subtitulo>
              <SemDados>As fotografias das evidências aparecem aqui quando este recurso estiver pronto.</SemDados>
            </section>
          )}
          <TransicaoComunidade slug={caso.id} />
        </>
      }
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} demonstracao={demonstracao} />}
    />
  );
}
