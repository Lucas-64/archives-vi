import type { StaticImageData } from "next/image";

import type { StatusBadgeStatus } from "../components/ui/StatusBadge";
import type { TagTematica } from "../constants/tagsTematicas";

export type CaseStatus = StatusBadgeStatus;

export type CaseCategory =
  | "sighting"
  | "location"
  | "symbol"
  | "broadcast"
  | "phenomenon"
  | "community-discovery";

// Investigação como o card a mostra. Investigações vindas da API não têm imagem (sem upload), e as imagens de
// seção nunca entram em conteúdo de usuário: sem `image`, o card mostra um bloco neutro.
// `capa` é o endereço da imagem de capa enviada pela pessoa (investigações da API); só as páginas de investigação a
// usam (com a imagem padrão quando vazia, ADR-042). Mistérios não lê este campo.
export type CasoDeCard = Omit<Case, "image"> & { image?: Case["image"]; capa?: string };

export interface Case {
  id: string;
  title: string;
  description: string;
  image: StaticImageData | string;
  status: CaseStatus;
  category: CaseCategory;
  location?: string;
  evidenceCount?: number;
  updatedAt?: string;
  // Temas do catálogo controlado (ADR-018). Opcional: nenhum mock de investigação tem tags hoje.
  tags?: TagTematica[];
  // Vídeo do YouTube relacionado ao mistério. Só o link é guardado; o player é o do próprio YouTube.
  video?: { url: string; titulo?: string };
}
