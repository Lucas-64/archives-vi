import type { InvestigacaoDetalhe, RegistroHistorico } from "../types/InvestigacaoDetalhe";
import type { DetalheReal } from "./adaptadores";

// Monta o detalhe no formato do componente de investigação do backup a partir do que a API tem (ADR-042):
// teoria, estado, autoria, contagens e histórico. Discussão, síntese, participantes, atividade e as listas de
// evidências do backup ficam vazias (a página usa a lista real de evidências e mostra estado vazio rotulado).
export function detalheClassicoDoBanco(detalhe: DetalheReal, historico: RegistroHistorico[]): InvestigacaoDetalhe {
  return {
    ...detalhe,
    contagens: { participantes: 0, evidencias: detalhe.contagens.evidencias, comentarios: 0, revisoes: detalhe.contagens.revisoes },
    evidencias: [],
    sugestoes: [],
    discussaoGeral: [],
    discussaoEvidenciaId: "",
    discussaoContextual: [],
    historico,
    sintese: { observado: [], sustentam: [], contradizem: [], perguntasEmAberto: [], conclusaoProvisoria: null },
    participantes: [],
    atividadeRecente: [],
  };
}
