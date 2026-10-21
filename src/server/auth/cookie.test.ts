import { describe, expect, it } from "vitest";

import { configuracaoCookie, cookieApagado, cookieDeSessao, lerTokenDoCookie } from "./cookie";

const AGORA = new Date("2026-10-20T12:00:00Z");
const EXPIRA = new Date("2027-01-18T12:00:00Z"); // 90 dias

describe("cookie de sessão", () => {
  it("em desenvolvimento: HttpOnly, SameSite=Lax, Path=/, expiração explícita e sem Secure", () => {
    const cookie = cookieDeSessao(configuracaoCookie(false), "tok", EXPIRA, AGORA);
    expect(cookie).toMatch(/^sessao=tok; /);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${90 * 24 * 3600}`);
    expect(cookie).toContain(`Expires=${EXPIRA.toUTCString()}`);
    expect(cookie).not.toContain("Secure");
    expect(cookie).not.toContain("Domain");
  });

  it("em produção: prefixo __Host- e Secure", () => {
    const cookie = cookieDeSessao(configuracaoCookie(true), "tok", EXPIRA, AGORA);
    expect(cookie).toMatch(/^__Host-sessao=tok; /);
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).not.toContain("Domain");
  });

  it("nunca produz Max-Age negativo", () => {
    expect(cookieDeSessao(configuracaoCookie(false), "t", AGORA, EXPIRA)).toContain("Max-Age=0");
  });

  it("o cookie apagado expira no passado, com os mesmos atributos", () => {
    const cookie = cookieApagado(configuracaoCookie(true));
    expect(cookie).toMatch(/^__Host-sessao=; /);
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("Expires=Thu, 01 Jan 1970");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
  });

  it("lê o token entre vários cookies e ignora cookie de outro nome", () => {
    const config = configuracaoCookie(false);
    expect(lerTokenDoCookie("a=1; sessao=abc123; b=2", config)).toBe("abc123");
    expect(lerTokenDoCookie("outra_sessao=zzz; b=2", config)).toBeNull();
    expect(lerTokenDoCookie("sessao=", config)).toBeNull();
    expect(lerTokenDoCookie(null, config)).toBeNull();
    expect(lerTokenDoCookie("sessao=abc", configuracaoCookie(true))).toBeNull();
  });
});
