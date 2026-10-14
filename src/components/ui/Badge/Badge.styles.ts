import styled, { css } from "styled-components";
import type { BadgeSize, BadgeVariant } from "./Badge.types";

interface StyledBadgeProps {
  $size: BadgeSize;
  $uppercase: boolean;
  $variant: BadgeVariant;
}

interface DotProps {
  $variant: BadgeVariant;
}

const sizeStyles = {
  small: css`
    min-height: 22px;
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fontSize.xs};
  `,
  medium: css`
    min-height: 28px;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.fontSize.sm};
  `,
};

const variantStyles = {
  default: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.card};
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
  primary: css`
    border-color: transparent;
    background: rgba(255, 79, 163, 0.14);
    color: ${({ theme }) => theme.colors.pink};
  `,
  secondary: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text};
  `,
  success: css`
    border-color: transparent;
    background: rgba(16, 185, 129, 0.14);
    color: ${({ theme }) => theme.colors.confirmed};
  `,
  warning: css`
    border-color: transparent;
    background: rgba(251, 191, 36, 0.14);
    color: ${({ theme }) => theme.colors.investigating};
  `,
  danger: css`
    border-color: transparent;
    background: rgba(239, 68, 68, 0.14);
    color: ${({ theme }) => theme.colors.debunked};
  `,
  info: css`
    border-color: transparent;
    background: rgba(59, 130, 246, 0.14);
    color: ${({ theme }) => theme.colors.unexplained};
  `,
};

const dotColors = {
  default: css`
    background: ${({ theme }) => theme.colors.textSecondary};
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.pink};
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.text};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.confirmed};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.investigating};
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.debunked};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.unexplained};
  `,
};

export const StyledBadge = styled.span<StyledBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: fit-content;
  border: 1px solid;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  transition:
    background ${({ theme }) => theme.transitions.default},
    border-color ${({ theme }) => theme.transitions.default},
    color ${({ theme }) => theme.transitions.default};

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  ${({ $uppercase }) =>
    $uppercase &&
    css`
      text-transform: uppercase;
    `}
`;

export const Dot = styled.span<DotProps>`
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: ${({ theme }) => theme.borderRadius.pill};

  ${({ $variant }) => dotColors[$variant]}
`;
