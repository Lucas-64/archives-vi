import { describe, expect, it } from "vitest";

import type { CasoDeCard } from "../types/Case";
import type { Publicacao } from "../types/Publicacao";
import { buscar, contarResultados, montarHrefBusca } from "./busca";

const publicacao = (p: Partial<Publicacao>): Publicacao => ({
  id: "p", slug: "p", titulo: "Título", resumo: "Resumo", tipo: "teoria", autorId: "ana", data: "2026-01-01", comentarios: 0, tags: [], termos: [], ...p,
});
const caso = (c: Partial<CasoDeCard>): CasoDeCard => ({ id: "c", title: "Caso", description: "Descrição", status: "investigating", category: "symbol", ...c });

describe("buscar (dados reais adaptados)", () => {
  const dados = {
    publicacoes: [publicacao({ id: "1", titulo: "Frequência estranha" }), publicacao({ id: "2", titulo: "Outra", tags: ["ovnis-extraterrestres"] })],
    investigacoes: [caso({ id: "vice", title: "Luzes", location: "Vice Beach" })],
    criadores: [],
  };

  it("ignora acentos e caixa e procura em título, tema e localização", () => {
    expect(buscar("frequencia", "todos", dados).publicacoes.map((p) => p.id)).toEqual(["1"]);
    expect(buscar("OVNIs", "todos", dados).publicacoes.map((p) => p.id)).toEqual(["2"]);
    expect(buscar("vice", "todos", dados).investigacoes.map((c) => c.id)).toEqual(["vice"]);
  });

  it("aba restringe o tipo e consulta vazia não devolve nada", () => {
    expect(contarResultados(buscar("vice", "publicacoes", dados))).toBe(0);
    expect(contarResultados(buscar("  ", "todos", dados))).toBe(0);
  });

  it("monta o endereço mantendo consulta e aba", () => {
    expect(montarHrefBusca("a b", "criadores")).toBe("/buscar?q=a+b&tipo=criadores");
    expect(montarHrefBusca("", "todos")).toBe("/buscar");
  });
});
