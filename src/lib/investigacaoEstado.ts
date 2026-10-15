import type { BadgeVariant } from "../components/ui/Badge";
import type { EstadoInvestigacao, OrigemEvidencia } from "../types/InvestigacaoDetalhe";

// Rótulos e variantes dos estados do detalhe. Cores vêm das variantes do Badge (tema).
// "Apoiada por evidências" não significa confirmação oficial.
export const ESTADO_INVESTIGACAO: Record<
  EstadoInvestigacao,
  { rotulo: string; descricao: string; variant: BadgeVariant }
> = {
  em_andamento: {
    rotulo: "Em andamento",
    descricao: "A investigação segue aberta a novas evidências.",
    variant: "warning",
  },
  teoria_apoiada: {
    rotulo: "Apoiada por evidências",
    descricao: "As evidências sustentam a hipótese. Isto não é uma confirmação oficial.",
    variant: "success",
  },
  contestada: {
    rotulo: "Contestada",
    descricao: "Evidências relevantes contradizem a hipótese.",
    variant: "danger",
  },
  inconclusiva: {
    rotulo: "Inconclusiva",
    descricao: "As evidências ainda não permitem concluir.",
    variant: "info",
  },
};

// Encerrar pelo autor é um estado separado. Não equivale a comprovação nem a "Resolvidas".
export const ENCERRADA_PELO_AUTOR = {
  rotulo: "Encerrada pelo autor",
  descricao: "O autor encerrou a investigação. Isto não equivale a comprovação.",
  variant: "secondary" as BadgeVariant,
};

export const ROTULO_ORIGEM: Record<OrigemEvidencia, string> = {
  imagem_propria: "Imagem própria",
  imagem_terceiro: "Imagem de terceiro",
  referencia_textual: "Referência textual",
  origem_nao_verificada: "Origem não verificada",
};

// Rótulos das categorias do Case (listagem), usados no cabeçalho do detalhe.
export const ROTULO_CATEGORIA: Record<string, string> = {
  sighting: "Avistamento",
  location: "Localização",
  symbol: "Símbolo",
  broadcast: "Transmissão",
  phenomenon: "Fenômeno",
  "community-discovery": "Descoberta da comunidade",
};
