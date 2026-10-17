"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

import type { NavItem } from "../../constants/routes";
import { isRotaAtiva } from "../../lib/navegacao";

export interface NavigationProps {
  items: readonly NavItem[];
  investigadoresOnline: number;
}

export function Navigation({ items, investigadoresOnline }: NavigationProps) {
  const pathname = usePathname() ?? "";

  return (
    <NavBar aria-label="Navegação principal">
      <List>
        {items.map((item) => {
          // Items without href are visual only: no link, no fake navigation.
          if (item.href === null) {
            return (
              <li key={item.label}>
                <Disabled aria-disabled="true">{item.label}</Disabled>
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

      {/* Demonstrative value: there is no backend or real-time presence yet. */}
      <Online>
        <OnlineDot aria-hidden="true" />
        <strong>{investigadoresOnline}</strong> investigadores online
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

const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 28px;
  list-style: none;
  min-width: 0;

  @media (max-width: 1279px) {
    gap: 20px;
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
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
  cursor: default;
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
