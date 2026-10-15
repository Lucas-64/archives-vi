import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Skeleton } from "../../../../components/states/Skeleton";

// Loading state for /publicacao/[slug], sized like the detail layout.
export default function PublicacaoLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="16px" width="260px" />
          <Skeleton height="120px" radius="lg" />
          <Skeleton height="180px" radius="lg" />
        </>
      }
      sidebar={
        <>
          <Skeleton height="180px" radius="lg" />
          <Skeleton height="200px" radius="lg" />
        </>
      }
    />
  );
}
