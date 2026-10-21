"use client";

import { Container } from "../../components/layout/Container";
import { ErrorState } from "../../components/states/ErrorState";

// Limite de erro das rotas de detalhe. `reset` renderiza o segmento de novo.
export default function DetalheError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <ErrorState onRetry={reset} />
    </Container>
  );
}
