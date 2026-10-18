// DADOS DEMONSTRATIVOS. Notificações, solicitações e conexões do Meu Perfil não existem no backend
// ainda (ADR-021). Estes exemplos servem só para validar a interface. Não representam eventos reais,
// e nenhuma notificação é enviada ou recebida. Trocar por dados reais quando o backend existir.
import type { Conexao, Notificacao, Solicitacao } from "@/types/MeuPerfil";

export const notificacoesDemonstrativas: Notificacao[] = [
  {
    id: "n-resposta",
    tipo: "resposta",
    titulo: "Nova resposta na sua discussão",
    descricao: "Um membro respondeu ao seu comentário na discussão de Símbolos de Vice City.",
    data: "2026-10-13",
    lida: false,
    href: "/publicacoes/investigacao/simbolos-vice-city#discussao",
  },
  {
    id: "n-evidencia",
    tipo: "evidencia",
    titulo: "Evidência atualizada",
    descricao: "A investigação responsável revisou a sua evidência sobre a aparição do letreiro.",
    data: "2026-10-12",
    lida: false,
    href: "/publicacoes/investigacao/simbolos-vice-city#evidencia-009",
  },
  {
    id: "n-investigacao",
    tipo: "investigacao",
    titulo: "Investigação atualizada",
    descricao: "Uma nova revisão de teoria foi registrada em Símbolos de Vice City.",
    data: "2026-10-11",
    lida: true,
    href: "/publicacoes/investigacao/simbolos-vice-city",
  },
];

export const solicitacoesDemonstrativas: Solicitacao[] = [
  {
    id: "s-prova",
    titulo: "Solicitação de prova",
    descricao: "Pediu a fonte original da frase “pulsos a cada 4 segundos” na sua teoria.",
    de: { nome: "Observador Fictício 07", usuario: "observador_07" },
    data: "2026-10-12",
    estado: "pendente",
    href: "/publicacoes/investigacao/simbolos-vice-city#discussao",
  },
  {
    id: "s-contexto",
    titulo: "Pedido de contexto",
    descricao: "Pediu mais contexto sobre o letreiro verde que você enviou.",
    de: { nome: "Arquivista 99", usuario: "arquivista_99" },
    data: "2026-10-09",
    estado: "aceita",
    href: "/publicacoes/investigacao/simbolos-vice-city#evidencia-009",
  },
];

export const conexoesDemonstrativas: Conexao[] = [
  {
    id: "c-relacao",
    titulo: "Possível relação com outra investigação",
    descricao: "Um investigador sinalizou uma relação possível entre o seu caso e outro mistério. A relação ainda não foi verificada.",
    data: "2026-10-10",
    href: "/investigacoes/simbolos-vice-city",
  },
];
