"use client";

import styled from "styled-components";

import type { PatentesDoMembro } from "../../types/Patente";
import { Card } from "../ui/Card";
import { MedalhaPatente } from "./MedalhaPatente";

export interface MeuPerfilPatenteProps {
  patentes?: PatentesDoMembro;
}

// Cartão de patente no topo de Meu Perfil (ADR-021). Somente leitura, como manda ADR-019:
// a patente é conquistada pela trajetória e não pode ser editada pelo membro.
export function MeuPerfilPatente({ patentes }: MeuPerfilPatenteProps) {
  return (
    <Secao aria-labelledby="meu-perfil-patente">
      <Card padding="large">
        <Rotulo id="meu-perfil-patente">Patente do investigador</Rotulo>

        {patentes ? (
          <>
            <Atual>
              <MedalhaPatente
                variante={patentes.atual.medalha}
                tamanho="destaque"
                titulo={`Patente atual: ${patentes.atual.nome}`}
              />
              <Identidade>
                <NomePatente>{patentes.atual.nome}</NomePatente>
                <Nota>Patente conquistada pela trajetória. Não é editável.</Nota>
              </Identidade>
            </Atual>

            {patentes.anteriores.filter((item) => item.id !== patentes.atual.id).length > 0 ? (
              <Historico>
                <RotuloHistorico>Patentes anteriores</RotuloHistorico>
                <Fileira aria-label="Patentes anteriores">
                  {patentes.anteriores
                    .filter((item) => item.id !== patentes.atual.id)
                    .map((item) => (
                      <li key={item.id}>
                        <MedalhaPatente variante={item.medalha} tamanho="compacta" titulo={`Patente anterior: ${item.nome}`} />
                      </li>
                    ))}
                </Fileira>
              </Historico>
            ) : null}
          </>
        ) : (
          <Atual>
            <Identidade>
              <NomePatente>Ainda não disponível</NomePatente>
              <Nota>Informação ainda não disponível. Patente conquistada pela trajetória. Não é editável.</Nota>
            </Identidade>
          </Atual>
        )}
      </Card>
    </Secao>
  );
}

const Secao = styled.section`
  min-width: 0;
  height: 100%;

  & > div {
    height: 100%;
    box-sizing: border-box;
  }
`;

const Rotulo = styled.h2`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Atual = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    gap: 16px;
  }
`;

const Identidade = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const NomePatente = styled.p`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 24px;
  }
`;

const Nota = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Historico = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const RotuloHistorico = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Fileira = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;
