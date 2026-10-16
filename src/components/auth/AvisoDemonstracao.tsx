"use client";

import styled from "styled-components";

export interface AvisoDemonstracaoProps {
  mensagem: string;
  // When true, the message is announced to assistive technology after a submit.
  anuncio?: boolean;
}

// Labels a form as a simulation. Nothing is saved and no session or account is created.
export function AvisoDemonstracao({ mensagem, anuncio = false }: AvisoDemonstracaoProps) {
  return (
    <Caixa role={anuncio ? "status" : undefined}>
      <Rotulo>Demonstração</Rotulo>
      {mensagem}
    </Caixa>
  );
}

const Caixa = styled.div`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.pink};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Rotulo = styled.span`
  display: block;
  margin-bottom: 4px;
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.pink};
`;
