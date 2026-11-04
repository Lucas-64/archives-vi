"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { classificacaoDoMisterio, textoInvestigacoesAbertas } from "../../lib/misterio";
import type { MisterioResumo } from "../../server/contracts/misterios";
import { MisterioCard } from "../cards/MisterioCard";
import { ClassificacaoBadge } from "../ui/ClassificacaoBadge";
import { EmptyState } from "../states/EmptyState";

export interface MisteriosRecentesProps {
  misterios: readonly MisterioResumo[];
}

export function MisteriosRecentes({ misterios }: MisteriosRecentesProps) {
  return (
    <section aria-labelledby="recentes-titulo">
      <Header>
        <Titulo id="recentes-titulo">Mistérios recentes</Titulo>
        <Link href={ROUTES.misterios}>Ver todos</Link>
      </Header>

      {misterios.length === 0 ? (
        <EmptyState
          titulo="Nenhum mistério por enquanto"
          descricao="Assim que novos mistérios forem abertos, eles aparecem aqui."
        />
      ) : (
        <Grid>
          {misterios.map((item) => (
            <MisterioCard
              key={item.id}
              orientacao="vertical"
              titulo={item.titulo}
              descricao={item.descricao}
              imagem={item.imagem}
              selo={<ClassificacaoBadge classificacao={classificacaoDoMisterio(item.classificacao)} />}
              meta={[textoInvestigacoesAbertas(item.investigacoesAbertas)]}
              href={ROUTES.misterio(item.slug)}
            />
          ))}
        </Grid>
      )}
    </section>
  );
}

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  a {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
