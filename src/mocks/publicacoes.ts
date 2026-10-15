// Dados demonstrativos em português. Não representam conteúdo real.
import type { Publicacao } from "@/types/Publicacao";

export const publicacoes: Publicacao[] = [
  {
    id: "pub-letreiro-praia",
    slug: "letreiro-praia-trailer",
    titulo: "Por que o letreiro da praia aparece duas vezes no trailer?",
    resumo:
      "Comparando os quadros do trailer, a comunidade identificou o mesmo letreiro em dois momentos diferentes da cena.",
    tipo: "teoria",
    autorId: "analista-vb",
    data: "2026-07-02",
    comentarios: 14,
    tags: ["trailer", "vice-beach", "letreiro"],
  },
  {
    id: "pub-sinal-99-1",
    slug: "sinal-99-1-repete",
    titulo: "O sinal da Frequência 99.1 se repete em três áudios diferentes",
    resumo:
      "Um trecho curto de áudio aparece em três vídeos independentes, com a mesma sequência de pulsos ao fundo.",
    tipo: "investigacao",
    autorId: "noturno-leonida",
    data: "2026-07-01",
    comentarios: 9,
    tags: ["rádio", "áudio", "frequência"],
  },
  {
    id: "pub-simbolos-mural",
    slug: "simbolos-mural-centro",
    titulo: "Os símbolos do mural podem apontar para locais do mapa?",
    resumo:
      "Uma lista de símbolos repetidos no mural foi comparada com coordenadas de pontos conhecidos da cidade.",
    tipo: "teoria",
    autorId: "arquivista-99",
    data: "2026-06-30",
    comentarios: 21,
    tags: ["mural", "símbolos", "mapa"],
  },
  {
    id: "pub-bunker-pantanos",
    slug: "bunker-pantanos-mapa-antigo",
    titulo: "Um bunker nos pântanos aparece em mapa antigo?",
    resumo:
      "Um mapa de um fórum antigo mostra uma estrutura próxima aos pântanos. Ainda não há imagens que confirmem a estrutura.",
    tipo: "investigacao",
    autorId: "arquivista-99",
    data: "2026-06-29",
    comentarios: 6,
    tags: ["pântanos", "mapa", "bunker"],
  },
  {
    id: "pub-clarao-tempestade",
    slug: "clarao-tempestade-anomalia-ou-edicao",
    titulo: "O clarão da tempestade é uma anomalia ou uma edição?",
    resumo:
      "Análise do quadro único do clarão, com comparação de metadados e de transições entre cenas.",
    tipo: "teoria",
    autorId: "noturno-leonida",
    data: "2026-06-28",
    comentarios: 11,
    tags: ["tempestade", "edição", "quadro"],
  },
  {
    id: "pub-adesivos-penhores",
    slug: "codigo-adesivos-loja-penhores",
    titulo: "O código dos adesivos da loja de penhores",
    resumo:
      "Passo a passo da decodificação do layout de adesivos e da sequência numérica que aparece junto deles.",
    tipo: "investigacao",
    autorId: "analista-vb",
    data: "2026-06-27",
    comentarios: 17,
    tags: ["adesivos", "código", "loja"],
  },
];
