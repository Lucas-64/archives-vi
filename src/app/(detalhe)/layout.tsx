import type { ReactNode } from "react";

import { SiteShell } from "../../components/layout/SiteShell";

// Mesmo shell do grupo (site), em um grupo próprio e SEM loading.tsx. Rotas de detalhe de conteúdo que pode
// não existir precisam responder HTTP 404 real: o notFound() da página tem de acontecer antes do início do
// streaming, e qualquer loading.tsx acima da página inicia o streaming antes (resposta 200 com a página
// "não encontrado"). O estado de carregamento dessas rotas é feito com Suspense DENTRO da página, depois da
// verificação de existência. Ver docs/DECISIONS.md, ADR-028.
export default function DetalheLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
