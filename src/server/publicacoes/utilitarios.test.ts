import { describe, expect, it } from "vitest";

import { diaLocal } from "./data";
import { RESUMO_MAXIMO, resumoDoCorpo } from "./resumo";
import { SLUG_BASE_MAXIMO, comSufixoAleatorio, slugDoTitulo } from "./slug";

describe("slugDoTitulo", () => {
  it("remove acentos, usa minúsculas e hifens", () => {
    expect(slugDoTitulo("Por que o letreiro da praia aparece duas vezes?")).toBe("por-que-o-letreiro-da-praia-aparece-duas-vezes");
    expect(slugDoTitulo("  Ação & Reação — Vice City!! ")).toBe("acao-reacao-vice-city");
  });

  it("limita o tamanho sem terminar em hífen", () => {
    const slug = slugDoTitulo("palavra ".repeat(30));
    expect(slug.length).toBeLessThanOrEqual(SLUG_BASE_MAXIMO);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("título só com símbolos vira 'teoria'", () => {
    expect(slugDoTitulo("!!! ???")).toBe("teoria");
  });

  it("o sufixo aleatório mantém o formato válido e muda a cada chamada", () => {
    const a = comSufixoAleatorio("teoria");
    const b = comSufixoAleatorio("teoria");
    expect(a).toMatch(/^teoria-[0-9a-f]{8}$/);
    expect(a).not.toBe(b);
  });
});

describe("resumoDoCorpo", () => {
  it("mantém textos curtos, normalizando espaços", () => {
    expect(resumoDoCorpo("  Um   texto\ncurto  ")).toBe("Um texto curto");
  });

  it("corta textos longos na última palavra inteira e nunca passa de 200", () => {
    const resumo = resumoDoCorpo("palavra ".repeat(100));
    expect(resumo.length).toBeLessThanOrEqual(RESUMO_MAXIMO);
    expect(resumo.endsWith("…")).toBe(true);
    expect(resumo.slice(0, -1).endsWith("palavra")).toBe(true);
  });

  it("texto longo sem espaços também respeita 200", () => {
    expect(resumoDoCorpo("a".repeat(500)).length).toBe(RESUMO_MAXIMO);
  });
});

describe("diaLocal (America/Sao_Paulo)", () => {
  it("23:59 em São Paulo ainda é o mesmo dia, embora já seja o dia seguinte em UTC", () => {
    expect(diaLocal(new Date("2026-10-21T02:59:00Z"))).toBe("2026-10-20");
  });

  it("00:00 em São Paulo é o dia novo", () => {
    expect(diaLocal(new Date("2026-10-21T03:00:00Z"))).toBe("2026-10-21");
  });

  it("início da tarde em UTC cai no mesmo dia", () => {
    expect(diaLocal(new Date("2026-10-20T15:00:00Z"))).toBe("2026-10-20");
  });
});
