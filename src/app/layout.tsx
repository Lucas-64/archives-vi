import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import { StyledComponentsRegistry } from "./registry";

// Fonts follow the approved prototype (docs/UI_GUIDELINES.md, Typography).
// next/font self-hosts them at build time, so there is no runtime request to Google Fonts.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARCHIVES VI",
  description:
    "ARCHIVES VI é um site da comunidade dedicado exclusivamente aos mistérios, easter eggs, teorias e descobertas de GTA VI.",
  // Kept from the previous index.html: the site is not indexed yet.
  // Remove this block when SEO is enabled for public launch.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
