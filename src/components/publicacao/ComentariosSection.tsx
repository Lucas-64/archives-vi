"use client";

import styled from "styled-components";

import { ComposerBloqueado } from "../comentarios/ComposerBloqueado";
import { formatarNumero } from "../../lib/formatacao";

export interface ComentariosSectionProps {
  total: number;
}

// Structure only: no backend, no authentication and no saving.
// The composer stays disabled until sign-in exists.
export function ComentariosSection({ total }: ComentariosSectionProps) {
  return (
    <Section aria-labelledby="comentarios-titulo">
      <Titulo id="comentarios-titulo">
        Comentários <Total>({formatarNumero(total)})</Total>
      </Titulo>

      <Aviso role="status">
        Os comentários desta publicação ainda não estão disponíveis nesta versão.
      </Aviso>

      <ComposerBloqueado />
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Total = styled.span`
  color: ${({ theme }) => theme.colors.pink};
`;

const Aviso = styled.p`
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
