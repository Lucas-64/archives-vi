// Detalhe de uma investigação. Complementa o tipo `Case` (listagem) sem alterá-lo.
// Os dados que chegam de src/mocks são demonstrativos.

// Estado de investigação exibido no detalhe. Separado de `Case.status`, que é o estado da listagem.
export type EstadoInvestigacao =
  | "em_andamento"
  | "teoria_apoiada"
  | "contestada"
  | "inconclusiva";

export type OrigemEvidencia =
  | "imagem_propria"
  | "imagem_terceiro"
  | "referencia_textual"
  | "origem_nao_verificada";

export interface Pessoa {
  nome: string;
  usuario: string;
}

// Contagens individuais. Não existe total, porcentagem nem ranking.
export interface AvaliacoesEvidencia {
  relevante: number;
  contradiz: number;
  precisaContexto: number;
}

export interface Evidencia {
  id: string;
  origem: OrigemEvidencia;
  titulo: string;
  descricao: string;
  autor: Pessoa;
  data: string;
  // null quando a fonte ainda não foi verificada.
  fonte: string | null;
  comentarios: number;
  avaliacoes: AvaliacoesEvidencia;
  // Id de outra evidência relacionada, quando houver.
  relacionadaA?: string;
  temDiscussao: boolean;
}

export interface Comentario {
  id: string;
  autor: Pessoa;
  data: string;
  texto: string;
  contribuicaoUtil?: boolean;
  respostas: Comentario[];
}

export interface NoConexao {
  id: string;
  rotulo: string;
}

export type TipoRelacao = "mesmo_tracado" | "mesmo_local" | "mesma_cena";

export interface RelacaoConexao {
  de: string;
  para: string;
  tipo: TipoRelacao;
  rotulo: string;
}

export interface RegistroHistorico {
  id: string;
  data: string;
  autor: Pessoa;
  titulo: string;
  resumo: string;
}

export interface Sintese {
  observado: string[];
  sustentam: string[];
  contradizem: string[];
  perguntasEmAberto: string[];
  // null quando não há conclusão suficiente: a interface mostra "Ainda não definida".
  conclusaoProvisoria: { texto: string; autor: Pessoa } | null;
}

export interface InvestigacaoDetalhe {
  // Mesmo id do `Case` correspondente.
  id: string;
  estado: EstadoInvestigacao;
  encerradaPeloAutor: boolean;
  autor: Pessoa;
  criadoEm: string;
  atualizadoEm: string;
  contagens: {
    participantes: number;
    evidencias: number;
    comentarios: number;
    revisoes: number;
  };
  teoria: {
    hipotese: string;
    argumentosFavoraveis: string[];
    perguntaCentral: string;
    fontes: string[];
  };
  evidencias: Evidencia[];
  discussaoGeral: Comentario[];
  // Discussão contextualizada em uma evidência.
  discussaoEvidenciaId: string;
  discussaoContextual: Comentario[];
  conexoes: { nos: NoConexao[]; relacoes: RelacaoConexao[] };
  historico: RegistroHistorico[];
  sintese: Sintese;
  participantes: Pessoa[];
  atividadeRecente: string[];
}
