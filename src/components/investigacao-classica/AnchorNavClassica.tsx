"use client";

// Cópia dedicada da versão de components/investigacao/AnchorNav.tsx do commit 355b30ad (ADR-041). Usada só pelas páginas de investigação;
// Mistérios continua usando o componente atual. Não editar para ajustar Mistérios.
import styled from "styled-components";

// Stable ids of the investigation sections. Keep in sync with the Secao ids in the page.
const ITENS = [
  { id: "teoria", rotulo: "Teoria" },
  { id: "evidencias", rotulo: "Evidências" },
  { id: "discussao", rotulo: "Discussão" },
  { id: "localizacao", rotulo: "Localização" },
  { id: "historico", rotulo: "Histórico" },
];

// Anchor navigation. Sticky on desktop, static on mobile. No scroll library.
export function AnchorNavClassica() {
  return (
    <Nav aria-label="Seções da investigação">
      <List>
        {ITENS.map((item) => (
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
