import styled from "styled-components";

import type { AvatarSize } from "./Avatar.types";

const SIZES: Record<AvatarSize, string> = {
  small: "28px",
  medium: "40px",
};

// Initials avatar. A real image can be added later through the same component.
export const StyledAvatar = styled.span<{ $size: AvatarSize }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${({ $size }) => SIZES[$size]};
  height: ${({ $size }) => SIZES[$size]};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ $size, theme }) => ($size === "small" ? theme.fontSize.xs : theme.fontSize.sm)};
  font-weight: 700;
  line-height: 1;
  user-select: none;
`;
