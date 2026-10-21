"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";

import { SessaoProvider } from "../components/auth/SessaoProvider";
import { theme } from "../styles/theme";
import { GlobalStyle } from "../styles/global";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SessaoProvider>{children}</SessaoProvider>
    </ThemeProvider>
  );
}
