// Catálogo controlado de tags temáticas (docs/features/perfil-social.md, decisão 2; ADR-018).
// Investigações e publicações usam o mesmo catálogo. O `id` é o valor canônico: está na URL (?tag=),
// nos mocks e nas comparações. O `rotulo` é o texto exibido. A ordem é a da especificação.
// Tags não são patentes, especializações nem distintivos.
export const TAGS_TEMATICAS = [
  { id: "ovnis-extraterrestres", rotulo: "OVNIs e extraterrestres" },
  { id: "criaturas-lendas", rotulo: "Criaturas e lendas" },
  { id: "easter-eggs-segredos", rotulo: "Easter eggs e segredos" },
  { id: "simbolos-mensagens", rotulo: "Símbolos e mensagens" },
  { id: "audio-transmissoes", rotulo: "Áudio e transmissões" },
  { id: "locais-mapas", rotulo: "Locais e mapas" },
  { id: "crimes-acontecimentos", rotulo: "Crimes e acontecimentos" },
  { id: "teorias-conexoes", rotulo: "Teorias e conexões" },
] as const;

// União fechada: só os ids do catálogo são aceitos pelo TypeScript, nos mocks e nas funções.
export type TagTematica = (typeof TAGS_TEMATICAS)[number]["id"];
