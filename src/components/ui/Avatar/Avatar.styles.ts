import styled from "styled-components";

import type { AvatarSize } from "./Avatar.types";

const SIZES: Record<AvatarSize, string> = {
  small: "28px",
  medium: "40px",
  large: "72px",
};

// Initials avatar. A real image can be added later through the same component.
// "large" is the identity of the personal profile (Meu Perfil, ADR-021): it uses the brand gradient.
export const StyledAvatar = styled.span<{ $size: AvatarSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => SIZES[$size]};
  height: ${({ $size }) => SIZES[$size]};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: ${({ $size, theme }) => ($size === "large" ? "0" : `1px solid ${theme.colors.border}`)};
  background: ${({ $size, theme }) =>
    $size === "large"
      ? `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
      : theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ $size, theme }) =>
    $size === "small" ? theme.fontSize.xs : $size === "large" ? theme.fontSize.lg : theme.fontSize.sm};
  font-weight: 700;
  line-height: 1;
  user-select: none;
`;
