"use client";

import styled from "styled-components";

import type { PatentesDoMembro } from "../../types/Patente";
import { Card } from "../ui/Card";
import { MedalhaPatente } from "./MedalhaPatente";

export interface PatenteInvestigadorProps {
  patentes?: PatentesDoMembro;
}

// Seção "Patente do Investigador" da lateral do perfil. Mostra a patente atual com destaque,
// a frase descritiva (quando existir) e as medalhas das patentes anteriores, em fileira compacta.
// Os dados são demonstrativos (ADR-019). Sem dados, mostra um estado vazio, sem inventar patente.
export function PatenteInvestigador({ patentes }: PatenteInvestigadorProps) {
  return (
    <Secao aria-labelledby="perfil-patente">
      <Card padding="medium">
        <Titulo id="perfil-patente">Patente do Investigador</Titulo>

        {patentes ? (
          <>
            <Atual>
              <MedalhaPatente variante={patentes.atual.medalha} tamanho="destaque" titulo={`Patente atual: ${patentes.atual.nome}`} />
              <Identidade>
                <NomePatente>{patentes.atual.nome}</NomePatente>
                {patentes.atual.descricao ? <Descricao>{patentes.atual.descricao}</Descricao> : null}
              </Identidade>
            </Atual>

            {/* A patente atual nunca se repete aqui. Só entram patentes já conquistadas. */}
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
          <Vazio>Patente ainda não definida para este membro.</Vazio>
        )}

        <Nota>Dados demonstrativos.</Nota>
      </Card>
    </Secao>
  );
}

const Secao = styled.section`
  min-width: 0;
`;

const Titulo = styled.h2`
  margin-bottom: 16px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
`;

const Atual = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
`;

const Identidade = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const NomePatente = styled.p`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
`;

const Descricao = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Historico = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const RotuloHistorico = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nota = styled.p`
  margin-top: 16px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
