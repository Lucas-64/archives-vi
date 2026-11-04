"use client";

import styled from "styled-components";

import { CaseCardClassico } from "../cards/CaseCardClassico";
import { MisterioCard } from "../cards/MisterioCard";
import { CreatorCard } from "../cards/CreatorCard";
import { PublicationCard } from "../cards/PublicationCard";
import { ROUTES } from "../../constants/routes";
import { classificacaoDoMisterio, textoInvestigacoesAbertas } from "../../lib/misterio";
import { CardList } from "../page/CardList";
import { ClassificacaoBadge } from "../ui/ClassificacaoBadge";
import type { ResultadoBusca } from "../../lib/busca";
import type { Criador } from "../../types/Criador";

export interface ResultadosBuscaProps {
  resultado: ResultadoBusca;
  // Lista completa de criadores, para mostrar o autor de cada publicação.
  criadores: readonly Criador[];
}

function contagemDe(total: number): string {
  return `${total} ${total === 1 ? "resultado" : "resultados"}`;
}

// Grupos de resultado: mistérios, investigações, publicações antigas e criadores.
// Cada grupo aparece somente quando tem itens.
export function ResultadosBusca({ resultado, criadores }: ResultadosBuscaProps) {
  const autores = new Map(criadores.map((criador) => [criador.id, criador]));
  const { misterios, publicacoes, investigacoes, criadores: encontrados } = resultado;

  return (
    <Grupos>
      {misterios.length > 0 ? (
        <Grupo aria-labelledby="resultado-misterios">
          <TituloGrupo id="resultado-misterios">
            Mistérios <Contagem>{contagemDe(misterios.length)}</Contagem>
          </TituloGrupo>
          <CardList>
            {misterios.map((item) => (
              <MisterioCard
                key={item.slug}
                titulo={item.titulo}
                descricao={item.descricao}
                imagem={item.imagem}
                selo={<ClassificacaoBadge classificacao={classificacaoDoMisterio(item.classificacao)} />}
                meta={[textoInvestigacoesAbertas(item.investigacoesAbertas)]}
                href={ROUTES.misterio(item.slug)}
              />
            ))}
          </CardList>
        </Grupo>
      ) : null}

      {publicacoes.length > 0 ? (
        <Grupo aria-labelledby="resultado-publicacoes">
          <TituloGrupo id="resultado-publicacoes">
            Publicações <Contagem>{contagemDe(publicacoes.length)}</Contagem>
          </TituloGrupo>
          <CardList>
            {publicacoes.map((publicacao) => (
              <PublicationCard
                key={publicacao.id}
                publicacao={publicacao}
                autor={autores.get(publicacao.autorId)}
                nivelTitulo={3}
              />
            ))}
          </CardList>
        </Grupo>
      ) : null}

      {investigacoes.length > 0 ? (
        <Grupo aria-labelledby="resultado-investigacoes">
          <TituloGrupo id="resultado-investigacoes">
            Investigações <Contagem>{contagemDe(investigacoes.length)}</Contagem>
          </TituloGrupo>
          <CardList>
            {investigacoes.map((caso) => (
              <CaseCardClassico key={caso.id} caso={caso} orientacao="horizontal" href={ROUTES.investigacao(caso.id)} />
            ))}
          </CardList>
        </Grupo>
      ) : null}

      {encontrados.length > 0 ? (
        <Grupo aria-labelledby="resultado-criadores">
          <TituloGrupo id="resultado-criadores">
            Criadores <Contagem>{contagemDe(encontrados.length)}</Contagem>
          </TituloGrupo>
          <CardList>
            {encontrados.map((criador) => (
              <CreatorCard key={criador.id} criador={criador} nivelTitulo={3} />
            ))}
          </CardList>
        </Grupo>
      ) : null}
    </Grupos>
  );
}

const Grupos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxl};
`;

const Grupo = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

const TituloGrupo = styled.h2`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: 700;
  text-transform: uppercase;
`;

const Contagem = styled.span`
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 400;
  text-transform: none;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
