"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { FiSearch } from "react-icons/fi";

import { MAIN_NAV, ROUTES } from "../../constants/routes";
import { isRotaAtiva } from "../../lib/navegacao";
import { useSessao } from "../auth/SessaoProvider";
import { BotaoSair } from "./BotaoSair";
import { Navigation } from "./Navigation";

export function Header() {
  const { estado } = useSessao();
  const pathname = usePathname() ?? "";
  const ativo = (href: string) => isRotaAtiva(pathname, href);

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
          <ActionLink
            href={ROUTES.buscar}
            aria-label="Buscar"
            aria-current={ativo(ROUTES.buscar) ? "page" : undefined}
            $active={ativo(ROUTES.buscar)}
          >
            <FiSearch aria-hidden="true" />
            <span>Buscar</span>
          </ActionLink>
          <DesktopActionLink
            href={ROUTES.criadores}
            aria-current={ativo(ROUTES.criadores) ? "page" : undefined}
            $active={ativo(ROUTES.criadores)}
          >
            Criadores
          </DesktopActionLink>
          <DesktopActionLink
            href={ROUTES.criar}
            aria-current={ativo(ROUTES.criar) ? "page" : undefined}
            $active={ativo(ROUTES.criar)}
          >
            Criar teoria
          </DesktopActionLink>
          {estado === "autenticado" ? (
            <>
              <ActionLink
                href={ROUTES.meuPerfil}
                aria-current={ativo(ROUTES.meuPerfil) ? "page" : undefined}
                $active={ativo(ROUTES.meuPerfil)}
              >
                Meu perfil
              </ActionLink>
              <BotaoSair />
            </>
          ) : estado === "carregando" ? (
            // Até a sessão ser conhecida, não se mostra nenhuma opção dependente dela; o espaço é reservado.
            <ReservaSessao aria-hidden="true" />
          ) : (
            <>
              <ActionLink
                href={ROUTES.entrar}
                aria-current={ativo(ROUTES.entrar) ? "page" : undefined}
                $active={ativo(ROUTES.entrar)}
              >
                Entrar
              </ActionLink>
              <PrimaryLink href={ROUTES.criarConta}>Criar conta</PrimaryLink>
            </>
          )}
        </Actions>
      </TopRow>

      <Navigation items={MAIN_NAV} />
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

const ActionLink = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.textSecondary)};
  transition: color ${({ theme }) => theme.transitions.default};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media (max-width: 767px) {
    span {
      display: none;
    }
  }
`;

// Desktop-only text actions. Below 768px the mobile tab bar provides these routes.
const DesktopActionLink = styled(ActionLink)`
  @media (max-width: 767px) {
    display: none;
  }
`;

// Ocupa o lugar dos botões de sessão enquanto ela é consultada, para o cabeçalho não "pular".
const ReservaSessao = styled.span`
  display: inline-block;
  width: 168px;
  height: 40px;

  @media (max-width: 767px) {
    width: 72px;
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
    ${({ theme }) => theme.colors.gradientStart},
    ${({ theme }) => theme.colors.gradientEnd}
  );
  box-shadow: ${({ theme }) => theme.shadows.glowPink};

  @media (max-width: 767px) {
    display: none;
  }
`;
