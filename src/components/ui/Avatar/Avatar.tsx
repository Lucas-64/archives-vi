import Image from "next/image";
import { useState } from "react";

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

const PIXELS = { small: 28, medium: 40, large: 72 } as const;

export function Avatar({ nome, size = "medium", src, ...props }: AvatarProps) {
  const [falhou, setFalhou] = useState(false);
  return (
    <StyledAvatar aria-hidden="true" $size={size} {...props}>
      {src && !falhou ? (
        <Image src={src} alt="" fill sizes={`${PIXELS[size]}px`} onError={() => setFalhou(true)} style={{ objectFit: "cover" }} />
      ) : (
        iniciaisDe(nome)
      )}
    </StyledAvatar>
  );
}
