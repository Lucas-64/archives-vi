"use client";

import Image from "next/image";
import { useState } from "react";

import { IMAGEM_PADRAO_INVESTIGACAO, imagemDaInvestigacao, type ImagemDeCapa } from "../../constants/imagemPadraoInvestigacao";

export interface ImagemCapaProps {
  // Imagem enviada (endereço https ou imagem local). Vazia: imagem padrão.
  src?: ImagemDeCapa | null;
  sizes: string;
  priority?: boolean;
}

// Imagem de capa das investigações (ADR-042): preenche o contêiner de proporção fixa do pai (`position: relative`)
// e, se o endereço enviado falhar, troca pela imagem padrão. Endereços externos não passam pelo otimizador do Next
// (`unoptimized`), então não exigem domínio configurado.
export function ImagemCapa({ src, sizes, priority = false }: ImagemCapaProps) {
  const [falhou, setFalhou] = useState(false);
  const escolhida = falhou ? IMAGEM_PADRAO_INVESTIGACAO : imagemDaInvestigacao(src);

  return (
    <Image
      src={escolhida}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={typeof escolhida === "string"}
      onError={() => setFalhou(true)}
      style={{ objectFit: "cover" }}
    />
  );
}
