import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { Skeleton } from "../../../components/states/Skeleton";

// Loading state for /buscar. Mirrors the header, search field, tabs and result list.
export default function BuscaLoading() {
  return (
    <>
      <Skeleton height="96px" radius="lg" />
      <PageBody>
        <Skeleton height="44px" radius="md" />
        <Skeleton height="44px" radius="md" />
        <CardList>
          <Skeleton height="200px" radius="lg" />
          <Skeleton height="200px" radius="lg" />
          <Skeleton height="200px" radius="lg" />
        </CardList>
      </PageBody>
    </>
  );
}
