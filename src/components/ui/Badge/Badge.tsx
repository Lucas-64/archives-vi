"use client";

import { Dot, StyledBadge } from "./Badge.styles";
import type { BadgeProps } from "./Badge.types";

export function Badge({
  children,
  variant = "default",
  size = "medium",
  uppercase = false,
  dot = false,
  ...props
}: BadgeProps) {
  return (
    <StyledBadge
      $size={size}
      $uppercase={uppercase}
      $variant={variant}
      {...props}
    >
      {dot ? <Dot $variant={variant} aria-hidden="true" /> : null}
      {children}
    </StyledBadge>
  );
}
