import type { Metadata } from "next";

import { SiteShell } from "../components/layout/SiteShell";
import { PaginaNaoEncontrada } from "../components/states/PaginaNaoEncontrada";

export const metadata: Metadata = {
  title: "Página não encontrada | ARCHIVES VI",
};

// Root not-found page. The router renders it for URLs outside the (site) group and for unknown
// dynamic segments of routes with dynamicParams = false, so those responses carry a real HTTP 404.
// It sits inside the root layout, not the (site) layout, so it renders the shared shell itself.
export default async function NotFound() {
  return (
    <SiteShell>
      <PaginaNaoEncontrada />
    </SiteShell>
  );
}
