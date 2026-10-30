"use client";

import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";

// Faixa de banner do perfil (ADR-043). Só existe quando a pessoa enviou uma imagem; se a imagem falhar, some.
export function BannerPerfil({ src }: { src?: string | null }) {
  const [falhou, setFalhou] = useState(false);
  if (!src || falhou) return null;
  return (
    <Faixa aria-hidden="true">
      <Image src={src} alt="" fill sizes="(max-width: 767px) 100vw, 800px" onError={() => setFalhou(true)} style={{ objectFit: "cover" }} />
    </Faixa>
  );
}

const Faixa = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 1;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;
