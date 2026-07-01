import { StyledCard } from "./Card.styles";
import type { CardProps } from "./Card.types";

export function Card({
  children,
  variant = "default",
  padding = "medium",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <StyledCard
      $hoverable={hoverable}
      $padding={padding}
      $variant={variant}
      {...props}
    >
      {children}
    </StyledCard>
  );
}
