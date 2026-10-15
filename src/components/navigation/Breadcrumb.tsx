"use client";

import Link from "next/link";
import styled from "styled-components";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  itens: BreadcrumbItem[];
}

// The last item is the current page: it has no href and is marked with aria-current.
export function Breadcrumb({ itens }: BreadcrumbProps) {
  return (
    <Nav aria-label="Caminho da página">
      <List>
        {itens.map((item, index) => {
          const atual = index === itens.length - 1;
          return (
            <Item key={item.label}>
              {item.href && !atual ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={atual ? "page" : undefined}>{item.label}</span>
              )}
            </Item>
          );
        })}
      </List>
    </Nav>
  );
}

const Nav = styled.nav`
  width: 100%;
  min-width: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const List = styled.ol`
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  min-width: 0;
  width: 100%;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 0;
  white-space: nowrap;

  &:last-child {
    flex-shrink: 1;
    min-width: 0;
  }

  &:last-child > span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & + &::before {
    content: "›";
    color: ${({ theme }) => theme.colors.border};
  }

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.pink};
  }

  span[aria-current="page"] {
    color: ${({ theme }) => theme.colors.text};
  }
`;
