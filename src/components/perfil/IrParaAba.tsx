"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

import { definirParametroDaUrl } from "./localizacao";

export interface IrParaAbaProps {
  // Chave de parâmetro da aba (ver ABAS_MEU_PERFIL). A aba padrão não usa este componente.
  aba: string;
  children: ReactNode;
}

// Troca a aba de Meu Perfil sem recarregar a página. Usa o mesmo caminho do AbasPerfil (ADR-017):
// atualiza ?aba= e avisa o cliente, então voltar e avançar do navegador também funcionam.
export function IrParaAba({ aba, children }: IrParaAbaProps) {
  return (
    <Botao type="button" onClick={() => definirParametroDaUrl("aba", aba)}>
      {children}
    </Botao>
  );
}

const Botao = styled.button`
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  color: ${({ theme }) => theme.colors.pink};
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
