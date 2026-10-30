import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { LIMITE_IMAGEM_BYTES, detectarTipoImagem, novoCaminhoImagem, prepararImagem, type ArmazenamentoImagens } from "../armazenamento/imagens";
import { urlDeImagemPermitida } from "../contracts/imagem";
import { ErroApi } from "../http/erros";
import { criarManipuladoresUploads } from "./rotas";

const ORIGEM = "http://localhost:3000";

async function imagem(formato: "jpeg" | "png" | "webp", largura = 100, altura = 60): Promise<Buffer> {
  const base = sharp({ create: { width: largura, height: altura, channels: 3, background: { r: 200, g: 40, b: 90 } } });
  return formato === "jpeg" ? base.jpeg().toBuffer() : formato === "png" ? base.png().toBuffer() : base.webp().toBuffer();
}

function armazenamentoSimulado() {
  const gravados: { caminho: string; tipo: string; bytes: number }[] = [];
  const armazenamento: ArmazenamentoImagens = {
    async salvar(caminho, dados, tipo) {
      gravados.push({ caminho, tipo, bytes: dados.length });
      return `https://abc123.public.blob.vercel-storage.com/${caminho}`;
    },
  };
  return { armazenamento, gravados };
}

function requisicao(arquivo: Blob | undefined, nome = "foto-original.png", extras: HeadersInit = {}) {
  const corpo = new FormData();
  if (arquivo) corpo.set("arquivo", arquivo, nome);
  return new Request(`${ORIGEM}/api/v1/uploads/imagem`, {
    method: "POST",
    headers: { origin: ORIGEM, "x-requested-with": "archives-vi", ...extras },
    body: corpo,
  });
}

function blob(dados: Uint8Array, tipo: string): Blob {
  return new Blob([new Uint8Array(dados)], { type: tipo });
}

const logado = async () => {};
const visitante = async () => {
  throw new ErroApi("nao_autenticado");
};

describe("detectarTipoImagem (pelo conteúdo)", () => {
  it("reconhece jpeg, png e webp pelos primeiros bytes", async () => {
    expect(detectarTipoImagem(await imagem("jpeg"))).toBe("image/jpeg");
    expect(detectarTipoImagem(await imagem("png"))).toBe("image/png");
    expect(detectarTipoImagem(await imagem("webp"))).toBe("image/webp");
  });

  it("recusa gif, svg, texto e arquivos vazios, mesmo com extensão de imagem", () => {
    expect(detectarTipoImagem(Buffer.from("GIF89a....", "ascii"))).toBeNull();
    expect(detectarTipoImagem(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"))).toBeNull();
    expect(detectarTipoImagem(Buffer.from("isto nao e uma imagem"))).toBeNull();
    expect(detectarTipoImagem(new Uint8Array())).toBeNull();
  });
});

describe("prepararImagem", () => {
  it("limita a largura a 1920 px sem ampliar imagens menores", async () => {
    const grande = await prepararImagem(await imagem("jpeg", 3840, 2160), "image/jpeg");
    expect(grande.largura).toBe(1920);
    expect(grande.altura).toBe(1080);
    const pequena = await prepararImagem(await imagem("png", 400, 300), "image/png");
    expect(pequena.largura).toBe(400);
  });

  it("recusa arquivo com assinatura de imagem mas conteúdo corrompido", async () => {
    const corrompido = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from("lixo lixo lixo")]);
    await expect(prepararImagem(corrompido, "image/jpeg")).rejects.toThrow();
  });

  it("gera caminho no servidor, sem o nome original", () => {
    const a = novoCaminhoImagem("image/png");
    const b = novoCaminhoImagem("image/png");
    expect(a).toMatch(/^imagens\/[0-9a-f-]{36}\.png$/);
    expect(a).not.toBe(b);
  });
});

describe("urlDeImagemPermitida", () => {
  it("só aceita URLs públicas do Vercel Blob dentro de imagens/", () => {
    expect(urlDeImagemPermitida("https://abc123.public.blob.vercel-storage.com/imagens/x.jpg")).toBe(true);
    for (const ruim of [
      "https://exemplo.com/a.jpg",
      "http://abc123.public.blob.vercel-storage.com/imagens/x.jpg",
      "https://abc123.public.blob.vercel-storage.com/outro/x.jpg",
      "https://abc123.public.blob.vercel-storage.com/imagens/",
      "https://public.blob.vercel-storage.com/imagens/x.jpg",
      "https://evil.com/.public.blob.vercel-storage.com/imagens/x.jpg",
      "https://user:senha@abc123.public.blob.vercel-storage.com/imagens/x.jpg",
      "https://abc123.public.blob.vercel-storage.com.evil.com/imagens/x.jpg",
      "javascript:alert(1)",
      "nao e url",
    ]) {
      expect(urlDeImagemPermitida(ruim)).toBe(false);
    }
  });
});

describe("POST /api/v1/uploads/imagem", () => {
  it("visitante recebe 401 antes de qualquer leitura do arquivo", async () => {
    const { armazenamento, gravados } = armazenamentoSimulado();
    const rotas = criarManipuladoresUploads({ autenticar: visitante, armazenamento });
    const resposta = await rotas.enviar(requisicao(blob(await imagem("png"), "image/png")), undefined);
    expect(resposta.status).toBe(401);
    expect(gravados).toHaveLength(0);
  });

  it("sem armazenamento configurado responde 503 com mensagem clara (e não grava em outro lugar)", async () => {
    const rotas = criarManipuladoresUploads({ autenticar: logado, armazenamento: null });
    const resposta = await rotas.enviar(requisicao(blob(await imagem("png"), "image/png")), undefined);
    expect(resposta.status).toBe(503);
    expect(JSON.stringify(await resposta.json())).toContain("Envio de imagens indisponível no momento.");
  });

  it("arquivo válido: grava com nome gerado, redimensiona e devolve a URL pública", async () => {
    const { armazenamento, gravados } = armazenamentoSimulado();
    const rotas = criarManipuladoresUploads({ autenticar: logado, armazenamento });
    const resposta = await rotas.enviar(requisicao(blob(await imagem("jpeg", 3000, 1500), "image/jpeg"), "minha foto.jpg"), undefined);
    expect(resposta.status).toBe(201);
    const corpo = await resposta.json();
    expect(corpo.largura).toBe(1920);
    expect(corpo.url).toMatch(/^https:\/\/abc123\.public\.blob\.vercel-storage\.com\/imagens\/[0-9a-f-]{36}\.jpg$/);
    expect(urlDeImagemPermitida(corpo.url)).toBe(true);
    expect(gravados).toHaveLength(1);
    expect(gravados[0].caminho).not.toContain("minha");
    expect(gravados[0].tipo).toBe("image/jpeg");
  });

  it("arquivo acima de 5 MB: 413, sem gravar", async () => {
    const { armazenamento, gravados } = armazenamentoSimulado();
    const rotas = criarManipuladoresUploads({ autenticar: logado, armazenamento });
    const grande = blob(Buffer.alloc(LIMITE_IMAGEM_BYTES + 1, 1), "image/png");
    const resposta = await rotas.enviar(requisicao(grande), undefined);
    expect(resposta.status).toBe(413);
    expect(gravados).toHaveLength(0);
  });

  it("formato errado (gif, texto) ou conteúdo que não é imagem: 415, mesmo com nome .png e Content-Type de imagem", async () => {
    const { armazenamento, gravados } = armazenamentoSimulado();
    const rotas = criarManipuladoresUploads({ autenticar: logado, armazenamento });
    const gif = await rotas.enviar(requisicao(blob(Buffer.from("GIF89a\u0001\u0000\u0001\u0000"), "image/gif"), "a.gif"), undefined);
    expect(gif.status).toBe(415);
    const disfarcado = await rotas.enviar(requisicao(blob(Buffer.from("isto e texto"), "image/png"), "falso.png"), undefined);
    expect(disfarcado.status).toBe(415);
    expect(gravados).toHaveLength(0);
  });

  it("imagem corrompida: 422; sem campo arquivo: 422; origem externa: 403", async () => {
    const { armazenamento, gravados } = armazenamentoSimulado();
    const rotas = criarManipuladoresUploads({ autenticar: logado, armazenamento });
    const corrompida = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.from("lixo lixo lixo lixo")]);
    expect((await rotas.enviar(requisicao(blob(corrompida, "image/jpeg")), undefined)).status).toBe(422);
    expect((await rotas.enviar(requisicao(undefined), undefined)).status).toBe(422);
    const externa = requisicao(blob(await imagem("png"), "image/png"), "a.png", { origin: "https://evil.example" });
    expect((await rotas.enviar(externa, undefined)).status).toBe(403);
    expect(gravados).toHaveLength(0);
  });

  it("GET informa se o armazenamento está disponível", async () => {
    const sem = criarManipuladoresUploads({ armazenamento: null });
    expect(await (await sem.disponibilidade(new Request(`${ORIGEM}/x`), undefined)).json()).toEqual({ disponivel: false });
    const com = criarManipuladoresUploads({ armazenamento: armazenamentoSimulado().armazenamento });
    expect(await (await com.disponibilidade(new Request(`${ORIGEM}/x`), undefined)).json()).toEqual({ disponivel: true });
  });
});
