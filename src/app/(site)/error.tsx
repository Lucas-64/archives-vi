"use client";

import { Container } from "../../components/layout/Container";
import { ErrorState } from "../../components/states/ErrorState";

// Error boundary for the public shell. `reset` re-renders the segment.
export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <ErrorState onRetry={reset} />
    </Container>
  );
}
