import { describe, expect, it } from "vitest";

import { IMAGEM_PADRAO_INVESTIGACAO, imagemDaInvestigacao } from "./imagemPadraoInvestigacao";

describe("imagemDaInvestigacao", () => {
  it("usa a imagem padrão quando não há imagem enviada", () => {
    expect(imagemDaInvestigacao(undefined)).toBe(IMAGEM_PADRAO_INVESTIGACAO);
    expect(imagemDaInvestigacao(null)).toBe(IMAGEM_PADRAO_INVESTIGACAO);
    expect(imagemDaInvestigacao("")).toBe(IMAGEM_PADRAO_INVESTIGACAO);
    expect(imagemDaInvestigacao("   ")).toBe(IMAGEM_PADRAO_INVESTIGACAO);
  });

  it("mostra a imagem enviada, sem espaços nas pontas", () => {
    expect(imagemDaInvestigacao("  https://exemplo.com/capa.jpg ")).toBe("https://exemplo.com/capa.jpg");
  });

  it("mantém uma imagem local (mock) quando ela existe", () => {
    expect(imagemDaInvestigacao(IMAGEM_PADRAO_INVESTIGACAO)).toBe(IMAGEM_PADRAO_INVESTIGACAO);
  });
});
