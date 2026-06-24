import styled from "styled-components";
import { Container } from "./Container";

export function Header() {
  return (
    <HeaderContainer>
      <Container>
        {/* logo, nav e botões aqui dentro */}
      </Container>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;