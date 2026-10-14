"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Destaque } from "../../types/Destaque";

export interface HeroProps {
  destaques: Destaque[];
}

// Featured carousel from the approved prototype: text on the left, image on the right, dots below.
export function Hero({ destaques }: HeroProps) {
  const [indice, setIndice] = useState(0);

  if (destaques.length === 0) return null;

  const destaque = destaques[indice] ?? destaques[0];

  return (
    <Section aria-roledescription="carrossel" aria-label="Em destaque">
      <Slide
        style={{ backgroundImage: `url("${destaque.image.src}")` }}
        aria-live="polite"
      >
        <Content>
          <Tag>Em destaque</Tag>
          <Titulo>{destaque.titulo}</Titulo>
          <Descricao>{destaque.descricao}</Descricao>
          <Acao href={ROUTES.publicacao(destaque.investigacaoId)}>Ver mais</Acao>
        </Content>

        <Dots role="group" aria-label="Escolher destaque">
          {destaques.map((item, i) => (
            <Dot
              key={item.id}
              type="button"
              aria-label={`Destaque ${i + 1}`}
              aria-pressed={i === indice}
              $active={i === indice}
              onClick={() => setIndice(i)}
            />
          ))}
        </Dots>
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
  justify-content: space-between;
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
  padding: 40px 40px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 767px) {
    padding: 24px 20px 0;
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

const Acao = styled(Link)`
  width: fit-content;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const Dots = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  padding: 0 40px 20px;

  @media (max-width: 767px) {
    padding: 0 20px 16px;
  }
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "24px" : "8px")};
  height: 8px;
  padding: 0;
  border-radius: 999px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.pink : theme.colors.border};
  transition: width ${({ theme }) => theme.transitions.default};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;
