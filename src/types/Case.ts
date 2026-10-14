import type { StaticImageData } from "next/image";

import type { StatusBadgeStatus } from "../components/ui/StatusBadge";

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
}
