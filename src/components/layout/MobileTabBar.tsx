"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import {
  FiEye,
  FiFileText,
  FiHome,
  FiPlusSquare,
  FiSearch,
} from "react-icons/fi";
import type { IconType } from "react-icons";

import { MOBILE_NAV } from "../../constants/routes";
import { isRotaAtiva } from "../../lib/navegacao";

// Icons are matched to the functional items by label. Labels come from MOBILE_NAV.
const ICONS: Record<string, IconType> = {
  Início: FiHome,
  Mistérios: FiEye,
  Teorias: FiFileText,
  Criar: FiPlusSquare,
  Buscar: FiSearch,
};

export function MobileTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <TabBar aria-label="Navegação inferior">
      {MOBILE_NAV.map((item) => {
        const Icon = ICONS[item.label] ?? FiHome;
        const active = isRotaAtiva(pathname, item.href);

        return (
          <TabLink
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            $active={active}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{item.label}</span>
          </TabLink>
        );
      })}
    </TabBar>
  );
}

const TabBar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: none;
  justify-content: space-around;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 767px) {
    display: flex;
  }
`;

const TabLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 56px;
  min-height: 48px;
  padding: 4px 6px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.pink : theme.colors.textSecondary};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
