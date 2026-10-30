import { describe, expect, it } from "vitest";

import { esquemaCriarEvidencia } from "./evidencias";
import { esquemaUrlImagem } from "./imagem";
import { esquemaCriarPublicacao } from "./publicacoes";
import { esquemaEditarPerfil } from "./usuarios";

const BLOB = "https://abc123.public.blob.vercel-storage.com/imagens/foto-1.webp";
const LIVRE = "https://exemplo.com/foto.jpg";

describe("campos de imagem dos contratos (ADR-043)", () => {
  it("aceita só a URL pública do Blob e recusa URL https livre", () => {
    expect(esquemaUrlImagem.safeParse(BLOB).success).toBe(true);
    expect(esquemaUrlImagem.safeParse(LIVRE).success).toBe(false);
    expect(esquemaUrlImagem.safeParse("http://abc.public.blob.vercel-storage.com/imagens/a.png").success).toBe(false);
    expect(esquemaUrlImagem.safeParse("https://abc.public.blob.vercel-storage.com/outro/a.png").success).toBe(false);
  });

  it("publicação: imagem é opcional e só aceita o Blob", () => {
    const base = { titulo: "Uma teoria válida", corpo: "Texto da teoria com tamanho suficiente para passar." };
    expect(esquemaCriarPublicacao.safeParse(base).success).toBe(true);
    expect(esquemaCriarPublicacao.safeParse({ ...base, imagem: BLOB }).success).toBe(true);
    expect(esquemaCriarPublicacao.safeParse({ ...base, imagem: LIVRE }).success).toBe(false);
  });

  it("evidência: imagem é opcional e só aceita o Blob", () => {
    const base = { origem: "referencia_textual", titulo: "Título da evidência", descricao: "Descrição da evidência com tamanho suficiente." };
    expect(esquemaCriarEvidencia.safeParse({ ...base, imagem: BLOB }).success).toBe(true);
    expect(esquemaCriarEvidencia.safeParse({ ...base, imagem: LIVRE }).success).toBe(false);
  });

  it("perfil: avatar e banner aceitam Blob ou null e recusam URL livre", () => {
    expect(esquemaEditarPerfil.safeParse({ avatar: BLOB, banner: null }).success).toBe(true);
    expect(esquemaEditarPerfil.safeParse({ avatar: LIVRE }).success).toBe(false);
    expect(esquemaEditarPerfil.safeParse({ banner: LIVRE }).success).toBe(false);
  });
});
