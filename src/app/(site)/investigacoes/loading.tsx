import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { Skeleton } from "../../../components/states/Skeleton";

// Loading state for /investigacoes. Mirrors the header, tabs, card list and sidebar.
export default function InvestigacoesLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="96px" radius="lg" />
          <PageBody>
            <Skeleton height="44px" radius="md" />
            <CardList>
              <Skeleton height="180px" radius="lg" />
              <Skeleton height="180px" radius="lg" />
              <Skeleton height="180px" radius="lg" />
            </CardList>
          </PageBody>
        </>
      }
      sidebar={
        <>
          <Skeleton height="220px" radius="lg" />
          <Skeleton height="220px" radius="lg" />
        </>
      }
    />
  );
}
