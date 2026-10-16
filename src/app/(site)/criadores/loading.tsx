import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { Skeleton } from "../../../components/states/Skeleton";

// Loading state for /criadores. Mirrors the header and three creator cards, without sidebar.
export default function CriadoresLoading() {
  return (
    <>
      <Skeleton height="96px" radius="lg" />
      <PageBody>
        <CardList>
          <Skeleton height="140px" radius="lg" />
          <Skeleton height="140px" radius="lg" />
          <Skeleton height="140px" radius="lg" />
        </CardList>
      </PageBody>
    </>
  );
}
