import { StyledAvatar } from "./Avatar.styles";
import type { AvatarProps } from "./Avatar.types";

// Up to two initials from the name: "Lucas Andrade" -> "LA".
export function iniciaisDe(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({ nome, size = "medium", ...props }: AvatarProps) {
  return (
    <StyledAvatar aria-hidden="true" $size={size} {...props}>
      {iniciaisDe(nome)}
    </StyledAvatar>
  );
}
