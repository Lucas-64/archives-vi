import { CaseCard } from "../../../components/cards/CaseCard";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { LinkDeAcao } from "../../../components/page/LinkDeAcao";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { FILTROS_INVESTIGACOES } from "../../../constants/filtros";
import { ROUTES } from "../../../constants/routes";
import { investigacaoParaCaso } from "../../../lib/adaptadores";
import { filtrarInvestigacoes, type CategoriaInvestigacao } from "../../../lib/investigacao";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";

// Listagem de investigações reais (API, via serviço no processo; ADR-029 e ADR-031).
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ categoria?: string }>;

// Lê a categoria do slug da URL. Valores desconhecidos caem em "Todas".
function lerCategoria(slug?: string): CategoriaInvestigacao | undefined {
  return FILTROS_INVESTIGACOES.find((filtro) => filtro.slug === slug)?.value;
}

export default async function InvestigacoesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categoria = lerCategoria(params.categoria);

  const { itens, haMais } = await investigacoesDaListagem();
  const casos = itens.map(investigacaoParaCaso);

  // "Todas" mantém todos os registros, inclusive comunidade e classificadas. A categoria é aplicada sobre a página carregada.
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
            acao={<LinkDeAcao href={ROUTES.criarInvestigacao}>Criar investigação</LinkDeAcao>}
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
            {haMais ? (
              <NotaLista>
                {categoria
                  ? `Filtrando entre as ${LIMITE_LISTA} investigações mais recentes.`
                  : `Mostrando as ${LIMITE_LISTA} investigações mais recentes.`}
              </NotaLista>
            ) : null}
          </PageBody>
        </>
      }
    />
  );
}
