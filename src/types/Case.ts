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
}
