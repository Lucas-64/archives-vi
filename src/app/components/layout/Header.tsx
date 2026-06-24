import styled from "styled-components";
import { FiSearch } from "react-icons/fi";

export function Header() {
  return (
    <HeaderContainer>
      <LogoArea>
        <Logo>ARCHIVES <span>VI</span></Logo>
        <Subtitle>Truth is hidden in Leonida</Subtitle>
      </LogoArea>

      <Nav>
        <a href="#">Home</a>
        <a href="#">Cases</a>
        <a href="#">Theories</a>
        <a href="#">Map</a>
        <a href="#">Gallery</a>
        <a href="#">Forum</a>
      </Nav>

      <Actions>
        <button>Search <FiSearch /></button>
        <button className="primary">Create account</button>
      </Actions>
    </  HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  padding: 24px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const LogoArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Logo = styled.h1`
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.text};

  span {
    color: ${({ theme }) => theme.colors.pink};
    text-shadow: ${({ theme }) => theme.shadows.glowPink};
  }
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.pink};
`;

const Nav = styled.nav`
  display: flex;
  gap: 28px;

  a {
    font-size: 15px;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: ${({ theme }) => theme.transitions.default};

    &:hover {
      color: ${({ theme }) => theme.colors.pink};
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;

  button {
    padding: 10px 18px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    color: ${({ theme }) => theme.colors.text};
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.border};

    &.primary {
      background: linear-gradient(
        135deg,
        ${({ theme }) => theme.colors.pink},
        ${({ theme }) => theme.colors.purple}
      );
      border: none;
    }
  }
`;