import { afterEach, describe, expect, it, vi } from "vitest";

import { LIMITE_IMAGEM_BYTES, armazenamentoDeImagensDisponivel, enviarImagemNaApi, validarArquivoDeImagem } from "./uploadApi";

afterEach(() => vi.unstubAllGlobals());

function resposta(status: number, corpo: unknown) {
  return new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json" } });
}

const png = () => new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" });

describe("validarArquivoDeImagem", () => {
  it("aceita jpeg, png e webp até 5 MB", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(validarArquivoDeImagem({ type, size: 1000 })).toBeUndefined();
    }
    expect(validarArquivoDeImagem({ type: "image/png", size: LIMITE_IMAGEM_BYTES })).toBeUndefined();
  });

  it("recusa formato errado, vazio e acima de 5 MB", () => {
    expect(validarArquivoDeImagem({ type: "image/gif", size: 10 })).toBe("Use uma imagem JPEG, PNG ou WebP.");
    expect(validarArquivoDeImagem({ type: "text/plain", size: 10 })).toBe("Use uma imagem JPEG, PNG ou WebP.");
    expect(validarArquivoDeImagem({ type: "image/png", size: 0 })).toBe("O arquivo está vazio.");
    expect(validarArquivoDeImagem({ type: "image/png", size: LIMITE_IMAGEM_BYTES + 1 })).toBe("A imagem pode ter no máximo 5 MB.");
  });
});

describe("enviarImagemNaApi", () => {
  it("201: devolve a URL e envia o arquivo com o cabeçalho de origem", async () => {
    const fetchSimulado = vi.fn().mockResolvedValue(resposta(201, { url: "https://x.public.blob.vercel-storage.com/imagens/a.png" }));
    vi.stubGlobal("fetch", fetchSimulado);
    expect(await enviarImagemNaApi(png())).toEqual({ ok: true, url: "https://x.public.blob.vercel-storage.com/imagens/a.png" });
    const [, init] = fetchSimulado.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["X-Requested-With"]).toBe("archives-vi");
    expect((init.body as FormData).get("arquivo")).toBeInstanceOf(File);
  });

  it("não chama a API com arquivo inválido", async () => {
    const fetchSimulado = vi.fn();
    vi.stubGlobal("fetch", fetchSimulado);
    const gif = new File([new Uint8Array([1])], "a.gif", { type: "image/gif" });
    expect(await enviarImagemNaApi(gif)).toEqual({ ok: false, erro: "Use uma imagem JPEG, PNG ou WebP." });
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("traduz 401, 413, 415 e 503 do servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta(401, { erro: { codigo: "nao_autenticado", mensagem: "Entre para continuar." } })));
    expect(await enviarImagemNaApi(png())).toMatchObject({ ok: false, semSessao: true });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta(413, { erro: { codigo: "arquivo_grande", mensagem: "A imagem pode ter no máximo 5 MB." } })));
    expect(await enviarImagemNaApi(png())).toEqual({ ok: false, erro: "A imagem pode ter no máximo 5 MB." });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta(415, { erro: { codigo: "tipo_nao_suportado", mensagem: "Use uma imagem JPEG, PNG ou WebP." } })));
    expect(await enviarImagemNaApi(png())).toEqual({ ok: false, erro: "Use uma imagem JPEG, PNG ou WebP." });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta(503, { erro: { codigo: "servico_indisponivel", mensagem: "x" } })));
    expect(await enviarImagemNaApi(png())).toEqual({ ok: false, erro: "Envio de imagens indisponível no momento.", indisponivel: true });
  });

  it("falha de rede vira mensagem amigável", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede")));
    expect(await enviarImagemNaApi(png())).toMatchObject({ ok: false });
  });
});

describe("armazenamentoDeImagensDisponivel", () => {
  it("lê o campo disponivel e trata erro como indisponível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta(200, { disponivel: true })));
    expect(await armazenamentoDeImagensDisponivel()).toBe(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(resposta(200, { disponivel: false })));
    expect(await armazenamentoDeImagensDisponivel()).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("rede")));
    expect(await armazenamentoDeImagensDisponivel()).toBe(false);
  });
});
