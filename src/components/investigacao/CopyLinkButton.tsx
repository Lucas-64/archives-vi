"use client";

import { useState } from "react";
import styled from "styled-components";

import { Button } from "../ui/Button";

type Estado = "inicial" | "copiado" | "erro";

// Copies the current page URL to the clipboard. Nothing is stored.
export function CopyLinkButton() {
  const [estado, setEstado] = useState<Estado>("inicial");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setEstado("copiado");
    } catch {
      setEstado("erro");
    }
  }

  const mensagem =
    estado === "copiado"
      ? "Link copiado."
      : estado === "erro"
        ? "Não foi possível copiar o link."
        : "";

  return (
    <Wrapper>
      <Button type="button" variant="outline" size="small" onClick={copiar}>
        Copiar link
      </Button>
      <Feedback role="status" aria-live="polite">
        {mensagem}
      </Feedback>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
`;

const Feedback = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
