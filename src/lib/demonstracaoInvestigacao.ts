import { investigacaoDetalhes } from "../mocks/investigacaoDetalhe";
import type { InvestigacaoDetalhe } from "../types/InvestigacaoDetalhe";

// Conteúdo de DEMONSTRAÇÃO das investigações (ADR-010, ADR-039). A API não tem discussão, síntese, participantes,
// atividade recente nem fotografias de evidência. Quando o slug tem um registro em src/mocks/investigacaoDetalhe.ts,
// essas seções mostram esse exemplo, sempre rotulado como demonstração. Sem registro, mostram estado vazio
// rotulado: nada é inventado para investigações reais. Só leitura: nada é gravado.
export function detalheDemonstrativo(slug: string): InvestigacaoDetalhe | undefined {
  return investigacaoDetalhes.find((detalhe) => detalhe.id === slug);
}
