"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { sairDaApi } from "../../lib/autenticacaoApi";
import { useSessao } from "../auth/SessaoProvider";

// Encerra a sessão no servidor (revoga o token e apaga o cookie) e relê a página já como visitante.
export function BotaoSair() {
  const router = useRouter();
  const { atualizar } = useSessao();
  const [saindo, setSaindo] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    setFalhou(false);
    if (await sairDaApi()) {
      await atualizar();
      router.replace(ROUTES.inicio);
      return;
    }
    setSaindo(false);
    setFalhou(true);
  }

  return (
    <>
      <Botao type="button" onClick={sair} disabled={saindo} aria-busy={saindo || undefined}>
        Sair
      </Botao>
      {falhou ? <Falha role="alert">Não foi possível sair. Tente de novo.</Falha> : null}
    </>
  );
}

const Botao = styled.button`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color ${({ theme }) => theme.transitions.default};

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const Falha = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.debunked};
`;
