"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import styled from "styled-components";

import { INVESTIGADORES_ONLINE_DEMO } from "../../constants/demonstracao";
import type { NavItem } from "../../constants/routes";
import { isRotaAtiva } from "../../lib/navegacao";

export interface NavigationProps {
  items: readonly NavItem[];
}

export function Navigation({ items }: NavigationProps) {
  const pathname = usePathname() ?? "";
  const idLista = useId();
  // Abaixo de 1280px os sete itens não cabem em uma linha: a lista recolhe atrás do botão "Menu".
  const [aberto, setAberto] = useState(false);

  return (
    <NavBar aria-label="Navegação principal">
      <Alternar
        type="button"
        aria-expanded={aberto}
        aria-controls={idLista}
        onClick={() => setAberto((valor) => !valor)}
      >
        {aberto ? "Fechar menu" : "Menu"}
      </Alternar>

      <List id={idLista} $aberto={aberto}>
        {items.map((item) => {
          // Itens sem href são visuais ("em breve"): sem link e sem navegação falsa.
          if (item.href === null) {
            return (
              <li key={item.label}>
                <Disabled aria-disabled="true">
                  {item.label}
                  <EmBreve>em breve</EmBreve>
                </Disabled>
              </li>
            );
          }

          const isActive = isRotaAtiva(pathname, item.href);

          return (
            <li key={item.label}>
              <NavLink
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                $active={isActive}
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </List>

      {/* Valor de demonstração (ADR-036): não existe presença em tempo real. */}
      <Online>
        <OnlineDot aria-hidden="true" />
        <strong>{INVESTIGADORES_ONLINE_DEMO}</strong> investigadores online
        <Demo>demonstração</Demo>
      </Online>
    </NavBar>
  );
}

const NavBar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0 24px;
  padding: 0 24px;
  min-height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 767px) {
    display: none;
  }
`;

const List = styled.ul<{ $aberto: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  list-style: none;
  min-width: 0;

  @media (max-width: 1279px) {
    display: ${({ $aberto }) => ($aberto ? "flex" : "none")};
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    order: 3;
    flex-basis: 100%;
    padding-bottom: 8px;
  }
`;

const Alternar = styled.button`
  display: none;
  align-items: center;
  min-height: 52px;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  @media (min-width: 768px) and (max-width: 1279px) {
    display: inline-flex;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const linkBase = `
  display: inline-flex;
  align-items: center;
  min-height: 52px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  ${linkBase}
  position: relative;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.textSecondary};
  transition: color ${({ theme }) => theme.transitions.default};

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.pink};
    opacity: ${({ $active }) => ($active ? 1 : 0)};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Disabled = styled.span`
  ${linkBase}
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
  cursor: default;
`;

const EmBreve = styled.small`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: lowercase;
`;

const Online = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;

  strong {
    color: ${({ theme }) => theme.colors.confirmed};
    font-weight: 700;
  }
`;

const OnlineDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.confirmed};
`;

const Demo = styled.small`
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
`;
