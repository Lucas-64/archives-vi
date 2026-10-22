import { CaseCard } from "../../../components/cards/CaseCard";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { FiltrosRecolhiveis } from "../../../components/filters/FiltrosRecolhiveis";
import { SidebarDemonstrativa } from "../../../components/home/Sidebar";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { LinkDeAcao } from "../../../components/page/LinkDeAcao";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { CLASSIFICACOES_MISTERIO } from "../../../constants/classificacoesMisterio";
import { ROUTES } from "../../../constants/routes";
import { investigacaoParaCaso } from "../../../lib/adaptadores";
import { filtrarInvestigacoes, lerClassificacao } from "../../../lib/investigacao";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";

// Listagem de investigações reais (API, via serviço no processo; ADR-029 e ADR-031).
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ classificacao?: string }>;

export default async function InvestigacoesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const classificacao = lerClassificacao(params.classificacao);

  const { itens, haMais } = await investigacoesDaListagem();
  const casos = itens.map(investigacaoParaCaso);

  // "Todas" mantém todos os registros. A classificação é aplicada sobre a página carregada.
  const visiveis = filtrarInvestigacoes(casos, classificacao);

  const abas = [
    { label: "Todas", href: ROUTES.investigacoes, active: !classificacao },
    ...CLASSIFICACOES_MISTERIO.map((item) => ({
      label: item.rotulo,
      href: `${ROUTES.investigacoes}?classificacao=${item.id}`,
      active: item.id === classificacao?.id,
    })),
  ];

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Investigações"
            descricao="Investigações organizadas em torno de evidências, conexões e discussão."
            acao={<LinkDeAcao href={ROUTES.criarInvestigacao}>Criar investigação</LinkDeAcao>}
          />

          <FiltrosRecolhiveis resumoAtivo={classificacao ? `Classificação: ${classificacao.rotulo}` : undefined}>
            <FilterTabs label="Filtrar mistérios por classificação" tabs={abas} />
          </FiltrosRecolhiveis>

          <PageBody>
            {visiveis.length === 0 ? (
              <EmptyState
                titulo={classificacao ? "Nenhuma investigação nesta classificação" : "Nenhuma investigação por enquanto"}
                descricao={
                  classificacao
                    ? `Não há investigações em "${classificacao.rotulo}" no momento. Tente outra classificação.`
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
                {classificacao
                  ? `Filtrando entre as ${LIMITE_LISTA} investigações mais recentes.`
                  : `Mostrando as ${LIMITE_LISTA} investigações mais recentes.`}
              </NotaLista>
            ) : null}
          </PageBody>
        </>
      }
      sidebar={<SidebarDemonstrativa />}
    />
  );
}
