import { describe, expect, it } from "vitest";

import {
  evidenciaParaFront,
  historicoParaFront,
  investigacaoDetalheParaFront,
  investigacaoParaCaso,
  perfilParaCriador,
  publicacaoParaFront,
  sugestaoParaFront,
} from "./adaptadores";

describe("adaptadores API -> front", () => {
  it("perfil vira Criador com id = usuario e sem campos privados", () => {
    const c = perfilParaCriador({ usuario: "ana_s", nome: "Ana", bio: "" });
    expect(c).toEqual({ id: "ana_s", usuario: "ana_s", nome: "Ana", bio: "" });
  });

  it("publicação: autorId é o usuario, tags fora do catálogo são descartadas, nada é inventado", () => {
    const p = publicacaoParaFront({
      id: "1", slug: "s", titulo: "T", resumo: "R", corpo: null, imagem: null, tipo: "teoria",
      autor: { nome: "Ana", usuario: "ana_s" }, data: "2026-10-01",
      tags: ["ovnis-extraterrestres", "inexistente"], termos: ["x"], comentarios: 3, curtidas: 9, euCurti: true,
    });
    expect(p).toEqual({
      id: "1", slug: "s", titulo: "T", resumo: "R", tipo: "teoria", autorId: "ana_s", data: "2026-10-01",
      comentarios: 3, tags: ["ovnis-extraterrestres"], termos: ["x"],
    });
  });

  it("publicação com corpo: o texto completo é preservado", () => {
    const p = publicacaoParaFront({
      id: "1", slug: "s", titulo: "T", resumo: "R", corpo: "Texto completo", imagem: null, tipo: "teoria",
      autor: { nome: "Ana", usuario: "ana_s" }, data: "2026-10-01", tags: [], termos: [], comentarios: 0, curtidas: 0, euCurti: false,
    });
    expect(p.corpo).toBe("Texto completo");
  });

  it("investigação: id = slug, sem imagem, data só com o dia, tags filtradas", () => {
    const c = investigacaoParaCaso({
      id: "uuid", slug: "minha-inv", titulo: "Titulo", descricao: "Desc", imagem: null, status: "investigating",
      categoria: "symbol", tags: ["simbolos-mensagens", "x"], contagemEvidencias: 2, atualizadoEm: "2026-10-21T10:11:12.000Z", possuiDetalhe: true,
    });
    expect(c).toMatchObject({ id: "minha-inv", title: "Titulo", status: "investigating", category: "symbol", evidenceCount: 2, updatedAt: "2026-10-21", tags: ["simbolos-mensagens"] });
    expect(c.image).toBeUndefined();
    expect(JSON.stringify(c)).not.toContain("uuid");
  });

  it("detalhe da investigação: só o que a API tem, datas só com o dia, sem campos inventados", () => {
    const d = investigacaoDetalheParaFront({
      id: "uuid", slug: "minha-inv", titulo: "T", descricao: "D", imagem: null, status: "investigating", categoria: "symbol", tags: [],
      contagemEvidencias: 1, atualizadoEm: "2026-10-21T10:00:00.000Z", possuiDetalhe: true, estado: "em_andamento", encerradaPeloAutor: false,
      autor: { nome: "Ana", usuario: "ana_s" }, criadoEm: "2026-10-20T23:00:00.000Z",
      teoria: { hipotese: "h", argumentosFavoraveis: ["a"], perguntaCentral: "p", fontes: [] },
      contagens: { revisoes: 2, evidencias: 1 }, permissoes: { podeGerenciar: true, podeSugerirEvidencia: true, podeModerar: false },
    });
    expect(d).toEqual({
      id: "minha-inv", estado: "em_andamento", encerradaPeloAutor: false, autor: { nome: "Ana", usuario: "ana_s" },
      criadoEm: "2026-10-20", atualizadoEm: "2026-10-21", teoria: { hipotese: "h", argumentosFavoraveis: ["a"], perguntaCentral: "p", fontes: [] },
      contagens: { evidencias: 1, revisoes: 2 },
    });
    expect(Object.keys(d)).not.toContain("participantes");
    expect(Object.keys(d)).not.toContain("permissoes");
  });

  it("evidência aceita: sem imagens, avaliações nem discussão; mantém procedência da comunidade", () => {
    const e = evidenciaParaFront({
      id: "e1", origem: "referencia_textual", titulo: "T", descricao: "D", autor: { nome: "Bia", usuario: "bia" },
      data: "2026-10-21T09:00:00.000Z", fonte: null, imagens: [],
      origemComunidade: { enviadaPor: { nome: "Bia", usuario: "bia" }, aceitaPor: { nome: "Ana", usuario: "ana_s" } },
    });
    expect(e).toMatchObject({ id: "e1", data: "2026-10-21", fonte: null, temDiscussao: false, origemComunidade: { aceitaPor: { usuario: "ana_s" } } });
    expect(e.imagens).toBeUndefined();
    expect(e.avaliacoes).toBeUndefined();
  });

  it("histórico: a API entrega do mais recente ao mais antigo; a linha do tempo inverte", () => {
    const r = historicoParaFront([
      { id: "2", data: "2026-10-21T10:00:00.000Z", autor: { nome: "A", usuario: "a" }, titulo: "novo", resumo: "r" },
      { id: "1", data: "2026-10-20T10:00:00.000Z", autor: { nome: "A", usuario: "a" }, titulo: "velho", resumo: "r" },
    ]);
    expect(r.map((x) => x.id)).toEqual(["1", "2"]);
    expect(r[0].data).toBe("2026-10-20");
  });

  it("sugestão: carrega status e motivo só quando a API os traz", () => {
    const s = sugestaoParaFront({
      id: "s1", origem: "origem_nao_verificada", titulo: "T", descricao: "D", autor: { nome: "Bia", usuario: "bia" },
      data: "2026-10-21T09:00:00.000Z", fonte: null, imagens: [], status: "recusada", motivo: "Sem fonte.", decididaPor: { nome: "Ana", usuario: "ana_s" },
    });
    expect(s).toMatchObject({ status: "recusada", motivo: "Sem fonte.", decididaPor: "ana_s", enviadaPor: { usuario: "bia" } });
    expect(sugestaoParaFront({ id: "s2", origem: "referencia_textual", titulo: "T", descricao: "D", autor: { nome: "B", usuario: "b" }, data: "2026-10-21T09:00:00.000Z", fonte: null, imagens: [], status: "pendente" }).motivo).toBeUndefined();
  });
});
