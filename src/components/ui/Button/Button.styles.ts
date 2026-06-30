import styled, { css, keyframes } from "styled-components";
import type { ButtonSize, ButtonVariant } from "./Button.types";

interface StyledButtonProps {
  $size: ButtonSize;
  $variant: ButtonVariant;
  $loading: boolean;
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const sizeStyles = {
  small: css`
    min-height: 36px;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.fontSize.sm};
  `,
  medium: css`
    min-height: 44px;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    font-size: ${({ theme }) => theme.fontSize.md};
  `,
  large: css`
    min-height: 52px;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
    font-size: ${({ theme }) => theme.fontSize.lg};
  `,
};

const variantStyles = {
  primary: css`
    border-color: transparent;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.pink},
      ${({ theme }) => theme.colors.purple}
    );
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.glowPink};

    &:hover:not(:disabled) {
      box-shadow: ${({ theme }) => theme.shadows.glowPurple};
      transform: translateY(-1px);
    }
  `,
  secondary: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    color: ${({ theme }) => theme.colors.text};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.purple};
      color: ${({ theme }) => theme.colors.white};
    }
  `,
  outline: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.pink};
      background: rgba(255, 79, 163, 0.08);
      color: ${({ theme }) => theme.colors.white};
    }
  `,
  ghost: css`
    border-color: transparent;
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.backgroundSecondary};
      color: ${({ theme }) => theme.colors.text};
    }
  `,
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: 1px solid;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.default},
    border-color ${({ theme }) => theme.transitions.default},
    color ${({ theme }) => theme.transitions.default},
    box-shadow ${({ theme }) => theme.transitions.default},
    transform ${({ theme }) => theme.transitions.default};

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  ${({ $loading }) =>
    $loading &&
    css`
      cursor: wait;
    `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
    box-shadow: none;
  }
`;

export const Spinner = styled.span`
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  animation: ${spin} 0.75s linear infinite;
`;
