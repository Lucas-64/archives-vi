import Link from "next/link";

import { PublicationCard } from "../../../components/cards/PublicationCard";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { Sidebar } from "../../../components/home/Sidebar";
import { EmptyState } from "../../../components/states/EmptyState";
import { FILTROS_PUBLICACOES } from "../../../constants/filtros";
import { ROUTES } from "../../../constants/routes";
import {
  getAtualizacoes,
  getCriadores,
  getPublicacoes,
  getTopicosForum,
  SIMULACOES,
  type Simulacao,
} from "../../../lib/data";
import type { TipoPublicacao } from "../../../types/Publicacao";
import { TAGS_TEMATICAS, type TagTematica } from "../../../constants/tagsTematicas";
import { FiltroTemas } from "../../../components/tags/FiltroTemas";
import { lerTagTematica } from "../../../lib/tags";

type SearchParams = Promise<{ tipo?: string; tag?: string; simular?: string }>;

const TIPOS_VALIDOS: readonly TipoPublicacao[] = ["teoria", "investigacao"];

function lerTipo(valor?: string): TipoPublicacao | undefined {
  return TIPOS_VALIDOS.find((tipo) => tipo === valor);
}

// Endereço da listagem com os filtros ativos. Tipo e tema são independentes, e cada escolha
// preserva a outra. Valor de tema desconhecido já chega aqui como undefined (ignorado).
function hrefPublicacoes({ tipo, tag }: { tipo?: TipoPublicacao; tag?: TagTematica }): string {
  const query = new URLSearchParams();
  if (tipo) query.set("tipo", tipo);
  if (tag) query.set("tag", tag);
  const texto = query.toString();
  return texto ? `${ROUTES.publicacoes}?${texto}` : ROUTES.publicacoes;
}

function lerSimulacao(valor?: string): Simulacao | undefined {
  return SIMULACOES.find((estado) => estado === valor);
}

export default async function PublicacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tipo = lerTipo(params.tipo);
  const tag = lerTagTematica(params.tag);
  const simular = lerSimulacao(params.simular);

  const [publicacoes, criadores, topicos, atualizacoes] = await Promise.all([
    getPublicacoes({ tipo, tag, simular }),
    getCriadores(),
    getTopicosForum(),
    getAtualizacoes(),
  ]);
  const autores = new Map(criadores.map((criador) => [criador.id, criador]));

  const abas = FILTROS_PUBLICACOES.map((filtro) => ({
    label: filtro.label,
    href: hrefPublicacoes({ tipo: filtro.value, tag }),
    active: filtro.value === tipo,
  }));

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Publicações"
            descricao="Teorias e investigações publicadas pela comunidade de Leonida."
          />

          <FilterTabs label="Filtrar publicações" tabs={abas} />

          <FiltroTemas
            label="Filtrar publicações por tema"
            opcoes={[
              { href: hrefPublicacoes({ tipo }), ativa: tag === undefined },
              ...TAGS_TEMATICAS.map((item) => ({
                tag: item.id,
                href: hrefPublicacoes({ tipo, tag: item.id }),
                ativa: tag === item.id,
              })),
            ]}
          />

          <PageBody>
            {publicacoes.length === 0 ? (
              tag ? (
                <EmptyState
                  titulo="Nenhuma publicação com este tema"
                  descricao="Não há publicações deste tema neste filtro. Escolha outro tema ou veja todas."
                  acao={<Link href={hrefPublicacoes({ tipo })}>Ver todos os temas</Link>}
                />
              ) : (
                <EmptyState
                  titulo="Nenhuma publicação por aqui"
                  descricao="Ainda não há publicações neste filtro. Tente outra categoria."
                />
              )
            ) : (
              <CardList>
                {publicacoes.map((publicacao) => (
                  <PublicationCard
                    key={publicacao.id}
                    publicacao={publicacao}
                    autor={autores.get(publicacao.autorId)}
                  />
                ))}
              </CardList>
            )}
          </PageBody>
        </>
      }
      sidebar={<Sidebar topicos={topicos} atualizacoes={atualizacoes} />}
    />
  );
}
