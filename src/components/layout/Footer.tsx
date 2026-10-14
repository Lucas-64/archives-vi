"use client";

import styled from "styled-components";

// Minimal footer approved in the project review. Copyright notice is taken from README.md.
export function Footer() {
  return (
    <FooterContainer>
      <Brand>
        ARCHIVES <span>VI</span>
      </Brand>
      <Notice>
        Este site tem fins educacionais e de demonstração de portfólio. Grand
        Theft Auto VI e todos os recursos relacionados pertencem à Rockstar
        Games.
      </Notice>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  margin-top: 48px;
  padding: 32px 48px 96px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};

  @media (min-width: 768px) {
    padding-bottom: 32px;
  }
`;

const Brand = styled.p`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};

  span {
    color: ${({ theme }) => theme.colors.pink};
    font-style: italic;
  }
`;

const Notice = styled.p`
  max-width: 720px;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
