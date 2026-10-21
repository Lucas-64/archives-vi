"use client";

import Link from "next/link";
import styled from "styled-components";

import heroImage from "../../assets/images/hero.jpg";
import { ROUTES } from "../../constants/routes";

// Banner de abertura da Home. Texto institucional fixo e imagem do site (não é conteúdo de usuário).
// O antigo carrossel "Em destaque" dependia de destaques demonstrativos; não há fonte real de curadoria
// (Tarefa 9, não autorizada), então ele não volta enquanto não existir.
export function Hero() {
  return (
    <Section aria-label="Apresentação">
      <Slide style={{ backgroundImage: `url("${heroImage.src}")` }}>
        <Content>
          <Tag>Archives VI</Tag>
          <Titulo>A verdade está escondida em Leonida</Titulo>
          <Descricao>
            Investigações, evidências e teorias da comunidade de GTA VI, reunidas em um só lugar.
          </Descricao>
          <Acoes>
            <Acao href={ROUTES.investigacoes}>Ver investigações</Acao>
            <Acao href={ROUTES.teorias}>Ler teorias</Acao>
          </Acoes>
        </Content>
      </Slide>
    </Section>
  );
}

const Section = styled.section`
  width: 100%;
`;

const Slide = styled.div`
  position: relative;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.card};
  background-size: cover;
  background-position: center right;
  box-shadow: ${({ theme }) => theme.shadows.card};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(9, 11, 18, 0.96) 0%,
      rgba(9, 11, 18, 0.8) 42%,
      rgba(9, 11, 18, 0.15) 100%
    );
  }

  @media (max-width: 767px) {
    min-height: 320px;

    &::before {
      background: linear-gradient(
        180deg,
        rgba(9, 11, 18, 0.2) 0%,
        rgba(9, 11, 18, 0.92) 70%
      );
    }
  }
`;

const Content = styled.div`
  position: relative;
  max-width: 520px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 767px) {
    padding: 24px 20px;
  }
`;

const Tag = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.pink};
`;

const Titulo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 56px;
  font-weight: 800;
  line-height: 0.95;
  text-transform: uppercase;

  @media (max-width: 767px) {
    font-size: 36px;
  }
`;

const Descricao = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 4px;
`;

const Acao = styled(Link)`
  width: fit-content;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;
