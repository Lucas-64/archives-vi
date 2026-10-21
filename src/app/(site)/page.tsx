import { ContentGrid } from "../../components/layout/ContentGrid";
import { ExploreCards } from "../../components/home/ExploreCards";
import { Hero } from "../../components/home/Hero";
import { InvestigacoesRecentes } from "../../components/home/InvestigacoesRecentes";
import { investigacaoParaCaso } from "../../lib/adaptadores";
import { investigacoesDaListagem } from "../../server/leitura/investigacoes";

// Investigações reais (API, via serviço no processo; ADR-029). Sem sidebar: tópicos do fórum e atualizações
// não têm fonte real e não voltam como mocks. A seção "em alta" virou "recentes": não há critério de destaque
// na API (Tarefa 9 não autorizada), e os cards só mostram o que o banco devolve, mais recentes primeiro.
export const dynamic = "force-dynamic";

const QUANTIDADE_RECENTES = 3;

export default async function HomePage() {
  const { itens } = await investigacoesDaListagem();
  const recentes = itens.slice(0, QUANTIDADE_RECENTES).map(investigacaoParaCaso);

  return (
    <ContentGrid
      main={
        <>
          <Hero />
          <ExploreCards />
          <InvestigacoesRecentes casos={recentes} />
        </>
      }
    />
  );
}
