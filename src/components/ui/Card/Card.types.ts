import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "default" | "elevated" | "outlined" | "glass";

export type CardPadding = "none" | "small" | "medium" | "large";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
}
