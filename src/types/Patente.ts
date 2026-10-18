// Patente do investigador. Dados demonstrativos: não há regra de progressão definida (ver
// docs/DECISIONS.md, ADR-019). Quando as regras de produto existirem, só os mocks mudam.
//
// `medalha` escolhe a aparência da medalha (cor do tema), não a regra da patente.
export type VarianteMedalha = "inicial" | "intermediaria" | "investigador" | "destaque";

export interface Patente {
  id: string;
  nome: string;
  medalha: VarianteMedalha;
  // Frase descritiva, futura. Sem valor, a interface não mostra a frase.
  descricao?: string;
}

// Patente atual e patentes anteriores já conquistadas pelo membro. Quando o membro não tem dados,
// não há registro (undefined) e a interface mostra um estado vazio.
export interface PatentesDoMembro {
  atual: Patente;
  anteriores: Patente[];
}
