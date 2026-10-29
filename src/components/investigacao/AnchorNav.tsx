"use client";

import styled from "styled-components";

// Stable ids of the investigation sections. Keep in sync with the Secao ids in the page.
const ITENS_PADRAO = [
  { id: "teoria", rotulo: "Teoria" },
  { id: "evidencias", rotulo: "Evidências" },
  { id: "historico", rotulo: "Histórico" },
];

// Anchor navigation. Sticky on desktop, static on mobile. No scroll library.
// `itens` e `rotulo` permitem reutilizar a navegação em outras telas com as mesmas seções (por exemplo, as
// etapas de criar mistério). Sem props, o comportamento é o da página da comunidade.
export interface AnchorNavProps {
  itens?: readonly { id: string; rotulo: string }[];
  rotulo?: string;
}

export function AnchorNav({ itens = ITENS_PADRAO, rotulo = "Seções da investigação" }: AnchorNavProps = {}) {
  return (
    <Nav aria-label={rotulo}>
      <List>
        {itens.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.rotulo}</a>
          </li>
        ))}
      </List>
    </Nav>
  );
}

const Nav = styled.nav`
  position: sticky;
  top: 16px;
  z-index: 5;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  @media (max-width: 767px) {
    position: static;
  }
`;

const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  list-style: none;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: color ${({ theme }) => theme.transitions.default};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
