import { describe, expect, it } from "vitest";

import { ErroApi, MENSAGEM_PADRAO, STATUS_POR_CODIGO, type CodigoErro } from "./erros";

describe("ErroApi", () => {
  it.each([
    ["requisicao_invalida", 400],
    ["nao_autenticado", 401],
    ["sem_permissao", 403],
    ["nao_encontrado", 404],
    ["conflito", 409],
    ["corpo_grande", 413],
    ["arquivo_grande", 413],
    ["tipo_nao_suportado", 415],
    ["validacao", 422],
    ["limite_excedido", 429],
    ["erro_interno", 500],
  ] as const)("%s responde %i", (codigo, status) => {
    expect(new ErroApi(codigo).status).toBe(status);
  });

  it("tem mensagem padrão em português para todo código", () => {
    for (const codigo of Object.keys(STATUS_POR_CODIGO) as CodigoErro[]) {
      expect(MENSAGEM_PADRAO[codigo].length).toBeGreaterThan(5);
      expect(new ErroApi(codigo).message).toBe(MENSAGEM_PADRAO[codigo]);
    }
  });

  it("aceita mensagem própria, campos e retryAfter", () => {
    const erro = new ErroApi("limite_excedido", "Calma.", { retryAfter: 30, campos: { a: "b" } });
    expect(erro.message).toBe("Calma.");
    expect(erro.retryAfter).toBe(30);
    expect(erro.campos).toEqual({ a: "b" });
  });
});
