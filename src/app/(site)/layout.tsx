import type { ReactNode } from "react";

import { Container } from "../../components/layout/Container";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileTabBar } from "../../components/layout/MobileTabBar";
import { getInvestigadoresOnline } from "../../lib/data";

// Shared shell for all public routes. Route group (site) does not change URLs.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const investigadoresOnline = await getInvestigadoresOnline();

  return (
    <>
      <Header investigadoresOnline={investigadoresOnline} />
      <main id="conteudo">
        <Container>{children}</Container>
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
