"use client";

import Link from "next/link";
import styled from "styled-components";
import { FiSearch } from "react-icons/fi";

import { MAIN_NAV, ROUTES } from "../../constants/routes";
import { Navigation } from "./Navigation";

export interface HeaderProps {
  investigadoresOnline: number;
}

export function Header({ investigadoresOnline }: HeaderProps) {
  return (
    <HeaderContainer>
      <TopRow>
        <Brand href={ROUTES.inicio}>
          <Logo>
            ARCHIVES <span>VI</span>
          </Logo>
          <Subtitle>A verdade está escondida em Leonida</Subtitle>
        </Brand>

        <Actions>
          <ActionLink href={ROUTES.buscar} aria-label="Buscar">
            <FiSearch aria-hidden="true" />
            <span>Buscar</span>
          </ActionLink>
          <ActionLink href={ROUTES.entrar}>Entrar</ActionLink>
          <PrimaryLink href={ROUTES.criarConta}>Criar conta</PrimaryLink>
        </Actions>
      </TopRow>

      <Navigation items={MAIN_NAV} investigadoresOnline={investigadoresOnline} />
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  padding: 20px 48px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 767px) {
    padding: 16px 16px 12px;
    gap: 12px;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Logo = styled.span`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.text};
  text-transform: uppercase;

  span {
    color: ${({ theme }) => theme.colors.pink};
    font-style: italic;
    text-shadow: ${({ theme }) => theme.shadows.glowPink};
  }

  @media (max-width: 767px) {
    font-size: 26px;
  }
`;

const Subtitle = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.pink};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color ${({ theme }) => theme.transitions.default};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: 767px) {
    span {
      display: none;
    }
  }
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.pink},
    ${({ theme }) => theme.colors.purple}
  );
  box-shadow: ${({ theme }) => theme.shadows.glowPink};

  @media (max-width: 767px) {
    display: none;
  }
`;
