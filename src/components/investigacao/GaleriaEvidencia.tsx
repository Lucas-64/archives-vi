"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import styled from "styled-components";

import type { ImagemEvidencia } from "../../types/InvestigacaoDetalhe";
import { Button } from "../ui/Button";

// Até cinco imagens por evidência. Mais do que isso é cortado aqui, e não na página.
export const LIMITE_IMAGENS_EVIDENCIA = 5;

export interface GaleriaEvidenciaProps {
  imagens: ImagemEvidencia[];
  // Identificador visível da evidência, por exemplo "#001". Usado nos nomes acessíveis.
  identificador: string;
}

// Miniatura que expande uma visualização ampliada dentro do próprio card. Sem modal:
// a visualização fica na página, e o foco volta à miniatura ao recolher.
export function GaleriaEvidencia({ imagens, identificador }: GaleriaEvidenciaProps) {
  const itens = imagens.slice(0, LIMITE_IMAGENS_EVIDENCIA);
  const total = itens.length;
  const [aberta, setAberta] = useState(false);
  const [posicao, setPosicao] = useState(0);
  const miniaturaRef = useRef<HTMLButtonElement>(null);
  const regiaoId = useId();

  if (total === 0) return null;

  const atual = itens[posicao];
  const rotuloPosicao = `${posicao + 1} de ${total}`;

  function anterior() {
    setPosicao((valor) => (valor - 1 + total) % total);
  }

  function proxima() {
    setPosicao((valor) => (valor + 1) % total);
  }

  function recolher() {
    setAberta(false);
    miniaturaRef.current?.focus();
  }

  // Setas trocam de imagem e Escape recolhe, quando o foco está dentro da visualização.
  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      recolher();
    } else if (total > 1 && evento.key === "ArrowLeft") {
      evento.preventDefault();
      anterior();
    } else if (total > 1 && evento.key === "ArrowRight") {
      evento.preventDefault();
      proxima();
    }
  }

  return (
    <Wrapper>
      <Miniatura
        ref={miniaturaRef}
        type="button"
        aria-expanded={aberta}
        aria-controls={regiaoId}
        aria-label={`Ampliar imagem da evidência ${identificador}`}
        onClick={() => setAberta((valor) => !valor)}
      >
        <Image
          src={itens[0].image}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
        <Chamada>
          {total > 1 ? `Ver ${total} imagens` : "Ver imagem"}
        </Chamada>
      </Miniatura>

      {aberta ? (
        <Visualizador
          id={regiaoId}
          role="region"
          aria-label={`Imagens da evidência ${identificador}`}
          onKeyDown={aoTeclar}
        >
          <Quadro>
            <Image
              key={atual.alt}
              src={atual.image}
              alt={atual.alt}
              sizes="(max-width: 767px) 100vw, 900px"
              // Automatic width with max limits keeps the box in the image's own proportion.
              style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "70vh" }}
            />
          </Quadro>

          <Controles>
            {total > 1 ? (
              <>
                <Button type="button" variant="outline" size="small" onClick={anterior} aria-label="Imagem anterior">
                  ← Anterior
                </Button>
                <Posicao aria-live="polite">{rotuloPosicao}</Posicao>
                <Button type="button" variant="outline" size="small" onClick={proxima} aria-label="Próxima imagem">
                  Próxima →
                </Button>
              </>
            ) : null}
            <Button type="button" variant="ghost" size="small" onClick={recolher} aria-label={`Recolher imagens da evidência ${identificador}`}>
              Recolher
            </Button>
          </Controles>
        </Visualizador>
      ) : null}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

// Thumbnail of the first image. The aspect ratio sets the height: about 40% of the previous
// height (16:9 before, 16:3.6 now; 4:3 on mobile before, 10:3 now). The width is unchanged and
// the image keeps object-fit: cover, so it is cropped, never distorted.
const Miniatura = styled.button`
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 3.6;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  cursor: zoom-in;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: -2px;
  }

  @media (max-width: 767px) {
    aspect-ratio: 10 / 3;
  }
`;

const Chamada = styled.span`
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Visualizador = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-width: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: -2px;
  }
`;

// Frame that keeps the image centered without cropping it.
const Quadro = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`;

const Controles = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
`;

const Posicao = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
