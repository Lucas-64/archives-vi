"use client";

import styled from "styled-components";

import { Badge } from "../ui/Badge";

export interface PreviaTeoriaProps {
  titulo: string;
  texto: string;
}

// Prévia visual da teoria, atualizada pelo formulário. Não é PublicationCard: aquele componente
// cria link para /publicacao/<slug>, e um rascunho não tem rota. Mantém o mesmo visual.
// Não atribui autor: o rótulo "Prévia, sem autor" é neutro.
export function PreviaTeoria({ titulo, texto }: PreviaTeoriaProps) {
  const tituloVazio = titulo.length === 0;
  const textoVazio = texto.length === 0;

  return (
    <Secao aria-labelledby="previa-teoria-titulo">
      <TituloSecao id="previa-teoria-titulo">Prévia</TituloSecao>

      <Article>
        <Badge variant="primary" size="small" uppercase>
          Teoria
        </Badge>

        <Titulo $vazio={tituloVazio}>{tituloVazio ? "Título da teoria" : titulo}</Titulo>

        <Resumo $vazio={textoVazio}>
          {textoVazio ? "O texto aparece aqui conforme você escreve." : texto}
        </Resumo>

        <Meta>
          <span>Prévia, sem autor</span>
          <span>0 comentários</span>
        </Meta>
      </Article>
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const TituloSecao = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
`;

const Article = styled.article`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Titulo = styled.h3<{ $vazio: boolean }>`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  color: ${({ $vazio, theme }) => ($vazio ? theme.colors.textSecondary : theme.colors.text)};
  overflow-wrap: anywhere;
  min-width: 0;
`;

const Resumo = styled.p<{ $vazio: boolean }>`
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
  color: ${({ $vazio, theme }) => ($vazio ? theme.colors.textSecondary : theme.colors.text)};
  font-style: ${({ $vazio }) => ($vazio ? "italic" : "normal")};
  overflow-wrap: anywhere;
  min-width: 0;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
