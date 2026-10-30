import type { HTMLAttributes } from "react";

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  // Name used to derive the initials. The visible name is expected next to the avatar,
  // so the avatar itself is decorative (aria-hidden).
  nome: string;
  size?: AvatarSize;
  // Imagem enviada pela pessoa (URL pública do Blob). Sem ela, valem as iniciais.
  src?: string | null;
}
