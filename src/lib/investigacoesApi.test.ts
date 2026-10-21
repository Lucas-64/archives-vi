import { afterEach, describe, expect, it, vi } from "vitest";

import { criarInvestigacaoNaApi, decidirSugestaoNaApi, enviarEvidenciaNaApi } from "./investigacoesApi";
import { MENSAGEM_INDISPONIVEL } from "./publicacoesApi";

function responder(status: number, corpo: unknown, cabecalhos: Record<string, string> = {}) {
  const f = vi.fn().mockResolvedValue(new Response(corpo === undefined ? null : JSON.stringify(corpo), { status, headers: cabecalhos }));
  vi.stubGlobal("fetch", f);
  return f;
}
afterEach(() => vi.unstubAllGlobals());
const erro = (codigo: string, mensagem: string, campos?: Record<string, string>) => ({ erro: { codigo, mensagem, campos } });
const dados = { origem: "referencia_textual", titulo: "Título", descricao: "Descrição longa o bastante." } as const;

describe("enviarEvidenciaNaApi", () => {
  it("201 pendente: devolve o status confirmado pelo servidor e envia só os campos do contrato", async () => {
    const f = responder(201, { id: "e1", status: "pendente" });
    expect(await enviarEvidenciaNaApi("minha-inv", dados)).toEqual({ ok: true, status: "pendente" });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("/api/v1/investigacoes/minha-inv/evidencias");
    expect(init.headers["X-Requested-With"]).toBe("archives-vi");
    expect(JSON.parse(init.body)).toEqual(dados);
  });

  it("201 aceita (responsável): o status vem do servidor, não é presumido", async () => {
    responder(201, { id: "e1", status: "aceita" });
    expect(await enviarEvidenciaNaApi("x", dados)).toEqual({ ok: true, status: "aceita" });
  });

  it("422 mapeia os campos; 409 do teto de pendentes vira erro geral", async () => {
    responder(422, erro("validacao", "Revise.", { titulo: "Curto.", descricao: "Curta." }));
    expect(await enviarEvidenciaNaApi("x", dados)).toMatchObject({ ok: false, campos: { titulo: "Curto.", descricao: "Curta." } });
    responder(409, erro("conflito", "Você já tem 10 sugestões pendentes nesta investigação."));
    expect(await enviarEvidenciaNaApi("x", dados)).toMatchObject({ ok: false, erroGeral: "Você já tem 10 sugestões pendentes nesta investigação." });
  });

  it("401 marca semSessao; falha de rede e resposta sem status não são sucesso", async () => {
    responder(401, erro("nao_autenticado", "Entre para continuar."));
    expect(await enviarEvidenciaNaApi("x", dados)).toMatchObject({ ok: false, semSessao: true });
    responder(201, { id: "e1" });
    expect(await enviarEvidenciaNaApi("x", dados)).toMatchObject({ ok: false });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect(await enviarEvidenciaNaApi("x", dados)).toMatchObject({ ok: false, erroGeral: MENSAGEM_INDISPONIVEL });
  });
});

describe("decidirSugestaoNaApi", () => {
  it("aceitar chama a rota de aceitar sem corpo e devolve o status do servidor", async () => {
    const f = responder(200, { status: "aceita" });
    expect(await decidirSugestaoNaApi("minha-inv", "id-1", "aceitar")).toEqual({ ok: true, status: "aceita" });
    expect(f.mock.calls[0][0]).toBe("/api/v1/investigacoes/minha-inv/sugestoes/id-1/aceitar");
    expect(f.mock.calls[0][1].body).toBeUndefined();
  });

  it("recusar envia o motivo quando há um", async () => {
    const f = responder(200, { status: "recusada" });
    expect(await decidirSugestaoNaApi("x", "i", "recusar", "Sem fonte.")).toEqual({ ok: true, status: "recusada" });
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ motivo: "Sem fonte." });
  });

  it("403 (sem permissão) e 409 (decisão contrária) mostram a mensagem do servidor", async () => {
    responder(403, erro("sem_permissao", "Só o responsável ou a moderação podem analisar sugestões."));
    expect(await decidirSugestaoNaApi("x", "i", "aceitar")).toMatchObject({ ok: false, erroGeral: "Só o responsável ou a moderação podem analisar sugestões.", semSessao: false });
    responder(409, erro("conflito", "Esta sugestão já foi decidida."));
    expect(await decidirSugestaoNaApi("x", "i", "recusar")).toMatchObject({ ok: false, erroGeral: "Esta sugestão já foi decidida." });
  });
});

describe("criarInvestigacaoNaApi", () => {
  const entrada = {
    titulo: "Minha investigação",
    descricao: "Descrição com mais de vinte caracteres.",
    categoria: "symbol",
    tags: [],
    teoria: { hipotese: "Hipótese com mais de vinte caracteres.", argumentosFavoraveis: [], perguntaCentral: "Pergunta?", fontes: [] },
  };

  it("201: só há sucesso com o slug devolvido pelo servidor; envia o corpo do contrato por POST", async () => {
    const f = responder(201, { slug: "minha-investigacao", titulo: "Minha investigação" });
    expect(await criarInvestigacaoNaApi(entrada)).toEqual({ ok: true, slug: "minha-investigacao" });
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("/api/v1/investigacoes");
    expect(init.method).toBe("POST");
    expect(init.headers["X-Requested-With"]).toBe("archives-vi");
    expect(JSON.parse(init.body)).toEqual(entrada);
  });

  it("201 sem slug não é sucesso", async () => {
    responder(201, { titulo: "x" });
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, erroGeral: MENSAGEM_INDISPONIVEL });
  });

  it("422: campos aninhados e itens de lista ficam no campo; chaves desconhecidas viram erro geral", async () => {
    responder(
      422,
      erro("validacao", "Revise.", {
        titulo: "Curto.",
        "teoria.hipotese": "Curta.",
        "teoria.fontes.2": "Informe a fonte.",
        "video.url": "Use um link de vídeo do YouTube.",
      }),
    );
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({
      ok: false,
      campos: {
        titulo: "Curto.",
        "teoria.hipotese": "Curta.",
        "teoria.fontes.2": "Informe a fonte.",
        "video.url": "Use um link de vídeo do YouTube.",
      },
    });
    responder(422, erro("validacao", "Revise.", { "tags.1": "Tema desconhecido." }));
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, campos: {}, erroGeral: "Tema desconhecido." });
  });

  it("409 (limite de abertas), 429, 401 e 403 mostram a decisão do servidor", async () => {
    responder(409, erro("conflito", "Você já tem 3 investigações abertas. Encerre uma para abrir outra."));
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, erroGeral: "Você já tem 3 investigações abertas. Encerre uma para abrir outra." });
    responder(429, erro("limite_excedido", "Muitas."), { "Retry-After": "30" });
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, erroGeral: expect.stringContaining("30 segundos") });
    responder(401, erro("nao_autenticado", "Entre para continuar."));
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, semSessao: true });
    responder(403, erro("sem_permissao", "Sem permissão."));
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, erroGeral: "Sem permissão.", semSessao: false });
  });

  it("5xx e falha de rede mostram mensagem genérica, sem sucesso", async () => {
    responder(500, erro("interno", "detalhe interno"));
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, erroGeral: MENSAGEM_INDISPONIVEL });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("falha")));
    expect(await criarInvestigacaoNaApi(entrada)).toMatchObject({ ok: false, erroGeral: MENSAGEM_INDISPONIVEL });
  });
});
