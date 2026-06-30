import styled from "styled-components";

export function Hero() {
  return (
    <Section>
      <FeaturedCard>
        <Content>
          <Tag>Featured Case</Tag>
          <Title>UFO spotted over Leonida?</Title>
          <Description>
            Reports indicate strange lights over Vice Beach. The community is
            gathering evidence and tracking sightings across the map.
          </Description>
          <Button type="button">Open Case</Button>
        </Content>
      </FeaturedCard>

      <SideCard>
        <Online>
          <span />
          <strong>312</strong> investigators online
        </Online>

        <h3>Latest forum topics</h3>

        <Topic>
          <p>Possible sea creature spotted?</p>
          <strong>24</strong>
        </Topic>

        <Topic>
          <p>Strange signal on Frequency 99.1</p>
          <strong>32</strong>
        </Topic>

        <Topic>
          <p>Secret bunker near Vice Beach?</p>
          <strong>17</strong>
        </Topic>
      </SideCard>
    </Section>
  );
}

const Section = styled.section`
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 48px;
  display: grid;
  grid-template-columns: 1fr 370px;
  gap: 24px;
`;

const FeaturedCard = styled.div`
  min-height: 520px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  position: relative;
  background:
    linear-gradient(
      90deg,
      rgba(9, 11, 18, 0.95) 0%,
      rgba(9, 11, 18, 0.65) 45%,
      rgba(9, 11, 18, 0.25) 100%
    ),
    url("/src/assets/images/hero.jpg");
  background-size: cover;
  background-position: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Content = styled.div`
  max-width: 560px;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Tag = styled.span`
  color: ${({ theme }) => theme.colors.pink};
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 24px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const Button = styled.button`
  width: fit-content;
  padding: 14px 22px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.pink},
    ${({ theme }) => theme.colors.purple}
  );
`;

const SideCard = styled.aside`
  padding: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};

  h3 {
    margin: 32px 0 20px;
    text-transform: uppercase;
    font-size: 18px;
  }
`;

const Online = styled.div`
  padding: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textSecondary};

  span {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.confirmed};
    margin-right: 10px;
  }

  strong {
    color: ${({ theme }) => theme.colors.confirmed};
    margin-right: 4px;
  }
`;

const Topic = styled.div`
  padding: 18px 0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  p {
    color: ${({ theme }) => theme.colors.text};
  }

  strong {
    color: ${({ theme }) => theme.colors.pink};
  }
`;
