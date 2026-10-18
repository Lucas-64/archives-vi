// DADOS DEMONSTRATIVOS. As patentes abaixo são provisórias, para mostrar a composição da seção.
// Não representam um sistema de progressão, nem XP, nem nível (ver docs/DECISIONS.md, ADR-019).
import type { PatentesDoMembro } from "@/types/Patente";

// Chave: id do criador (Criador.id). Criador sem entrada aqui mostra o estado vazio.
export const patentesPorCriador: Partial<Record<string, PatentesDoMembro>> = {
  "analista-vb": {
    atual: { id: "investigador", nome: "Investigador", medalha: "investigador" },
    anteriores: [
      { id: "observador", nome: "Observador", medalha: "inicial" },
      { id: "analista-de-campo", nome: "Analista de Campo", medalha: "intermediaria" },
    ],
  },
  "noturno-leonida": {
    atual: { id: "analista-de-campo", nome: "Analista de Campo", medalha: "intermediaria" },
    anteriores: [{ id: "observador", nome: "Observador", medalha: "inicial" }],
  },
  "arquivista-99": {
    atual: { id: "investigador-senior", nome: "Investigador Sênior", medalha: "destaque" },
    anteriores: [
      { id: "observador", nome: "Observador", medalha: "inicial" },
      { id: "analista-de-campo", nome: "Analista de Campo", medalha: "intermediaria" },
      { id: "investigador", nome: "Investigador", medalha: "investigador" },
    ],
  },
};
