import type { theme } from "../styles/theme";
import type { CaseStatus } from "../types/Case";

// Fonte única das classificações de Mistérios (só interface; não há campo equivalente no banco nem na API).
// Tipo, filtro, cards e selos leem daqui: para adicionar uma classificação, basta incluir um item na lista.
// A ordem da lista é a ordem de exibição. Vale só para Mistérios; os status de investigação não mudam.
export interface ClassificacaoMisterio {
  // Também é o valor usado na URL (?classificacao=...).
  id: string;
  rotulo: string;
  // Chave de um token de cor do tema (src/styles/theme.ts). Nunca um valor literal.
  cor: keyof typeof theme.colors;
  // Critério editorial: o que faz um mistério entrar nesta classificação.
  criterio: string;
}

export const CLASSIFICACOES_MISTERIO = [
  {
    id: "em-andamento",
    rotulo: "Em andamento",
    cor: "investigating",
    criterio: "Pergunta em aberto, debatida pela comunidade.",
  },
  {
    id: "resolvido",
    rotulo: "Resolvido",
    cor: "confirmed",
    criterio: "Explicação confirmada.",
  },
  {
    id: "easter-egg",
    rotulo: "Easter egg",
    cor: "pink",
    criterio: "Segredo ou referência intencional deixado no jogo.",
  },
  {
    id: "curiosidade",
    rotulo: "Curiosidade",
    cor: "unexplained",
    criterio: "Detalhe interessante, sem mistério a resolver.",
  },
] as const satisfies readonly ClassificacaoMisterio[];

export type ClassificacaoMisterioId = (typeof CLASSIFICACOES_MISTERIO)[number]["id"];

// Valor para mistério sem classificação mapeada.
export const CLASSIFICACAO_PADRAO: ClassificacaoMisterioId = "em-andamento";

// Regra de status (decisão do produto): `confirmed` e `debunked` são "Resolvido". Todo o resto, inclusive
// `community` e `classified`, usa a classificação padrão ("Em andamento").
export const CLASSIFICACAO_POR_STATUS: Partial<Record<CaseStatus, ClassificacaoMisterioId>> = {
  investigating: "em-andamento",
  confirmed: "resolvido",
  debunked: "resolvido",
};

// PROVISÓRIO: Easter egg e Curiosidade ainda não têm origem no banco. Estas exceções por slug têm prioridade
// sobre o status e existem só para validar as cores. Remover quando houver campo persistente de classificação.
export const CLASSIFICACAO_POR_SLUG: Readonly<Record<string, ClassificacaoMisterioId>> = {
  "leonida-radio-loop": "easter-egg",
  "downtown-mural-symbols": "em-andamento",
  "airport-runway-markings": "curiosidade",
};
