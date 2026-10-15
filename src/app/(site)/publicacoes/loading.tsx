import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { Skeleton } from "../../../components/states/Skeleton";

// Loading state for /publicacoes. Mirrors the header, tabs, card list and sidebar.
export default function PublicacoesLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="96px" radius="lg" />
          <PageBody>
            <Skeleton height="44px" radius="md" />
            <CardList>
              <Skeleton height="200px" radius="lg" />
              <Skeleton height="200px" radius="lg" />
              <Skeleton height="200px" radius="lg" />
              <Skeleton height="200px" radius="lg" />
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
