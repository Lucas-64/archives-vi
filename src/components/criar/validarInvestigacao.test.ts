import { describe, expect, it } from "vitest";

import { CATEGORIAS_INVESTIGACAO } from "../../server/db/esquema/investigacoes";
import { LIMITES_INVESTIGACAO, esquemaCriarInvestigacao } from "../../server/contracts/investigacoes";
import { MAXIMO_ITENS_LISTA } from "../../lib/investigacoesApi";
import {
  CATEGORIAS_NOVA_INVESTIGACAO,
  LIMITES_NOVA_INVESTIGACAO,
  RASCUNHO_VAZIO,
  montarEntrada,
  validarInvestigacao,
  type RascunhoInvestigacao,
} from "./validarInvestigacao";

const valido: RascunhoInvestigacao = {
  ...RASCUNHO_VAZIO,
  titulo: "  Símbolo na ponte ",
  descricao: "Descrição com mais de vinte caracteres.",
  categoria: "symbol",
  hipotese: "Hipótese com mais de vinte caracteres.",
  perguntaCentral: "Qual o significado?",
};

describe("validarInvestigacao", () => {
  it("os limites e categorias do formulário são os do contrato do servidor", () => {
    expect(LIMITES_NOVA_INVESTIGACAO).toEqual(LIMITES_INVESTIGACAO);
    expect([...CATEGORIAS_NOVA_INVESTIGACAO]).toEqual([...CATEGORIAS_INVESTIGACAO]);
    expect(MAXIMO_ITENS_LISTA).toBe(LIMITES_INVESTIGACAO.itensPorLista);
  });

  it("rascunho vazio recusa os campos obrigatórios, com as chaves do servidor", () => {
    expect(Object.keys(validarInvestigacao(RASCUNHO_VAZIO)).sort()).toEqual(
      ["categoria", "descricao", "teoria.hipotese", "teoria.perguntaCentral", "titulo"].sort(),
    );
  });

  it("rascunho válido não tem erros e o corpo montado passa no esquema do servidor", () => {
    expect(validarInvestigacao(valido)).toEqual({});
    const corpo = montarEntrada(valido);
    expect(corpo.titulo).toBe("Símbolo na ponte");
    expect(esquemaCriarInvestigacao.safeParse(corpo).success).toBe(true);
  });

  it("opcionais vazios não são enviados; vídeo e listas seguem o contrato", () => {
    expect(montarEntrada(valido)).not.toHaveProperty("localizacao");
    expect(montarEntrada(valido)).not.toHaveProperty("video");
    const completo = montarEntrada({
      ...valido,
      localizacao: " Vice Beach ",
      tags: ["locais-mapas"],
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoTitulo: "",
      argumentos: [" um "],
      fontes: ["fonte"],
    });
    expect(completo.localizacao).toBe("Vice Beach");
    expect(completo.video).toEqual({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    expect(completo.teoria.argumentosFavoraveis).toEqual(["um"]);
    expect(esquemaCriarInvestigacao.safeParse(completo).success).toBe(true);
  });

  it("itens de lista vazios e título de vídeo sem link são recusados no item certo", () => {
    const erros = validarInvestigacao({ ...valido, argumentos: ["ok", " "], fontes: ["", "ok"], videoTitulo: "Só título" });
    expect(erros["teoria.argumentosFavoraveis.1"]).toBeDefined();
    expect(erros["teoria.argumentosFavoraveis.0"]).toBeUndefined();
    expect(erros["teoria.fontes.0"]).toBeDefined();
    expect(erros["video.url"]).toBe("Informe o link do vídeo.");
  });

  it("imagem de capa: opcional, só a URL do Vercel Blob (devolvida pelo envio); URL https livre é recusada", () => {
    const blob = "https://abc123.public.blob.vercel-storage.com/imagens/0f6c3a2e-1111-4222-8333-444455556666.jpg";
    expect(montarEntrada(valido)).not.toHaveProperty("imagem");
    expect(validarInvestigacao({ ...valido, imagemUrl: "https://exemplo.com/a.jpg" }).imagem).toBeDefined();
    expect(validarInvestigacao({ ...valido, imagemUrl: "http://abc123.public.blob.vercel-storage.com/imagens/a.jpg" }).imagem).toBeDefined();
    expect(validarInvestigacao({ ...valido, imagemUrl: "isso nao e url" }).imagem).toBeDefined();
    expect(validarInvestigacao({ ...valido, imagemUrl: `${blob}${"a".repeat(400)}` }).imagem).toBeDefined();

    const comImagem = { ...valido, imagemUrl: ` ${blob} ` };
    expect(validarInvestigacao(comImagem)).toEqual({});
    const corpo = montarEntrada(comImagem);
    expect(corpo.imagem).toBe(blob);
    expect(esquemaCriarInvestigacao.safeParse(corpo).success).toBe(true);
    for (const ruim of ["javascript:alert(1)", "http://abc123.public.blob.vercel-storage.com/imagens/a.jpg", "https://exemplo.com/a.jpg", "https://abc123.public.blob.vercel-storage.com/outra/a.jpg"]) {
      expect(esquemaCriarInvestigacao.safeParse({ ...corpo, imagem: ruim }).success).toBe(false);
    }
  });
});
