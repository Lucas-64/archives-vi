import styled, { css } from "styled-components";

interface CampoProps {
  $invalid: boolean;
}

// Shared by Input and Textarea so both fields look the same.
export const campoBase = css<CampoProps>`
  width: 100%;
  min-width: 0;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid ${({ $invalid, theme }) => ($invalid ? theme.colors.debunked : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fontSize.md};
  line-height: 1.5;
  transition: border-color ${({ theme }) => theme.transitions.default};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 1;
  }

  &:hover:not(:disabled) {
    border-color: ${({ $invalid, theme }) => ($invalid ? theme.colors.debunked : theme.colors.purple)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const StyledInput = styled.input<CampoProps>`
  ${campoBase}
  min-height: 44px;
`;
