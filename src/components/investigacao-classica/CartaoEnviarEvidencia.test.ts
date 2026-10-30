import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "../../styles/theme";
import { CartaoEnviarEvidencia } from "./CartaoEnviarEvidencia";

vi.mock("next/navigation", () => ({ usePathname: () => "/publicacoes/investigacao/ovnis-em-saint-dennis" }));

function renderizar(podeEnviar: boolean) {
  const formulario = createElement("form", { "aria-label": "Formulario de teste" }, "campos do formulario");
  return renderToStaticMarkup(
    createElement(ThemeProvider, { theme }, createElement(CartaoEnviarEvidencia, { podeEnviar } as ComponentProps<typeof CartaoEnviarEvidencia>, formulario)),
  );
}

describe("CartaoEnviarEvidencia", () => {
  it("logado: começa fechado, com botão e sem o formulário no DOM", () => {
    const html = renderizar(true);
    expect(html).toContain("Enviar evidência");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toMatch(/aria-controls="[^"]+"/);
    expect(html).toContain("hidden");
    expect(html).not.toContain("campos do formulario");
  });

  it("visitante: vê o cartão com link para entrar e voltar à investigação, sem formulário nem botão de abrir", () => {
    const html = renderizar(false);
    expect(html).toContain("Enviar evidências exige conta.");
    expect(html).toContain(
      'href="/entrar?voltar=%2Fpublicacoes%2Finvestigacao%2Fovnis-em-saint-dennis"',
    );
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain("campos do formulario");
  });
});
