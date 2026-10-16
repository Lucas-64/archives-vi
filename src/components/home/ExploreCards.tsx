"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { FiArrowRight } from "react-icons/fi";

import { EXPLORAR_ITENS, type ExplorarItem } from "../../constants/explorar";
import { imagemDaSecao } from "../../constants/imagensSecoes";

export function ExploreCards() {
  return (
    <section aria-labelledby="explorar-titulo">
      <Titulo id="explorar-titulo">Explorar</Titulo>
      <Grid>
        {EXPLORAR_ITENS.map((item) => (
          <ExploreTile key={item.titulo} item={item} />
        ))}
      </Grid>
    </section>
  );
}

export function ExploreTile({ item }: { item: ExplorarItem }) {
  const Icon = item.icon;
  // The background image is decorative: the tile title already names the section.
  const imagem = imagemDaSecao(item.secao);

  return (
    <Tile>
      {imagem ? (
        <Fundo>
          <Image
            src={imagem.image}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </Fundo>
      ) : null}
      {/* Bottom-only gradient, so the text stays readable and the upper part of the image stays clear. */}
      <Degrade aria-hidden="true" />

      <Conteudo>
        <Icon aria-hidden="true" size={52} strokeWidth={1.5} />

        <Texto>
          <TileTitulo>{item.titulo}</TileTitulo>
          <TileDescricao>{item.descricao}</TileDescricao>
          {item.href ? (
            <TileLink href={item.href}>
              Explorar <FiArrowRight aria-hidden="true" />
            </TileLink>
          ) : (
            <TileDisabled aria-disabled="true">
              Explorar <FiArrowRight aria-hidden="true" />
            </TileDisabled>
          )}
        </Texto>
      </Conteudo>
    </Tile>
  );
}

const Titulo = styled.h2`
  margin-bottom: 16px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Tile = styled.div`
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 320px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};

  @media (max-width: 767px) {
    min-height: 280px;
  }
`;

const Fundo = styled.div`
  position: absolute;
  inset: 0;
`;

const Degrade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(9, 11, 18, 0.95) 0%,
    rgba(9, 11, 18, 0.7) 45%,
    rgba(9, 11, 18, 0) 75%
  );
`;

const Conteudo = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 20px;
  color: ${({ theme }) => theme.colors.pink};
`;

const Texto = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TileTitulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;

const TileDescricao = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const TileDisabled = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
`;
