import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Breadcrumb } from "../../../../components/navigation/Breadcrumb";
import { ComentariosSection } from "../../../../components/publicacao/ComentariosSection";
import { PublicacaoCabecalho } from "../../../../components/publicacao/PublicacaoCabecalho";
import { AutorCard } from "../../../../components/sidebar/AutorCard";
import { RelacionadasList } from "../../../../components/sidebar/RelacionadasList";
import { Skeleton } from "../../../../components/states/Skeleton";
import { ROUTES } from "../../../../constants/routes";
import { perfilParaCriador, publicacaoParaFront } from "../../../../lib/adaptadores";
import { usuarioDaSessao } from "../../../../server/auth/sessaoServidor";
import {
  comentariosDaPublicacao,
  publicacaoPorSlug,
  relacionadasDaPublicacao,
} from "../../../../server/leitura/publicacoes";
import { perfilPublico } from "../../../../server/leitura/usuarios";

type Params = Promise<{ slug: string }>;

// Publicação real e dinâmica: publicações criadas depois do build abrem sem recompilar, e um slug inexistente
// responde HTTP 404 real, porque a verificação acontece antes de qualquer Suspense e este grupo não tem
// `loading.tsx` (ADR-028). O cookie é lido aqui só para saber se a pessoa já curtiu (`euCurti`).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const publicacao = await publicacaoPorSlug(slug);
  if (!publicacao) return { title: "Publicação não encontrada | ARCHIVES VI" };
  return { title: `${publicacao.titulo} | ARCHIVES VI`, description: publicacao.resumo };
}

async function Comentarios({ slug, total }: { slug: string; total: number }) {
  const { itens, proximoCursor } = await comentariosDaPublicacao(slug);
  return <ComentariosSection slug={slug} total={total} iniciais={itens} proximoCursor={proximoCursor} />;
}

async function BarraLateral({ slug, usuarioAutor }: { slug: string; usuarioAutor: string }) {
  const [perfil, relacionadas] = await Promise.all([perfilPublico(usuarioAutor), relacionadasDaPublicacao(slug)]);
  return (
    <>
      {perfil ? <AutorCard autor={perfilParaCriador(perfil)} /> : null}
      <RelacionadasList publicacoes={relacionadas.map(publicacaoParaFront)} />
    </>
  );
}

export default async function PublicacaoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const sessao = await usuarioDaSessao();
  const dados = await publicacaoPorSlug(slug, sessao?.id);

  if (!dados) notFound();

  const publicacao = publicacaoParaFront(dados);
  const autor = perfilParaCriador({ usuario: dados.autor.usuario, nome: dados.autor.nome, bio: "" });

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
          <PublicacaoCabecalho publicacao={publicacao} autor={autor} curtidas={dados.curtidas} euCurti={dados.euCurti} />
          <Suspense fallback={<Skeleton height="220px" radius="lg" />}>
            <Comentarios slug={slug} total={dados.comentarios} />
          </Suspense>
        </>
      }
      sidebar={
        <Suspense fallback={<Skeleton height="200px" radius="lg" />}>
          <BarraLateral slug={slug} usuarioAutor={dados.autor.usuario} />
        </Suspense>
      }
    />
  );
}
