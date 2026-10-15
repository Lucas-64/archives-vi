import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Skeleton } from "../../../../components/states/Skeleton";

// Loading state for /investigacoes/[slug], sized like the detail layout.
export default function InvestigacaoLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="16px" width="280px" />
          <Skeleton height="140px" radius="lg" />
          <Skeleton height="52px" radius="lg" />
          <Skeleton height="260px" radius="lg" />
        </>
      }
      sidebar={
        <>
          <Skeleton height="140px" radius="lg" />
          <Skeleton height="180px" radius="lg" />
        </>
      }
    />
  );
}
