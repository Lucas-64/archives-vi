// Dados demonstrativos em português. Não representam conteúdo real.
import heroImage from "@/assets/images/hero.jpg";
import type { Case } from "@/types/Case";
import type { Destaque } from "@/types/Destaque";

export const investigacoes: Case[] = [
  {
    id: "vice-beach-night-lights",
    title: "Luzes noturnas sobre Vice Beach",
    description:
      "Várias capturas da comunidade apontam para um conjunto repetido de luzes sobre o litoral, em quadros noturnos do trailer.",
    image: heroImage,
    status: "investigating",
    category: "sighting",
    location: "Vice Beach",
    evidenceCount: 12,
    updatedAt: "2026-07-01",
  },
  {
    id: "leonida-radio-loop",
    title: "Loop incomum na Frequência 99.1",
    description:
      "Um sinal curto, parecido com rádio, parece se repetir em trechos de áudio da comunidade e levanta dúvidas sobre uma transmissão escondida.",
    image: heroImage,
    status: "community",
    category: "broadcast",
    location: "Leonida",
    evidenceCount: 8,
    updatedAt: "2026-07-01",
  },
  {
    id: "downtown-mural-symbols",
    title: "Padrão de símbolos no mural do centro",
    description:
      "Investigadores notaram símbolos repetidos em uma sequência de mural que podem se relacionar a locais mostrados em imagens promocionais separadas.",
    image: heroImage,
    status: "classified",
    category: "symbol",
    location: "Centro de Leonida",
    evidenceCount: 6,
    updatedAt: "2026-06-30",
  },
  {
    id: "everglades-bunker-rumor",
    title: "Bunker escondido perto dos pântanos",
    description:
      "Uma teoria popular no mapa sugere uma estrutura oculta perto dos pântanos, mas as evidências visuais atuais são inconclusivas.",
    image: heroImage,
    status: "debunked",
    category: "location",
    location: "Pântanos de Leonida",
    evidenceCount: 4,
    updatedAt: "2026-06-29",
  },
  {
    id: "storm-horizon-flash",
    title: "Clarão da tempestade no horizonte",
    description:
      "Um clarão em um único quadro de uma sequência de tempestade foi catalogado como possível anomalia ambiental ou artefato de edição.",
    image: heroImage,
    status: "investigating",
    category: "phenomenon",
    location: "Litoral de Leonida",
    evidenceCount: 9,
    updatedAt: "2026-06-28",
  },
  {
    id: "pawn-shop-sticker-code",
    title: "Código dos adesivos da loja de penhores",
    description:
      "Membros da comunidade decifraram o layout de adesivos de uma foto de fachada e o relacionaram a uma sequência numérica recorrente.",
    image: heroImage,
    status: "confirmed",
    category: "community-discovery",
    location: "Vice City",
    evidenceCount: 15,
    updatedAt: "2026-06-27",
  },
  {
    id: "airport-runway-markings",
    title: "Marcações da pista ao entardecer",
    description:
      "Marcações repetidas na pista, vistas em imagens do entardecer, podem indicar uma referência de navegação escondida ou apenas um detalhe inspirado no mundo real.",
    image: heroImage,
    status: "community",
    category: "location",
    location: "Aeroporto Internacional de Leonida",
    evidenceCount: 7,
    updatedAt: "2026-06-26",
  },
  {
    // Investigação de demonstração com página de detalhe completa (ver investigacaoDetalhe.ts).
    id: "simbolos-vice-city",
    title: "Os símbolos misteriosos espalhados por Vice City estão conectados?",
    description:
      "Alguns símbolos identificados em diferentes locais podem fazer parte de um mesmo enigma. Dados demonstrativos.",
    image: heroImage,
    status: "investigating",
    category: "symbol",
    location: "Vice City",
    evidenceCount: 12,
    updatedAt: "2026-10-13",
  },
];

// Slides do carrossel da Home. Cada um aponta para uma investigação existente.
export const destaques: Destaque[] = [
  {
    id: "destaque-ovni",
    titulo: "OVNI avistado em Leonida?",
    descricao:
      "Relatos apontam luzes estranhas sobre o oceano na região de Vice Beach.",
    image: heroImage,
    investigacaoId: "vice-beach-night-lights",
  },
  {
    id: "destaque-radio",
    titulo: "Sinal estranho na Frequência 99.1",
    descricao:
      "Um sinal curto se repete em áudios da comunidade. A origem ainda é desconhecida.",
    image: heroImage,
    investigacaoId: "leonida-radio-loop",
  },
  {
    id: "destaque-bunker",
    titulo: "Bunker secreto perto de Vice Beach?",
    descricao:
      "Um mapa antigo indica uma estrutura próxima ao litoral. Nenhuma prova conclusiva foi encontrada.",
    image: heroImage,
    investigacaoId: "everglades-bunker-rumor",
  },
];
