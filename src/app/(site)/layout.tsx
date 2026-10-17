import type { ReactNode } from "react";

import { SiteShell } from "../../components/layout/SiteShell";

// Shared shell for all public routes. Route group (site) does not change URLs.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
