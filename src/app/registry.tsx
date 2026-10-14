"use client";

import { useState, type ReactNode } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

// Collects styled-components CSS during server rendering and injects it into
// the HTML stream, so the first paint already has styles (no FOUC) and the
// client takes over without re-generating them.
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [styleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styleSheet.getStyleElement();
    styleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styleSheet.instance}>{children}</StyleSheetManager>
  );
}
