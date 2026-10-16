// Detalhe de uma investigação. Complementa o tipo `Case` (listagem) sem alterá-lo.
// Os dados que chegam de src/mocks são demonstrativos.
import type { StaticImageData } from "next/image";

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

// Imagem de uma evidência. Até cinco por evidência, exibidas em carrossel.
export interface ImagemEvidencia {
  image: StaticImageData;
  // Descrição para leitores de tela. Descreve a imagem sem interpretá-la.
  alt: string;
}

export type StatusSugestao = "pendente" | "aceita" | "recusada";

// Evidência enviada por um membro da comunidade. Só entra na lista pública depois de aceita
// pelo investigador responsável.
export interface SugestaoEvidencia {
  id: string;
  status: StatusSugestao;
  origem: OrigemEvidencia;
  titulo: string;
  descricao: string;
  enviadaPor: Pessoa;
  data: string;
  imagens?: ImagemEvidencia[];
  // Preenchido quando a sugestão é aceita.
  aceitaPor?: Pessoa;
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
  // Ausentes em evidências aceitas da comunidade, que ainda não têm contagens.
  comentarios?: number;
  avaliacoes?: AvaliacoesEvidencia;
  // Id de outra evidência relacionada, quando houver.
  relacionadaA?: string;
  temDiscussao: boolean;
  imagens?: ImagemEvidencia[];
  // Presente quando a evidência veio de uma sugestão aceita. A aprovação não muda a autoria.
  origemComunidade?: { enviadaPor: Pessoa; aceitaPor: Pessoa };
}

export interface Comentario {
  id: string;
  autor: Pessoa;
  data: string;
  texto: string;
  contribuicaoUtil?: boolean;
  respostas: Comentario[];
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
  // Sugestões da comunidade. Pendentes e recusadas não aparecem na lista pública.
  sugestoes: SugestaoEvidencia[];
  discussaoGeral: Comentario[];
  // Discussão contextualizada em uma evidência.
  discussaoEvidenciaId: string;
  discussaoContextual: Comentario[];
  historico: RegistroHistorico[];
  sintese: Sintese;
  participantes: Pessoa[];
  atividadeRecente: string[];
}
