    import styled from "styled-components";

export const Container = styled.div`
  width: min(1440px, calc(100% - 64px));
  margin: 0 auto;

  @media (max-width: 768px) {
    width: calc(100% - 32px);
  }
`;