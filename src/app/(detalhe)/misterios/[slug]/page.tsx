import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { MisterioPagina } from "../../../../components/misterio/MisterioPagina";
import { misterioPorSlug } from "../../../../server/leitura/misterios";

type Params = Promise<{ slug: string }>;

// Página do mistério (ADR-044), no grupo (detalhe): dinâmica e sem loading.tsx, para o slug inexistente
// responder 404 real (ADR-028).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const dados = await misterioPorSlug(slug);
  if (!dados) return { title: "Mistério não encontrado | ARCHIVES VI" };
  return { title: `${dados.titulo} | ARCHIVES VI`, description: dados.descricao };
}

export default async function MisterioPage({ params }: { params: Params }) {
  const { slug } = await params;
  const dados = await misterioPorSlug(slug);
  if (!dados) notFound();

  return (
    <ContentGrid
      main={
        <MisterioPagina
          slug={dados.slug}
          titulo={dados.titulo}
          descricao={dados.descricao}
          imagem={dados.imagem}
          classificacao={dados.classificacao}
          video={dados.video}
          autor={dados.autor}
          criadoEm={dados.criadoEm}
          investigacoesAbertas={dados.investigacoesAbertas}
        />
      }
    />
  );
}
