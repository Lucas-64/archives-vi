"use client";

import Link from "next/link";
import styled from "styled-components";

export interface FilterTab {
  label: string;
  href: string;
  active: boolean;
}

export interface FilterTabsProps {
  label: string;
  tabs: FilterTab[];
}

// Server-driven filter: each tab is a link, so the filter lives in the URL and works without JavaScript.
export function FilterTabs({ label, tabs }: FilterTabsProps) {
  return (
    <Nav aria-label={label}>
      <List>
        {tabs.map((tab) => (
          <li key={tab.label}>
            <TabLink
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              $active={tab.active}
            >
              {tab.label}
            </TabLink>
          </li>
        ))}
      </List>
    </Nav>
  );
}

const Nav = styled.nav`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

// Horizontal scroll stays available on very narrow screens, but the global
// purple scrollbar is hidden so it does not appear as a stray bar next to the tabs.
const List = styled.ul`
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scrollbar-width: none;
  list-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabLink = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.textSecondary};

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
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
