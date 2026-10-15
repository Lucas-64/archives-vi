"use client";

import Link from "next/link";
import { useId } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";

export interface ComposerBloqueadoProps {
  rotulo?: string;
  placeholder?: string;
}

// Disabled comment composer. Sending requires authentication, which does not exist yet,
// so nothing is saved and the user is directed to sign in.
export function ComposerBloqueado({
  rotulo = "Escreva um comentário",
  placeholder = "Entre na sua conta para comentar",
}: ComposerBloqueadoProps) {
  const id = useId();

  return (
    <Composer>
      <Label htmlFor={id}>{rotulo}</Label>
      <Textarea id={id} rows={3} disabled placeholder={placeholder} />
      <Acoes>
        <EntrarLink href={ROUTES.entrar}>Entre para comentar</EntrarLink>
        <SubmitDisabled type="button" disabled>
          Publicar comentário
        </SubmitDisabled>
      </Acoes>
    </Composer>
  );
}

const Composer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const EntrarLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};
`;

const SubmitDisabled = styled.button`
  min-height: 40px;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: not-allowed;
  opacity: 0.6;
`;
