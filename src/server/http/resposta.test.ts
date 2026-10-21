import { describe, expect, it, vi } from "vitest";

import { ErroApi } from "./erros";
import { criado, envolver, erroParaResposta, gerarIdRequisicao, json, semConteudo } from "./resposta";

describe("respostas", () => {
  it("json devolve corpo, status e content-type", async () => {
    const resposta = json({ ok: true }, 200);
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toContain("application/json");
    expect(await resposta.json()).toEqual({ ok: true });
  });

  it("criado devolve 201 com Location", () => {
    const resposta = criado({ id: "1" }, "/api/v1/x/1");
    expect(resposta.status).toBe(201);
    expect(resposta.headers.get("location")).toBe("/api/v1/x/1");
  });

  it("semConteudo devolve 204 sem corpo", async () => {
    const resposta = semConteudo();
    expect(resposta.status).toBe(204);
    expect(await resposta.text()).toBe("");
  });

  it("gerarIdRequisicao tem o prefixo req_ e é único", () => {
    const a = gerarIdRequisicao();
    expect(a).toMatch(/^req_[0-9a-f-]{36}$/);
    expect(gerarIdRequisicao()).not.toBe(a);
  });
});

describe("erroParaResposta", () => {
  it("usa exatamente o formato { erro: { codigo, mensagem, campos?, idRequisicao } }", async () => {
    const erro = new ErroApi("validacao", undefined, { campos: { titulo: "Informe um título." } });
    const resposta = erroParaResposta(erro, "req_teste");
    expect(resposta.status).toBe(422);
    expect(resposta.headers.get("x-request-id")).toBe("req_teste");
    expect(await resposta.json()).toEqual({
      erro: {
        codigo: "validacao",
        mensagem: "Revise os campos destacados.",
        campos: { titulo: "Informe um título." },
        idRequisicao: "req_teste",
      },
    });
  });

  it("omite `campos` quando não há", async () => {
    const corpo = await erroParaResposta(new ErroApi("nao_encontrado"), "req_1").json();
    expect(corpo.erro).not.toHaveProperty("campos");
  });

  it("limite_excedido inclui Retry-After; os demais não", () => {
    const limite = erroParaResposta(new ErroApi("limite_excedido", undefined, { retryAfter: 12.2 }), "req_1");
    expect(limite.status).toBe(429);
    expect(limite.headers.get("retry-after")).toBe("13");
    expect(erroParaResposta(new ErroApi("conflito"), "req_1").headers.has("retry-after")).toBe(false);
  });

  it("erro desconhecido vira 500 genérico, sem stack nem a mensagem original", async () => {
    const registrar = vi.fn();
    const original = new Error("senha=hunter2 na conexão postgres://u:p@host");
    const resposta = erroParaResposta(original, "req_9", registrar);
    const texto = await resposta.text();

    expect(resposta.status).toBe(500);
    expect(JSON.parse(texto).erro).toEqual({
      codigo: "erro_interno",
      mensagem: "Algo deu errado. Tente novamente.",
      idRequisicao: "req_9",
    });
    expect(texto).not.toContain("hunter2");
    expect(texto).not.toContain("stack");
    expect(texto).not.toContain(" at ");
    expect(registrar).toHaveBeenCalledWith({ idRequisicao: "req_9", nome: "Error", mensagem: original.message });
  });

  it("não registra erros conhecidos", () => {
    const registrar = vi.fn();
    erroParaResposta(new ErroApi("nao_autenticado"), "req_1", registrar);
    expect(registrar).not.toHaveBeenCalled();
  });

  it("aceita valores que não são Error", async () => {
    const resposta = erroParaResposta("texto solto", "req_1", vi.fn());
    expect(resposta.status).toBe(500);
  });
});

describe("envolver", () => {
  it("devolve a resposta do manipulador com X-Request-Id", async () => {
    const rota = envolver(async () => json({ ok: 1 }));
    const resposta = await rota(new Request("http://localhost/x"), undefined);
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("x-request-id")).toMatch(/^req_/);
  });

  it("converte ErroApi lançado no formato padrão, com o mesmo id da resposta", async () => {
    const rota = envolver(() => {
      throw new ErroApi("sem_permissao");
    });
    const resposta = await rota(new Request("http://localhost/x"), undefined);
    const corpo = await resposta.json();
    expect(resposta.status).toBe(403);
    expect(corpo.erro.idRequisicao).toBe(resposta.headers.get("x-request-id"));
  });

  it("converte erro inesperado em 500 genérico", async () => {
    const registrar = vi.fn();
    const rota = envolver(async () => {
      throw new TypeError("quebrou por dentro");
    }, registrar);
    const resposta = await rota(new Request("http://localhost/x"), undefined);
    expect(resposta.status).toBe(500);
    expect(await resposta.text()).not.toContain("quebrou por dentro");
    expect(registrar).toHaveBeenCalledOnce();
  });
});
