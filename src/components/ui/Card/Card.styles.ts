import styled, { css } from "styled-components";
import type { CardPadding, CardVariant } from "./Card.types";

interface StyledCardProps {
  $hoverable: boolean;
  $padding: CardPadding;
  $variant: CardVariant;
}

const paddingStyles = {
  none: css`
    padding: 0;
  `,
  small: css`
    padding: ${({ theme }) => theme.spacing.md};
  `,
  medium: css`
    padding: ${({ theme }) => theme.spacing.lg};
  `,
  large: css`
    padding: ${({ theme }) => theme.spacing.xl};
  `,
};

const variantStyles = {
  default: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.card};
    box-shadow: none;
  `,
  elevated: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.card};
    box-shadow: ${({ theme }) => theme.shadows.card};
  `,
  outlined: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: transparent;
    box-shadow: none;
  `,
  glass: css`
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(20, 26, 36, 0.72);
    box-shadow: ${({ theme }) => theme.shadows.card};
    backdrop-filter: blur(14px);
  `,
};

export const StyledCard = styled.div<StyledCardProps>`
  border: 1px solid;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  color: ${({ theme }) => theme.colors.text};
  transition:
    border-color ${({ theme }) => theme.transitions.default},
    box-shadow ${({ theme }) => theme.transitions.default},
    transform ${({ theme }) => theme.transitions.default};

  ${({ $padding }) => paddingStyles[$padding]}
  ${({ $variant }) => variantStyles[$variant]}

  ${({ $hoverable }) =>
    $hoverable &&
    css`
      &:hover {
        border-color: ${({ theme }) => theme.colors.pink};
        box-shadow: ${({ theme }) => theme.shadows.glowPink};
        transform: translateY(-2px);
      }
    `}
`;
