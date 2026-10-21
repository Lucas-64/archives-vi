import { pgTable, text } from "drizzle-orm/pg-core";

// Catálogo fechado de temas (ADR-018). Os mesmos ids de src/constants/tagsTematicas.ts; um teste confere
// a igualdade. As linhas são dados de referência e entram pela própria migração.
export const CATALOGO_TAGS = [
  { id: "ovnis-extraterrestres", rotulo: "OVNIs e extraterrestres" },
  { id: "criaturas-lendas", rotulo: "Criaturas e lendas" },
  { id: "easter-eggs-segredos", rotulo: "Easter eggs e segredos" },
  { id: "simbolos-mensagens", rotulo: "Símbolos e mensagens" },
  { id: "audio-transmissoes", rotulo: "Áudio e transmissões" },
  { id: "locais-mapas", rotulo: "Locais e mapas" },
  { id: "crimes-acontecimentos", rotulo: "Crimes e acontecimentos" },
  { id: "teorias-conexoes", rotulo: "Teorias e conexões" },
] as const;

export type IdTag = (typeof CATALOGO_TAGS)[number]["id"];
export const IDS_TAGS = CATALOGO_TAGS.map((tag) => tag.id) as [IdTag, ...IdTag[]];

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  rotulo: text("rotulo").notNull(),
});
