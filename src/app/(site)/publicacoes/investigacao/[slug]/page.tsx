import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ContentGrid } from "../../../../../components/layout/ContentGrid";
import { ComunidadeInvestigacao } from "../../../../../components/investigacao/ComunidadeInvestigacao";
import { InvestigacaoSidebar } from "../../../../../components/investigacao/InvestigacaoSidebar";
import { EmptyState } from "../../../../../components/states/EmptyState";
import { ROUTES } from "../../../../../constants/routes";
import { getInvestigacaoPorSlug, getInvestigacoes } from "../../../../../lib/data";

type Params = Promise<{ slug: string }>;

// Área comunitária de uma investigação (ADR-020). Os slugs vêm dos mesmos registros Case usados pela
// página de Mistério, gerados no build. Com dynamicParams = false, um slug inexistente recebe HTTP 404
// real do roteador, antes do streaming. Ver docs/DECISIONS.md, ADR-014.
export const dynamicParams = false;

export async function generateStaticParams() {
  const investigacoes = await getInvestigacoes();
  return investigacoes.map((caso) => ({ slug: caso.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const resultado = await getInvestigacaoPorSlug(slug);

  if (!resultado) {
    return { title: "Investigação não encontrada | ARCHIVES VI" };
  }

  return { title: `Discussão: ${resultado.caso.title} | ARCHIVES VI` };
}

export default async function ComunidadeInvestigacaoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const resultado = await getInvestigacaoPorSlug(slug);

  // Slug desconhecido: a página "não encontrada" do grupo (site) é renderizada com HTTP 404.
  if (!resultado) notFound();

  const { caso, detalhe } = resultado;

  // O registro existe, mas a discussão detalhada ainda não foi publicada.
  if (!detalhe) {
    return (
      <ContentGrid
        main={
          <EmptyState
            titulo={caso.title}
            descricao="A discussão deste mistério ainda não foi publicada."
            acao={<Link href={ROUTES.investigacao(caso.id)}>Ler o mistério</Link>}
          />
        }
      />
    );
  }

  return (
    <ContentGrid
      main={<ComunidadeInvestigacao caso={caso} detalhe={detalhe} />}
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} />}
    />
  );
}
