import { describe, expect, it } from "vitest";

import { ErroConfiguracao, lerEnv } from "./env";

const URL_VALIDA = "postgresql://archives:segredo-de-teste@127.0.0.1:5433/archives_vi_dev";

describe("lerEnv", () => {
  it("aceita uma configuração válida e aplica o padrão de NODE_ENV", () => {
    const env = lerEnv({ DATABASE_URL: URL_VALIDA });
    expect(env.DATABASE_URL).toBe(URL_VALIDA);
    expect(env.NODE_ENV).toBe("development");
  });

  it("aceita o esquema postgres://", () => {
    expect(lerEnv({ DATABASE_URL: "postgres://u:p@127.0.0.1:5432/db" }).DATABASE_URL).toContain("postgres://");
  });

  it("falha cedo quando DATABASE_URL não existe, apontando a variável", () => {
    expect(() => lerEnv({})).toThrow(ErroConfiguracao);
    try {
      lerEnv({});
    } catch (erro) {
      expect((erro as ErroConfiguracao).problemas).toHaveProperty("DATABASE_URL");
      expect((erro as Error).message).toContain(".env.example");
    }
  });

  it("rejeita URL que não é de PostgreSQL", () => {
    expect(() => lerEnv({ DATABASE_URL: "mysql://x" })).toThrow(ErroConfiguracao);
  });

  it("rejeita NODE_ENV desconhecido", () => {
    expect(() => lerEnv({ DATABASE_URL: URL_VALIDA, NODE_ENV: "staging" })).toThrow(ErroConfiguracao);
  });

  it("nunca coloca o valor da URL (que pode ter senha) na mensagem de erro", () => {
    try {
      lerEnv({ DATABASE_URL: "mysql://u:segredo-de-teste@host/db" });
      expect.unreachable();
    } catch (erro) {
      expect((erro as Error).message).not.toContain("segredo-de-teste");
    }
  });
});
