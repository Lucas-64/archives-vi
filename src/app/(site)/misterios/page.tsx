import { FilterTabs } from "../../../components/filters/FilterTabs";
import { FiltrosRecolhiveis } from "../../../components/filters/FiltrosRecolhiveis";
import { MisterioCard } from "../../../components/cards/MisterioCard";
import { SidebarDemonstrativa } from "../../../components/home/Sidebar";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { LinkDeAcao } from "../../../components/page/LinkDeAcao";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { ClassificacaoBadge } from "../../../components/ui/ClassificacaoBadge";
import { CLASSIFICACOES_MISTERIO } from "../../../constants/classificacoesMisterio";
import { ROUTES } from "../../../constants/routes";
import { classificacaoDoMisterio, lerClassificacaoMisterio, textoInvestigacoesAbertas } from "../../../lib/misterio";
import { misteriosDaListagem } from "../../../server/leitura/misterios";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";

// Listagem de mistérios (tabela `misterios`, ADR-044).
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ classificacao?: string }>;

export default async function MisteriosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const classificacao = lerClassificacaoMisterio(params.classificacao);
  const { itens, haMais } = await misteriosDaListagem(classificacao?.id);

  const abas = [
    { label: "Todos", href: ROUTES.misterios, active: !classificacao },
    ...CLASSIFICACOES_MISTERIO.map((item) => ({
      label: item.rotulo,
      href: `${ROUTES.misterios}?classificacao=${item.id}`,
      active: item.id === classificacao?.id,
    })),
  ];

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Mistérios"
            descricao="Mistérios, easter eggs e curiosidades para ler, assistir e ficar curioso."
            acao={<LinkDeAcao href={ROUTES.criarMisterio}>Criar mistério</LinkDeAcao>}
          />

          <FiltrosRecolhiveis resumoAtivo={classificacao ? `Classificação: ${classificacao.rotulo}` : undefined}>
            <FilterTabs label="Filtrar mistérios por classificação" tabs={abas} />
          </FiltrosRecolhiveis>

          <PageBody>
            {itens.length === 0 ? (
              <EmptyState
                titulo={classificacao ? "Nenhum mistério nesta classificação" : "Nenhum mistério por enquanto"}
                descricao={
                  classificacao
                    ? `Não há mistérios em "${classificacao.rotulo}" no momento. Tente outra classificação.`
                    : "Assim que novos mistérios forem publicados, eles aparecem aqui."
                }
              />
            ) : (
              <CardList>
                {itens.map((item) => (
                  <MisterioCard
                    key={item.id}
                    titulo={item.titulo}
                    descricao={item.descricao}
                    imagem={item.imagem}
                    selo={<ClassificacaoBadge classificacao={classificacaoDoMisterio(item.classificacao)} />}
                    meta={[textoInvestigacoesAbertas(item.investigacoesAbertas)]}
                    href={ROUTES.misterio(item.slug)}
                  />
                ))}
              </CardList>
            )}
            {haMais ? <NotaLista>Mostrando os {LIMITE_LISTA} mistérios mais recentes.</NotaLista> : null}
          </PageBody>
        </>
      }
      sidebar={<SidebarDemonstrativa />}
    />
  );
}
