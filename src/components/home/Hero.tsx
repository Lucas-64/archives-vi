"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import styled from "styled-components";

import heroImage from "../../assets/images/hero.jpg";
import { ROUTES } from "../../constants/routes";

export interface DestaqueHero {
  id: string;
  rotulo: string;
  titulo: string;
  descricao: string;
  href: string;
}

export interface HeroProps {
  // Slides depois da apresentação institucional. São dados reais (por exemplo, as investigações mais recentes);
  // sem eles o banner mostra só a apresentação, sem setas nem indicadores.
  destaques?: readonly DestaqueHero[];
  // Troca automática dos slides. Para ao passar o mouse, ao focar, no botão de pausa e com "reduzir movimento".
  autoplay?: boolean;
  intervaloMs?: number;
}

const DISTANCIA_SWIPE = 50;
const CONSULTA_MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

function assinarMovimentoReduzido(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO);
  consulta.addEventListener("change", aoMudar);
  return () => consulta.removeEventListener("change", aoMudar);
}

// Banner de abertura da Home, em carrossel: apresentação institucional (texto e imagem do site, que não é
// conteúdo de usuário) e, depois, destaques reais passados por quem usa o componente. Não há curadoria
// (Tarefa 9, não autorizada): os destaques são só o que o banco devolve, mais recentes primeiro. Os slides de
// conteúdo não usam a imagem do site (CLAUDE.md: imagens de seção nunca em conteúdo de usuário).
// Controles: setas, indicadores, teclado (setas esquerda e direita com o foco no carrossel) e swipe.
export function Hero({ destaques = [], autoplay = true, intervaloMs = 7000 }: HeroProps) {
  const total = destaques.length + 1;
  const [indice, setIndice] = useState(0);
  const [pausaPessoa, setPausaPessoa] = useState(false);
  const [emFoco, setEmFoco] = useState(false);
  const inicioX = useRef<number | null>(null);
  const idRegiao = useId();
  const movimentoReduzido = useSyncExternalStore(
    assinarMovimentoReduzido,
    () => window.matchMedia(CONSULTA_MOVIMENTO_REDUZIDO).matches,
    () => false,
  );

  const irPara = useCallback((destino: number) => setIndice(((destino % total) + total) % total), [total]);
  const rodando = autoplay && total > 1 && !pausaPessoa && !emFoco && !movimentoReduzido;

  useEffect(() => {
    if (!rodando) return;
    const temporizador = window.setInterval(() => setIndice((atual) => (atual + 1) % total), intervaloMs);
    return () => window.clearInterval(temporizador);
  }, [rodando, intervaloMs, total]);

  // Com a lista de destaques reduzida, o índice não pode apontar para um slide que não existe.
  const atual = Math.min(indice, total - 1);

  function aoSoltar(evento: PointerEvent<HTMLDivElement>) {
    if (inicioX.current === null) return;
    const deslocamento = evento.clientX - inicioX.current;
    inicioX.current = null;
    if (Math.abs(deslocamento) >= DISTANCIA_SWIPE) irPara(atual + (deslocamento < 0 ? 1 : -1));
  }

  return (
    <Section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setEmFoco(true)}
      onMouseLeave={() => setEmFoco(false)}
      onFocus={() => setEmFoco(true)}
      onBlur={() => setEmFoco(false)}
      onKeyDown={(evento) => {
        if (total < 2) return;
        if (evento.key === "ArrowLeft") irPara(atual - 1);
        if (evento.key === "ArrowRight") irPara(atual + 1);
      }}
    >
      <Janela
        onPointerDown={(evento) => {
          inicioX.current = evento.clientX;
        }}
        onPointerUp={aoSoltar}
        onPointerCancel={() => {
          inicioX.current = null;
        }}
      >
        <Trilho id={idRegiao} aria-live={rodando ? "off" : "polite"} style={{ transform: `translateX(-${atual * 100}%)` }}>
          <Quadro inert={atual !== 0} role="group" aria-roledescription="slide" aria-label={`1 de ${total}`}>
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
          </Quadro>

          {destaques.map((destaque, i) => (
            <Quadro
              key={destaque.id}
              inert={atual !== i + 1}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 2} de ${total}`}
            >
              <SlideConteudo>
                <Content>
                  <Tag>{destaque.rotulo}</Tag>
                  <TituloDestaque>{destaque.titulo}</TituloDestaque>
                  <Descricao>{destaque.descricao}</Descricao>
                  <Acoes>
                    <Acao href={destaque.href}>Abrir</Acao>
                  </Acoes>
                </Content>
              </SlideConteudo>
            </Quadro>
          ))}
        </Trilho>
      </Janela>

      {total > 1 ? (
        <>
          <Seta type="button" $lado="esquerda" aria-controls={idRegiao} aria-label="Slide anterior" onClick={() => irPara(atual - 1)}>
            <FiChevronLeft aria-hidden="true" />
          </Seta>
          <Seta type="button" $lado="direita" aria-controls={idRegiao} aria-label="Próximo slide" onClick={() => irPara(atual + 1)}>
            <FiChevronRight aria-hidden="true" />
          </Seta>

          <Rodape>
            <Indicadores>
              {Array.from({ length: total }, (_, i) => (
                <li key={i}>
                  <Ponto
                    type="button"
                    $ativo={i === atual}
                    aria-controls={idRegiao}
                    aria-label={`Ir para o slide ${i + 1} de ${total}`}
                    aria-current={i === atual ? "true" : undefined}
                    onClick={() => irPara(i)}
                  />
                </li>
              ))}
            </Indicadores>
            {autoplay && !movimentoReduzido ? (
              <Pausa
                type="button"
                aria-label={pausaPessoa ? "Retomar a troca automática" : "Pausar a troca automática"}
                onClick={() => setPausaPessoa((valor) => !valor)}
              >
                {pausaPessoa ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
              </Pausa>
            ) : null}
          </Rodape>
        </>
      ) : null}
    </Section>
  );
}

const Section = styled.section`
  position: relative;
  width: 100%;
`;

// Recorta os slides vizinhos. `touch-action: pan-y` deixa a rolagem vertical do navegador e entrega o gesto horizontal.
const Janela = styled.div`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  touch-action: pan-y;
`;

const Trilho = styled.div`
  display: flex;
  transition: transform 0.5s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Quadro = styled.div`
  flex: 0 0 100%;
  min-width: 0;
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

// Slide de conteúdo: mesmo formato do institucional, sem a imagem do site.
const SlideConteudo = styled.div`
  position: relative;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.backgroundSecondary} 0%,
    ${({ theme }) => theme.colors.card} 60%,
    ${({ theme }) => theme.colors.background} 100%
  );
  box-shadow: ${({ theme }) => theme.shadows.card};

  p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
  }

  @media (max-width: 767px) {
    min-height: 320px;
  }
`;

const Content = styled.div`
  position: relative;
  max-width: 520px;
  padding: 40px 40px 56px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 767px) {
    padding: 24px 20px 56px;
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

const TituloDestaque = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 30px;
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

const Seta = styled.button<{ $lado: "esquerda" | "direita" }>`
  position: absolute;
  top: 50%;
  ${({ $lado }) => ($lado === "esquerda" ? "left: 12px;" : "right: 12px;")}
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  font-size: 22px;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.default};

  &:hover {
    border-color: ${({ theme }) => theme.colors.pink};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    top: 16px;
    width: 40px;
    height: 40px;
    transform: none;
  }
`;

const Rodape = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Indicadores = styled.ul`
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
`;

// A área clicável tem 24 px; o ponto visível é menor, desenhado no ::after.
const Ponto = styled.button<{ $ativo: boolean }>`
  position: relative;
  width: 24px;
  height: 24px;
  border: 0;
  background: none;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${({ $ativo }) => ($ativo ? "24px" : "8px")};
    height: 8px;
    transform: translate(-50%, -50%);
    border-radius: ${({ theme }) => theme.borderRadius.pill};
    background: ${({ $ativo, theme }) => ($ativo ? theme.colors.pink : theme.colors.textSecondary)};
    transition: width ${({ theme }) => theme.transitions.default};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Pausa = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
