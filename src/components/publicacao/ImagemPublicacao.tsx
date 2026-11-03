"use client";

import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";

// Imagem enviada com a teoria (ADR-043), no detalhe da publicação. Só existe quando a pessoa enviou uma imagem:
// sem ela, nada é exibido (a imagem padrão vale só nos cards de capa). Se o endereço falhar, o bloco some.
export function ImagemPublicacao({ src, titulo }: { src?: string | null; titulo: string }) {
  const [falhou, setFalhou] = useState(false);
  if (!src || falhou) return null;
  return (
    <Moldura>
      <Image
        src={src}
        alt={`Imagem enviada com a publicação: ${titulo}`}
        fill
        sizes="(max-width: 767px) 100vw, 860px"
        onError={() => setFalhou(true)}
        style={{ objectFit: "cover" }}
      />
    </Moldura>
  );
}

const Moldura = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;
