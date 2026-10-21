import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ErroApi } from "./erros";
import {
  LIMITE_MAXIMO,
  LIMITE_PADRAO,
  codificarCursor,
  decodificarCursor,
  fatiarPagina,
  lerPaginacao,
  paginar,
} from "./paginacao";

function erroDe(fn: () => unknown): ErroApi {
  try {
    fn();
  } catch (erro) {
    expect(erro).toBeInstanceOf(ErroApi);
    return erro as ErroApi;
  }
  throw new Error("Era esperado um ErroApi.");
}

describe("lerPaginacao", () => {
  it("usa limite 20 e sem cursor por padrão", () => {
    expect(lerPaginacao("http://localhost/x")).toEqual({ limite: LIMITE_PADRAO });
    expect(LIMITE_PADRAO).toBe(20);
  });

  it("lê limite e cursor", () => {
    expect(lerPaginacao("http://localhost/x?limite=5&cursor=abc")).toEqual({ limite: 5, cursor: "abc" });
  });

  it("aceita o máximo (50) e rejeita 51 com 422, sem truncar", () => {
    expect(lerPaginacao(`http://localhost/x?limite=${LIMITE_MAXIMO}`).limite).toBe(50);
    const erro = erroDe(() => lerPaginacao("http://localhost/x?limite=51"));
    expect(erro.status).toBe(422);
    expect(erro.campos).toEqual({ limite: "O limite máximo é 50." });
  });

  it.each(["0", "-1", "1.5", "abc", ""])("rejeita limite %j", (valor) => {
    expect(erroDe(() => lerPaginacao(`http://localhost/x?limite=${valor}`)).status).toBe(422);
  });

  it("rejeita cursor vazio ou longo demais", () => {
    expect(erroDe(() => lerPaginacao("http://localhost/x?cursor=")).status).toBe(422);
    expect(erroDe(() => lerPaginacao(`http://localhost/x?cursor=${"a".repeat(513)}`)).status).toBe(422);
  });

  it("aceita um objeto URL", () => {
    expect(lerPaginacao(new URL("http://localhost/x?limite=3")).limite).toBe(3);
  });
});

describe("cursor", () => {
  const esquema = z.object({ data: z.string(), id: z.string() }).strict();

  it("ida e volta preserva o valor, incluindo acentos", () => {
    const valor = { data: "2026-10-20", id: "análise-é" };
    const cursor = codificarCursor(valor);
    expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodificarCursor(cursor, esquema)).toEqual(valor);
  });

  it.each([
    ["texto que não é base64 de JSON", "isso nao e cursor"],
    ["base64 válido, mas JSON inválido", Buffer.from("{quebrado").toString("base64url")],
    ["JSON de formato errado", codificarCursor({ outro: 1 })],
    ["JSON adulterado com campo extra", codificarCursor({ data: "d", id: "i", papel: "admin" })],
  ])("cursor adulterado (%s) devolve 400", (_descricao, cursor) => {
    const erro = erroDe(() => decodificarCursor(cursor, esquema));
    expect(erro.codigo).toBe("requisicao_invalida");
    expect(erro.status).toBe(400);
    expect(erro.message).toBe("Cursor inválido.");
  });
});

describe("paginar e fatiarPagina", () => {
  it("paginar monta { itens, proximoCursor }", () => {
    expect(paginar([1, 2], null)).toEqual({ itens: [1, 2], proximoCursor: null });
  });

  it("sem sobra, não há próxima página", () => {
    expect(fatiarPagina([{ id: "a" }, { id: "b" }], 2, (x) => x)).toEqual({
      itens: [{ id: "a" }, { id: "b" }],
      proximoCursor: null,
    });
  });

  it("com sobra, corta no limite e gera o cursor da última linha devolvida", () => {
    const pagina = fatiarPagina([{ id: "a" }, { id: "b" }, { id: "c" }], 2, (ultima) => ({ id: ultima.id }));
    expect(pagina.itens).toEqual([{ id: "a" }, { id: "b" }]);
    expect(decodificarCursor(pagina.proximoCursor as string, z.object({ id: z.string() }))).toEqual({ id: "b" });
  });

  it("lista vazia", () => {
    expect(fatiarPagina([], 20, (x) => x)).toEqual({ itens: [], proximoCursor: null });
  });
});
