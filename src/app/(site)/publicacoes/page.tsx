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

type SearchParams = Promise<{ tipo?: string; simular?: string }>;

const TIPOS_VALIDOS: readonly TipoPublicacao[] = ["teoria", "investigacao"];

function lerTipo(valor?: string): TipoPublicacao | undefined {
  return TIPOS_VALIDOS.find((tipo) => tipo === valor);
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
  const simular = lerSimulacao(params.simular);

  const [publicacoes, criadores, topicos, atualizacoes] = await Promise.all([
    getPublicacoes({ tipo, simular }),
    getCriadores(),
    getTopicosForum(),
    getAtualizacoes(),
  ]);
  const autores = new Map(criadores.map((criador) => [criador.id, criador]));

  const abas = FILTROS_PUBLICACOES.map((filtro) => ({
    label: filtro.label,
    href: filtro.value ? `${ROUTES.publicacoes}?tipo=${filtro.value}` : ROUTES.publicacoes,
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

          <PageBody>
            {publicacoes.length === 0 ? (
              <EmptyState
                titulo="Nenhuma publicação por aqui"
                descricao="Ainda não há publicações neste filtro. Tente outra categoria."
              />
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
