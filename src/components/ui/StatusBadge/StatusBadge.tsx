"use client";

import { Badge } from "../Badge";
import type {
  StatusBadgeConfig,
  StatusBadgeProps,
  StatusBadgeStatus,
} from "./StatusBadge.types";

// Rótulos internos em português. Os estados (chaves) não mudam.
const STATUS_BADGE_CONFIG: Record<StatusBadgeStatus, StatusBadgeConfig> = {
  investigating: {
    label: "Em andamento",
    variant: "warning",
  },
  confirmed: {
    label: "Confirmado",
    variant: "success",
  },
  debunked: {
    label: "Desmentido",
    variant: "danger",
  },
  classified: {
    label: "Classificado",
    variant: "secondary",
  },
  community: {
    label: "Comunidade",
    variant: "info",
  },
};

export function StatusBadge({
  status,
  label,
  size = "medium",
  uppercase = false,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <Badge
      dot
      size={size}
      uppercase={uppercase}
      variant={config.variant}
      {...props}
    >
      {label ?? config.label}
    </Badge>
  );
}
