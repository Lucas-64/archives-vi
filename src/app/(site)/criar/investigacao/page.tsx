import type { Metadata } from "next";

import { CriarInvestigacao } from "../../../../components/criar/CriarInvestigacao";
import { misterioPorSlug } from "../../../../server/leitura/misterios";

export const metadata: Metadata = {
  title: "Abrir investigação | ARCHIVES VI",
  description: "Abra uma investigação com hipótese, argumentos e fontes.",
};

// Dinâmica: lê `?misterio=<slug>` para vincular a investigação a um mistério (opcional, ADR-044).
export const dynamic = "force-dynamic";

export default async function CriarInvestigacaoPage({ searchParams }: { searchParams: Promise<{ misterio?: string }> }) {
  const { misterio: slug } = await searchParams;
  const misterio = slug ? await misterioPorSlug(slug.trim()) : null;
  return <CriarInvestigacao misterio={misterio ? { slug: misterio.slug, titulo: misterio.titulo } : null} />;
}
