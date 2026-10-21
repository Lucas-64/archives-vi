import { describe, expect, it } from "vitest";

import { interpretarErro } from "./autenticacaoApi";

const CAMPOS = ["usuario", "email", "senha"] as const;
const erro = (codigo: string, mensagem: string, campos?: Record<string, string>) => ({ erro: { codigo, mensagem, campos } });

describe("interpretarErro", () => {
  it("422 com campos: mensagem em cada campo, sem erro geral", () => {
    const r = interpretarErro(422, erro("validacao", "Revise os campos destacados.", { email: "E-mail inválido.", senha: "Muito curta." }), null, CAMPOS);
    expect(r).toEqual({ ok: false, campos: { email: "E-mail inválido.", senha: "Muito curta." } });
  });

  it("campo desconhecido vira mensagem geral (nada é descartado)", () => {
    const r = interpretarErro(422, erro("validacao", "Revise.", { _: "Informe ao menos um campo." }), null, CAMPOS);
    expect(r).toEqual({ ok: false, campos: {}, erroGeral: "Informe ao menos um campo." });
  });

  it("401 usa a mensagem do servidor como erro geral", () => {
    const r = interpretarErro(401, erro("nao_autenticado", "E-mail ou senha incorretos."), null, CAMPOS);
    expect(r).toEqual({ ok: false, campos: {}, erroGeral: "E-mail ou senha incorretos." });
  });

  it("409 por usuário aparece no campo; 409 genérico aparece como erro geral", () => {
    expect(interpretarErro(409, erro("conflito", "Conflito.", { usuario: "Esse nome já está em uso." }), null, CAMPOS)).toEqual({
      ok: false,
      campos: { usuario: "Esse nome já está em uso." },
    });
    expect(interpretarErro(409, erro("conflito", "Não foi possível criar a conta com esses dados."), null, CAMPOS)).toEqual({
      ok: false,
      campos: {},
      erroGeral: "Não foi possível criar a conta com esses dados.",
    });
  });

  it("429 informa a espera do Retry-After", () => {
    expect(interpretarErro(429, erro("limite_excedido", "x"), "42", CAMPOS)).toEqual({ ok: false, campos: {}, erroGeral: "Muitas tentativas. Tente novamente em 42 segundos." });
    expect(interpretarErro(429, null, null, CAMPOS)).toMatchObject({ erroGeral: "Muitas tentativas. Tente novamente em instantes." });
  });

  it("500, corpo ausente ou inválido: mensagem de indisponibilidade, sem vazar detalhes", () => {
    for (const [status, corpo] of [[500, erro("interno", "stack secreto")], [502, null], [400, "texto"], [403, {}]] as const) {
      const r = interpretarErro(status, corpo, null, CAMPOS);
      expect(r.ok).toBe(false);
      expect(r.ok === false && r.erroGeral).toContain("Não foi possível concluir agora");
      expect(JSON.stringify(r)).not.toContain("secreto");
    }
  });
});
