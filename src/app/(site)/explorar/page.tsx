import { ExploreGrid } from "../../../components/home/ExploreCards";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { PageHeader } from "../../../components/page/PageHeader";

// Atalhos para as áreas do site. As seções "recentes" foram removidas (decisão D2, Lucas, 2026-11-04): repetiam
// as listagens. Mapa e Galeria não têm rota nem dados e ficaram de fora.
export default function ExplorarPage() {
  return (
    <ContentGrid
      main={
        <>
          <PageHeader titulo="Explorar" descricao="Escolha por onde começar: mistérios e investigações da comunidade." />
          <ExploreGrid />
        </>
      }
    />
  );
}
