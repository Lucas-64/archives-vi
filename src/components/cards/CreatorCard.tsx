"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import type { Criador, CriadorListado } from "../../types/Criador";
import { MedalhaPatente } from "../perfil/MedalhaPatente";
import { TagTematica } from "../tags/TagTematica";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";

export interface CreatorCardProps {
  // Com `CriadorListado` (lista de criadores e busca), o cartão mostra a patente e até 3 temas.
  criador: Criador | CriadorListado;
  // Heading level of the name. Use 3 when the card sits under an h2 section heading.
  nivelTitulo?: 2 | 3;
}

export function CreatorCard({ criador, nivelTitulo = 2 }: CreatorCardProps) {
  return (
    <Card padding="medium" hoverable>
      <Cabecalho>
        <Avatar nome={criador.nome} size="medium" />
        <Identidade>
          <Nome as={nivelTitulo === 3 ? "h3" : "h2"}>
            <Link href={ROUTES.perfil(criador.usuario)}>{criador.nome}</Link>
          </Nome>
          <Usuario>@{criador.usuario}</Usuario>
        </Identidade>
      </Cabecalho>
      {criador.bio ? <Bio>{criador.bio}</Bio> : null}
      {"temas" in criador ? <Detalhes criador={criador} /> : null}
    </Card>
  );
}

function Detalhes({ criador }: { criador: CriadorListado }) {
  const { patente } = criador;

  return (
    <DetalhesArea>
      <Linha>
        <Rotulo>Patente</Rotulo>
        {patente ? (
          <Patente>
            <MedalhaPatente patenteId={patente.id} tamanho="compacta" />
            <strong>{patente.nome}</strong>
            {criador.patenteDemonstracao ? <Selo>Demonstração</Selo> : null}
          </Patente>
        ) : (
          <Vazio>Não definida</Vazio>
        )}
      </Linha>
      <Linha>
        <Rotulo>Temas</Rotulo>
        {criador.temas.length > 0 ? (
          <Temas aria-label={`Temas de ${criador.nome}`}>
            {criador.temas.map((tema) => (
              <li key={tema}>
                <TagTematica tag={tema} />
              </li>
            ))}
          </Temas>
        ) : (
          <Vazio>Sem temas ainda</Vazio>
        )}
      </Linha>
    </DetalhesArea>
  );
}

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const Identidade = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Nome = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  a {
    color: ${({ theme }) => theme.colors.text};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const Usuario = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Bio = styled.p`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetalhesArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Linha = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  min-width: 0;
`;

const Rotulo = styled.span`
  min-width: 56px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Patente = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const Selo = styled.small`
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Temas = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
`;

const Vazio = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
