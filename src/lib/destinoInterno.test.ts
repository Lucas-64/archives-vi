import { describe, expect, it } from "vitest";

import { destinoInternoSeguro } from "./destinoInterno";

describe("destinoInternoSeguro", () => {
  it("aceita caminhos internos", () => {
    expect(destinoInternoSeguro("/publicacoes/investigacao/ovnis-em-saint-dennis")).toBe("/publicacoes/investigacao/ovnis-em-saint-dennis");
    expect(destinoInternoSeguro("/buscar?q=ovnis&tipo=misterios")).toBe("/buscar?q=ovnis&tipo=misterios");
    expect(destinoInternoSeguro("/investigacoes/x#evidencias")).toBe("/investigacoes/x#evidencias");
  });

  it("recusa endereços externos e formas enganosas", () => {
    for (const ruim of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "\\evil.com",
      "javascript:alert(1)",
      "evil.com",
      "/ok\nLocation: x",
      "/a b",
      "",
    ]) {
      expect(destinoInternoSeguro(ruim)).toBe("/");
    }
    expect(destinoInternoSeguro(undefined)).toBe("/");
    expect(destinoInternoSeguro(null, "/inicio")).toBe("/inicio");
    expect(destinoInternoSeguro(`/${"a".repeat(400)}`)).toBe("/");
  });

  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(destinoInternoSeguro(["/a", "https://evil.com"])).toBe("/a");
    expect(destinoInternoSeguro(["https://evil.com", "/a"])).toBe("/");
  });
});
