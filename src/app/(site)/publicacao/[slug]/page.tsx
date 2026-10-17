import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Breadcrumb } from "../../../../components/navigation/Breadcrumb";
import { ComentariosSection } from "../../../../components/publicacao/ComentariosSection";
import { PublicacaoCabecalho } from "../../../../components/publicacao/PublicacaoCabecalho";
import { AutorCard } from "../../../../components/sidebar/AutorCard";
import { RelacionadasList } from "../../../../components/sidebar/RelacionadasList";
import { ROUTES } from "../../../../constants/routes";
import {
  getCriadorPorId,
  getPublicacaoPorSlug,
  getPublicacoes,
  getPublicacoesRelacionadas,
} from "../../../../lib/data";

type Params = Promise<{ slug: string }>;

// Publication slugs are generated at build time from the mocks. With dynamicParams = false, an
// unknown slug gets a real HTTP 404 from the router, before any streaming starts. A new
// publication then needs a new build until there is an API. See docs/DECISIONS.md, ADR-014.
export const dynamicParams = false;

export async function generateStaticParams() {
  const publicacoes = await getPublicacoes();
  return publicacoes.map((publicacao) => ({ slug: publicacao.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const publicacao = await getPublicacaoPorSlug(slug);

  if (!publicacao) {
    return { title: "Publicação não encontrada | ARCHIVES VI" };
  }

  return { title: `${publicacao.titulo} | ARCHIVES VI`, description: publicacao.resumo };
}

export default async function PublicacaoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const publicacao = await getPublicacaoPorSlug(slug);

  // Unknown slug: render the (site) not-found page instead of breaking.
  if (!publicacao) notFound();

  const [autor, relacionadas] = await Promise.all([
    getCriadorPorId(publicacao.autorId),
    getPublicacoesRelacionadas(publicacao),
  ]);

  return (
    <ContentGrid
      main={
        <>
          <Breadcrumb
            itens={[
              { label: "Início", href: ROUTES.inicio },
              { label: "Publicações", href: ROUTES.publicacoes },
              { label: publicacao.titulo },
            ]}
          />
          <PublicacaoCabecalho publicacao={publicacao} autor={autor} />
          <ComentariosSection total={publicacao.comentarios} />
        </>
      }
      sidebar={
        <>
          {autor ? <AutorCard autor={autor} /> : null}
          <RelacionadasList publicacoes={relacionadas} />
        </>
      }
    />
  );
}
