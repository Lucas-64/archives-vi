"use client";

import Link from "next/link";
import styled from "styled-components";

import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";

export interface TeoriaSectionProps {
  teoria: InvestigacaoDetalhe["teoria"];
  revisoes: number;
}

// The hypothesis is visibly a hypothesis: dashed frame and an explicit label, never a confirmed fact.
export function TeoriaSection({ teoria, revisoes }: TeoriaSectionProps) {
  return (
    <Wrapper>
      <Hipotese aria-labelledby="hipotese-titulo">
        <Rotulo id="hipotese-titulo">Hipótese principal · não confirmada</Rotulo>
        <Texto>{teoria.hipotese}</Texto>
      </Hipotese>

      <Grade>
        <Bloco aria-labelledby="argumentos-titulo">
          <BlocoTitulo id="argumentos-titulo">Argumentos favoráveis</BlocoTitulo>
          <Itens>
            {teoria.argumentosFavoraveis.map((argumento) => (
              <li key={argumento}>{argumento}</li>
            ))}
          </Itens>
        </Bloco>

        <Bloco aria-labelledby="pergunta-titulo">
          <BlocoTitulo id="pergunta-titulo">Pergunta central</BlocoTitulo>
          <Pergunta>{teoria.perguntaCentral}</Pergunta>
        </Bloco>
      </Grade>

      <Bloco aria-labelledby="fontes-titulo">
        <BlocoTitulo id="fontes-titulo">Fontes disponíveis</BlocoTitulo>
        {teoria.fontes.length === 0 ? (
          <Vazio>Nenhuma fonte disponível ainda.</Vazio>
        ) : (
          <Itens>
            {teoria.fontes.map((fonte) => (
              <li key={fonte}>{fonte}</li>
            ))}
          </Itens>
        )}
      </Bloco>

      <Historico>
        <span>{revisoes} revisões registradas.</span>
        <Link href="#historico">Ver histórico de edições</Link>
      </Historico>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Hipotese = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.pink};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Rotulo = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.pink};
`;

const Texto = styled.p`
  font-size: 17px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Bloco = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const BlocoTitulo = styled.h3`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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

const Pergunta = styled.p`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Historico = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;
