import Link from "next/link";

import { ROUTES } from "../../constants/routes";
import { EmptyState } from "./EmptyState";

// Shared "not found" content. It has no container of its own: the shell it is rendered in
// (SiteShell) provides the page frame. Used by the (site) group and by the global not-found page.
export function PaginaNaoEncontrada() {
  return (
    <EmptyState
      titulo="Página não encontrada"
      descricao="O conteúdo que você procura não existe ou foi removido."
      acao={
        <>
          <Link href={ROUTES.inicio}>Início</Link> · <Link href={ROUTES.publicacoes}>Ver publicações</Link>
        </>
      }
    />
  );
}
