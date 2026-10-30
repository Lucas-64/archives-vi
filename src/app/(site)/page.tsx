import { ContentGrid } from "../../components/layout/ContentGrid";
import { ExploreCards } from "../../components/home/ExploreCards";
import { Hero, type DestaqueHero } from "../../components/home/Hero";
import { InvestigacoesRecentes } from "../../components/home/InvestigacoesRecentes";
import { SidebarDemonstrativa } from "../../components/home/Sidebar";
import { ROUTES } from "../../constants/routes";
import { investigacaoParaCaso } from "../../lib/adaptadores";
import { investigacoesDaListagem } from "../../server/leitura/investigacoes";

// Investigações reais (API, via serviço no processo; ADR-029). A sidebar (tópicos do fórum e atualizações) não
// tem fonte real: volta com um item de exemplo de cada, rotulado como demonstração (ADR-036). A seção "em alta"
// virou "recentes": não há critério de destaque na API (Tarefa 9 não autorizada), e os cards só mostram o que o
// banco devolve, mais recentes primeiro.
export const dynamic = "force-dynamic";

const QUANTIDADE_RECENTES = 3;

export default async function HomePage() {
  const { itens } = await investigacoesDaListagem();
  const recentes = itens.slice(0, QUANTIDADE_RECENTES).map(investigacaoParaCaso);

  // Slides do banner depois da apresentação: as mesmas investigações recentes, sem critério de curadoria.
  const destaques: DestaqueHero[] = recentes.map((caso) => ({
    id: caso.id,
    rotulo: "Mistério recente",
    titulo: caso.title,
    descricao: caso.description,
    href: ROUTES.investigacao(caso.id),
  }));

  return (
    <ContentGrid
      main={
        <>
          <Hero destaques={destaques} />
          <ExploreCards />
          <InvestigacoesRecentes casos={recentes} />
        </>
      }
      sidebar={<SidebarDemonstrativa />}
    />
  );
}
