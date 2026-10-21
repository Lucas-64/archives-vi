import { afterEach, describe, expect, it, vi } from "vitest";

import {
  alterarCurtidaNaApi,
  criarComentarioNaApi,
  criarPublicacaoNaApi,
  listarComentariosNaApi,
  MENSAGEM_INDISPONIVEL,
} from "./publicacoesApi";

function responder(status: number, corpo: unknown, cabecalhos: Record<string, string> = {}) {
  const fetchFalso = vi.fn().mockResolvedValue(new Response(corpo === undefined ? null : JSON.stringify(corpo), { status, headers: cabecalhos }));
  vi.stubGlobal("fetch", fetchFalso);
  return fetchFalso;
}

afterEach(() => vi.unstubAllGlobals());

const erro = (codigo: string, mensagem: string, campos?: Record<string, string>) => ({ erro: { codigo, mensagem, campos } });
const comentario = { id: "c1", texto: "Oi", autor: { nome: "Ana", usuario: "ana_s" }, criadoEm: "2026-10-21T10:00:00.000Z" };

describe("criarPublicacaoNaApi", () => {
  it("201 devolve o slug confirmado pelo servidor e envia o cabeçalho de CSRF", async () => {
    const f = responder(201, { slug: "minha-teoria", titulo: "Minha teoria" });
    const r = await criarPublicacaoNaApi({ titulo: "Minha teoria", corpo: "x".repeat(30) });
    expect(r).toEqual({ ok: true, slug: "minha-teoria" });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("/api/v1/publicacoes");
    expect(init.method).toBe("POST");
    expect(init.headers["X-Requested-With"]).toBe("archives-vi");
  });

  it("422 mapeia titulo e corpo para os campos", async () => {
    responder(422, erro("validacao", "Revise.", { titulo: "Curto.", corpo: "Curto." }));
    const r = await criarPublicacaoNaApi({ titulo: "a", corpo: "b" });
    expect(r).toEqual({ ok: false, campos: { titulo: "Curto.", corpo: "Curto." }, erroGeral: undefined, semSessao: false });
  });

  it("401 marca semSessao e não é sucesso", async () => {
    responder(401, erro("nao_autenticado", "Entre para continuar."));
    expect(await criarPublicacaoNaApi({ titulo: "abc", corpo: "x".repeat(30) })).toMatchObject({ ok: false, semSessao: true });
  });

  it("429 informa a espera", async () => {
    responder(429, erro("limite_excedido", "x"), { "Retry-After": "30" });
    expect(await criarPublicacaoNaApi({ titulo: "abc", corpo: "x".repeat(30) })).toMatchObject({ ok: false, erroGeral: "Muitas tentativas. Tente novamente em 30 segundos." });
  });

  it("500 e falha de rede dão mensagem genérica, nunca sucesso", async () => {
    responder(500, erro("interno", "boom"));
    expect(await criarPublicacaoNaApi({ titulo: "abc", corpo: "x".repeat(30) })).toMatchObject({ ok: false, erroGeral: MENSAGEM_INDISPONIVEL });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect(await criarPublicacaoNaApi({ titulo: "abc", corpo: "x".repeat(30) })).toMatchObject({ ok: false, erroGeral: MENSAGEM_INDISPONIVEL });
  });

  it("2xx sem slug é tratado como falha (não se declara sucesso sem confirmação)", async () => {
    responder(201, { qualquer: "coisa" });
    expect(await criarPublicacaoNaApi({ titulo: "abc", corpo: "x".repeat(30) })).toMatchObject({ ok: false });
  });
});

describe("comentários", () => {
  it("cria com o alvo no formato do contrato e devolve o comentário gravado", async () => {
    const f = responder(201, comentario);
    const r = await criarComentarioNaApi("minha-teoria", "Oi");
    expect(r).toEqual({ ok: true, comentario });
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ alvo: "publicacao:minha-teoria", texto: "Oi" });
  });

  it("422 do texto vai para o campo", async () => {
    responder(422, erro("validacao", "Revise.", { texto: "Escreva o comentário." }));
    expect(await criarComentarioNaApi("x", " ")).toMatchObject({ ok: false, campos: { texto: "Escreva o comentário." } });
  });

  it("lista a próxima página com o cursor", async () => {
    const f = responder(200, { itens: [comentario], proximoCursor: null });
    const r = await listarComentariosNaApi("minha-teoria", "abc_-");
    expect(r).toEqual({ ok: true, comentarios: [comentario], proximoCursor: null });
    expect(f.mock.calls[0][0]).toBe("/api/v1/comentarios?alvo=publicacao%3Aminha-teoria&cursor=abc_-");
    expect(f.mock.calls[0][1].headers).toBeUndefined();
  });

  it("página malformada é falha", async () => {
    responder(200, { itens: [{ id: 1 }] });
    expect(await listarComentariosNaApi("x", "c")).toMatchObject({ ok: false });
  });
});

describe("alterarCurtidaNaApi", () => {
  it("PUT curte e DELETE descurte; devolve o estado do servidor", async () => {
    let f = responder(200, { curtidas: 4, euCurti: true });
    expect(await alterarCurtidaNaApi("minha-teoria", true)).toEqual({ ok: true, curtidas: 4, euCurti: true });
    expect(f.mock.calls[0][1].method).toBe("PUT");
    f = responder(200, { curtidas: 3, euCurti: false });
    expect(await alterarCurtidaNaApi("minha-teoria", false)).toEqual({ ok: true, curtidas: 3, euCurti: false });
    expect(f.mock.calls[0][1].method).toBe("DELETE");
  });

  it("401 e 404 não viram sucesso", async () => {
    responder(401, erro("nao_autenticado", "Entre para continuar."));
    expect(await alterarCurtidaNaApi("x", true)).toMatchObject({ ok: false, semSessao: true });
    responder(404, erro("nao_encontrado", "Publicação não encontrada."));
    expect(await alterarCurtidaNaApi("x", true)).toMatchObject({ ok: false, semSessao: false, erroGeral: "Publicação não encontrada." });
  });
});
