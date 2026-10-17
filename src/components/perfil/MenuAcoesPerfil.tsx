"use client";

import { useId, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import styled from "styled-components";

import { Button } from "../ui/Button";

// Menu de ações sociais do perfil. Denunciar e bloquear dependem de conta e de moderação, que
// ainda não existem: os itens aparecem desabilitados, sem simular o efeito.
export function MenuAcoesPerfil() {
  const [aberto, setAberto] = useState(false);
  const menuId = useId();

  return (
    <Wrapper>
      <Button
        type="button"
        variant="ghost"
        size="small"
        aria-expanded={aberto}
        aria-controls={menuId}
        aria-label="Mais ações do perfil"
        onClick={() => setAberto((valor) => !valor)}
      >
        <FiMoreHorizontal aria-hidden="true" />
      </Button>

      {aberto ? (
        <Painel id={menuId}>
          <Lista>
            <li>
              <Button type="button" variant="ghost" size="small" disabled>
                Denunciar
              </Button>
            </li>
            <li>
              <Button type="button" variant="ghost" size="small" disabled>
                Bloquear
              </Button>
            </li>
          </Lista>
          <Nota>Denunciar e bloquear exigem conta. A moderação ainda não existe nesta versão.</Nota>
        </Painel>
      ) : null}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const Painel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 240px;
  max-width: calc(100vw - 32px);
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
