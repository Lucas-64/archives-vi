"use client";

import type { ReactNode } from "react";
import styled from "styled-components";

import { MisterioCard } from "../cards/MisterioCard";

export interface PreviaCardProps {
  titulo: string;
  descricao: string;
  imagem?: string | null;
  selo?: ReactNode;
  meta?: readonly string[];
}

// Prévia de como o card ficará na listagem, atualizada enquanto a pessoa preenche o formulário. Usa o mesmo
// card das listagens (sem link: rascunho não tem rota) e a mesma imagem padrão quando não há capa.
export function PreviaCard({ titulo, descricao, imagem, selo, meta }: PreviaCardProps) {
  return (
    <Secao aria-labelledby="previa-card-titulo">
      <Titulo id="previa-card-titulo">Prévia do card</Titulo>
      <MisterioCard orientacao="vertical" titulo={titulo} descricao={descricao} imagem={imagem} selo={selo} meta={meta} />
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
`;
