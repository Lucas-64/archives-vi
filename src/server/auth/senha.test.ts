import { describe, expect, it } from "vitest";

import { PARAMETROS_PADRAO, SENHA_MAXIMA, hashSenha, precisaRehash, verificarSenha } from "./senha";

const BARATO = { N: 1024, r: 8, p: 1 };

describe("senha (scrypt)", () => {
  it("gera hash no formato scrypt$N$r$p$sal$hash sem conter a senha", async () => {
    const hash = await hashSenha("uma senha secreta", BARATO);
    const partes = hash.split("$");
    expect(partes).toHaveLength(6);
    expect(partes.slice(0, 4)).toEqual(["scrypt", "1024", "8", "1"]);
    expect(Buffer.from(partes[4], "base64")).toHaveLength(16);
    expect(Buffer.from(partes[5], "base64")).toHaveLength(64);
    expect(hash).not.toContain("uma senha secreta");
  });

  it("usa sal aleatório: a mesma senha gera hashes diferentes, ambos válidos", async () => {
    const a = await hashSenha("mesma-senha", BARATO);
    const b = await hashSenha("mesma-senha", BARATO);
    expect(a).not.toBe(b);
    expect(await verificarSenha("mesma-senha", a)).toBe(true);
    expect(await verificarSenha("mesma-senha", b)).toBe(true);
  });

  it("rejeita senha errada, vazia e com diferença de maiúscula", async () => {
    const hash = await hashSenha("Correta123", BARATO);
    expect(await verificarSenha("correta123", hash)).toBe(false);
    expect(await verificarSenha("", hash)).toBe(false);
    expect(await verificarSenha("Correta1234", hash)).toBe(false);
  });

  it("não lança com hash ilegível e responde falso", async () => {
    for (const ruim of ["", "texto", "scrypt$a$b$c$d$e", "argon2$1$2$3$4$5", "scrypt$1024$8$1$$"]) {
      expect(await verificarSenha("x", ruim)).toBe(false);
    }
  });

  it("recusa senha acima do tamanho máximo sem gastar scrypt", async () => {
    const hash = await hashSenha("curta-demais-ok", BARATO);
    expect(await verificarSenha("a".repeat(SENHA_MAXIMA + 1), hash)).toBe(false);
  });

  it("aceita senha com espaços, acentos e emoji", async () => {
    const senha = "  açaí ✓ com espaços  ";
    const hash = await hashSenha(senha, BARATO);
    expect(await verificarSenha(senha, hash)).toBe(true);
    expect(await verificarSenha(senha.trim(), hash)).toBe(false);
  });

  it("os parâmetros padrão são os documentados (N=2^15, r=8, p=3) e ficam no hash", async () => {
    expect(PARAMETROS_PADRAO).toEqual({ N: 32768, r: 8, p: 3 });
    const hash = await hashSenha("senha-padrao-1", PARAMETROS_PADRAO);
    expect(hash.startsWith("scrypt$32768$8$3$")).toBe(true);
    expect(await verificarSenha("senha-padrao-1", hash)).toBe(true);
    expect(precisaRehash(hash)).toBe(false);
  });

  it("precisaRehash indica parâmetros diferentes ou hash ilegível", async () => {
    const hash = await hashSenha("qualquer-senha", BARATO);
    expect(precisaRehash(hash)).toBe(true);
    expect(precisaRehash(hash, BARATO)).toBe(false);
    expect(precisaRehash("lixo")).toBe(true);
  });
});
