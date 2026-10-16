import { CaseCard } from "../../../components/cards/CaseCard";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { Sidebar } from "../../../components/home/Sidebar";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { FILTROS_INVESTIGACOES } from "../../../constants/filtros";
import { ROUTES } from "../../../constants/routes";
import {
  getAtualizacoes,
  getInvestigacoes,
  getTopicosForum,
  SIMULACOES,
  type Simulacao,
} from "../../../lib/data";
import {
  filtrarInvestigacoes,
  type CategoriaInvestigacao,
} from "../../../lib/investigacao";

type SearchParams = Promise<{ categoria?: string; simular?: string }>;

// Reads the category from the URL slug. Unknown values fall back to "Todas".
function lerCategoria(slug?: string): CategoriaInvestigacao | undefined {
  return FILTROS_INVESTIGACOES.find((filtro) => filtro.slug === slug)?.value;
}

function lerSimulacao(valor?: string): Simulacao | undefined {
  return SIMULACOES.find((estado) => estado === valor);
}

export default async function InvestigacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categoria = lerCategoria(params.categoria);
  const simular = lerSimulacao(params.simular);

  const [casos, topicos, atualizacoes] = await Promise.all([
    getInvestigacoes({ simular }),
    getTopicosForum(),
    getAtualizacoes(),
  ]);

  // Keeps every record in "Todas", including community and classified.
  const visiveis = filtrarInvestigacoes(casos, categoria);

  const abas = FILTROS_INVESTIGACOES.map((filtro) => ({
    label: filtro.label,
    href: filtro.slug ? `${ROUTES.investigacoes}?categoria=${filtro.slug}` : ROUTES.investigacoes,
    active: filtro.value === categoria,
  }));

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Investigações"
            descricao="Investigações organizadas em torno de evidências, conexões e discussão."
          />

          <FilterTabs label="Filtrar investigações por categoria" tabs={abas} />

          <PageBody>
            {visiveis.length === 0 ? (
              <EmptyState
                titulo={categoria ? "Nenhuma investigação nesta categoria" : "Nenhuma investigação por enquanto"}
                descricao={
                  categoria
                    ? `Não há investigações em "${categoria}" no momento. Tente outra categoria.`
                    : "Assim que novas investigações forem publicadas, elas aparecem aqui."
                }
              />
            ) : (
              <CardList>
                {visiveis.map((caso) => (
                  <CaseCard key={caso.id} caso={caso} orientacao="horizontal" />
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
