import styled from "styled-components";
import { Container } from "../layout/Container";

export function Hero() {
  return (
    <Section>
      <Container>
        <HeroCard>
          <Content>
            <CaseNumber>CASE #001</CaseNumber>

            <Title>
              UFO spotted
              <br />
              over Leonida?
            </Title>

            <Description>
              Reports indicate strange lights above Vice Beach. Players are
              gathering screenshots and investigating possible patterns.
            </Description>

            <OpenCaseButton>Open Case</OpenCaseButton>
          </Content>
        </HeroCard>
      </Container>
    </Section>
  );
}

const Section = styled.section`
  padding: 48px 0;
`;

const HeroCard = styled.div`
  min-height: 500px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};

  background:
    linear-gradient(
      90deg,
      rgba(9, 11, 18, 0.95) 0%,
      rgba(9, 11, 18, 0.75) 40%,
      rgba(9, 11, 18, 0.2) 100%
    ),
    import heroImage from "../../assets/images/hero.jpg";

  background-size: cover;
  background-position: center;

  border: 1px solid ${({ theme }) => theme.colors.border};

  display: flex;
  align-items: center;
`;

const Content = styled.div`
  max-width: 550px;
  padding: 64px;
`;

const CaseNumber = styled.span`
  color: ${({ theme }) => theme.colors.pink};
  font-weight: 700;
  letter-spacing: 2px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.hero};
  line-height: 1;
  margin: 20px 0;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.8;
  margin-bottom: 32px;
`;

const OpenCaseButton = styled.button`
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.md};

  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.pink},
    ${({ theme }) => theme.colors.purple}
  );

  color: white;
  font-weight: 700;
`;