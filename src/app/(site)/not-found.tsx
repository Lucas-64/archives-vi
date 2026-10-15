import Link from "next/link";

import { Container } from "../../components/layout/Container";
import { EmptyState } from "../../components/states/EmptyState";
import { ROUTES } from "../../constants/routes";

// Shown when a route inside the (site) group calls notFound(), e.g. an unknown publication slug.
export default function SiteNotFound() {
  return (
    <Container>
      <EmptyState
        titulo="Página não encontrada"
        descricao="O conteúdo que você procura não existe ou foi removido."
        acao={<Link href={ROUTES.publicacoes}>Ver publicações</Link>}
      />
    </Container>
  );
}
