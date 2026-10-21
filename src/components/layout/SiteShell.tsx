import type { ReactNode } from "react";

import { Container } from "./Container";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileTabBar } from "./MobileTabBar";

// Shared shell of the public site: header, main content frame, footer and mobile tab bar.
// Used by the (site) group layout and by the global not-found page, so both render the same
// structure. It must be rendered once per page: do not nest it inside another shell.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Container>{children}</Container>
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
