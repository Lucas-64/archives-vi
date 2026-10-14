"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";

import { theme } from "../styles/theme";
import { GlobalStyle } from "../styles/global";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
}
