import { ContentGrid } from "../../components/layout/ContentGrid";
import { ExploreCards } from "../../components/home/ExploreCards";
import { Hero } from "../../components/home/Hero";
import { Sidebar } from "../../components/home/Sidebar";
import { TrendingCases } from "../../components/home/TrendingCases";
import {
  getAtualizacoes,
  getDestaques,
  getInvestigacoesEmAlta,
  getTopicosForum,
} from "../../lib/data";

export default async function HomePage() {
  const [destaques, emAlta, topicos, atualizacoes] = await Promise.all([
    getDestaques(),
    getInvestigacoesEmAlta(),
    getTopicosForum(),
    getAtualizacoes(),
  ]);

  return (
    <ContentGrid
      main={
        <>
          <Hero destaques={destaques} />
          <ExploreCards />
          <TrendingCases casos={emAlta} />
        </>
      }
      sidebar={<Sidebar topicos={topicos} atualizacoes={atualizacoes} />}
    />
  );
}
