"use client";

import styled from "styled-components";

import type { Sintese } from "../../types/InvestigacaoDetalhe";
import { Avatar } from "../ui/Avatar";

export interface SinteseSectionProps {
  sintese: Sintese;
}

// Synthesis blocks. The provisional conclusion belongs to its author, never to "the community".
export function SinteseSection({ sintese }: SinteseSectionProps) {
  const blocos: Array<{ titulo: string; itens: string[] }> = [
    { titulo: "Observado", itens: sintese.observado },
    { titulo: "Argumentos que sustentam", itens: sintese.sustentam },
    { titulo: "Argumentos que contradizem", itens: sintese.contradizem },
    { titulo: "Perguntas em aberto", itens: sintese.perguntasEmAberto },
  ];

  return (
    <Wrapper>
      <Grade>
        {blocos.map((bloco) => (
          <Bloco key={bloco.titulo}>
            <BlocoTitulo>{bloco.titulo}</BlocoTitulo>
            {bloco.itens.length === 0 ? (
              <Vazio>Nenhum item registrado.</Vazio>
            ) : (
              <Itens>
                {bloco.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </Itens>
            )}
          </Bloco>
        ))}
      </Grade>

      <Conclusao aria-labelledby="conclusao-provisoria-titulo">
        <BlocoTitulo id="conclusao-provisoria-titulo">Conclusão provisória</BlocoTitulo>
        {sintese.conclusaoProvisoria ? (
          <>
            <Texto>{sintese.conclusaoProvisoria.texto}</Texto>
            <Atribuicao>
              <Avatar nome={sintese.conclusaoProvisoria.autor.nome} size="small" />
              <span>
                Proposta por {sintese.conclusaoProvisoria.autor.nome} (
                @{sintese.conclusaoProvisoria.autor.usuario}). Não representa consenso da comunidade.
              </span>
            </Atribuicao>
          </>
        ) : (
          <>
            <Texto>Ainda não definida</Texto>
            <Atribuicao>Ainda não há evidências suficientes para uma conclusão provisória.</Atribuicao>
          </>
        )}
      </Conclusao>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Bloco = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const BlocoTitulo = styled.h4`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text};
`;

const Itens = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Conclusao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
`;

const Texto = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

const Atribuicao = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
