"use client";

import styled from "styled-components";

import { extrairIdYoutube, urlIncorporacaoYoutube } from "../../lib/youtube";

export interface VideoYoutubeProps {
  url?: string;
  titulo?: string;
}

// Player do próprio YouTube, em iframe responsivo 16:9. O arquivo de vídeo nunca é armazenado aqui.
// Sem link válido, não renderiza nada: a seção simplesmente não aparece.
export function VideoYoutube({ url, titulo }: VideoYoutubeProps) {
  const id = extrairIdYoutube(url);
  if (!id) return null;

  return (
    <Bloco>
      <Quadro>
        <iframe
          src={urlIncorporacaoYoutube(id)}
          title={titulo ?? "Vídeo do YouTube relacionado ao mistério"}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </Quadro>
      {titulo ? <Legenda>{titulo}</Legenda> : null}
    </Bloco>
  );
}

const Bloco = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Quadro = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const Legenda = styled.figcaption`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
