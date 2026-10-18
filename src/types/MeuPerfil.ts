// Tipos da área Meu Perfil (ADR-021). Evidências, respostas e investigações derivam dos registros reais
// (InvestigacaoDetalhe e Publicacao). Notificações, solicitações e conexões são demonstrativas: o modelo
// de backend ainda não existe.
import type { Pessoa } from "./InvestigacaoDetalhe";

// Estados de evidência enviada pelo membro, mapeados a partir do domínio real:
// evidência pública = "aceita"; sugestão pendente = "pendente"; sugestão recusada = "rejeitada".
export type EstadoEvidenciaMeu = "pendente" | "aceita" | "rejeitada";

export interface EvidenciaMeu {
  chave: string;
  titulo: string;
  descricao: string;
  investigacaoId: string;
  data: string;
  estado: EstadoEvidenciaMeu;
  // Verdadeiro quando a evidência aparece na lista pública da investigação.
  publica: boolean;
  // Âncora na página da comunidade. Só existe para evidências públicas do próprio membro.
  ancora?: string;
}

export interface RespostaMeu {
  chave: string;
  texto: string;
  data: string;
  investigacaoId: string;
  local: "Discussão geral" | "Discussão da evidência";
}

export type TipoNotificacao = "resposta" | "evidencia" | "investigacao" | "solicitacao" | "conquista";

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
  href: string;
}

export type EstadoSolicitacao = "pendente" | "aceita" | "recusada";

export interface Solicitacao {
  id: string;
  titulo: string;
  descricao: string;
  de: Pessoa;
  data: string;
  estado: EstadoSolicitacao;
  href: string;
}

export interface Conexao {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  href: string;
}
