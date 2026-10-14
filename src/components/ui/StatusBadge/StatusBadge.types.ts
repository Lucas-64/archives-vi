import type { HTMLAttributes } from "react";
import type { BadgeSize, BadgeVariant } from "../Badge";

export type StatusBadgeStatus =
  | "investigating"
  | "confirmed"
  | "debunked"
  | "classified"
  | "community";

export interface StatusBadgeConfig {
  label: string;
  variant: BadgeVariant;
}

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusBadgeStatus;
  label?: string;
  size?: BadgeSize;
  uppercase?: boolean;
}
