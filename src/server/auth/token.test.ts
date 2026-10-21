import { describe, expect, it } from "vitest";

import { gerarToken, hashToken, tokenComFormatoValido } from "./token";

describe("token de sessão", () => {
  it("tem 43 caracteres base64url (32 bytes) e não se repete", () => {
    const tokens = new Set(Array.from({ length: 200 }, gerarToken));
    expect(tokens.size).toBe(200);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("o hash é SHA-256 em hexadecimal, determinístico e diferente do token", () => {
    const token = gerarToken();
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
    expect(hashToken(gerarToken())).not.toBe(hashToken(token));
  });

  it("valida o formato antes de consultar o banco", () => {
    expect(tokenComFormatoValido(gerarToken())).toBe(true);
    for (const ruim of ["", "curto", "x".repeat(44), `${"a".repeat(42)}=`, "a b".padEnd(43, "c")]) {
      expect(tokenComFormatoValido(ruim)).toBe(false);
    }
  });
});
