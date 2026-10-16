import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { CardList } from "../../../../components/page/CardList";
import { PageBody } from "../../../../components/page/PageBody";
import { Skeleton } from "../../../../components/states/Skeleton";

// Loading state for /perfil/[usuario]. Mirrors breadcrumb, profile header, publications and sidebar.
export default function PerfilLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="16px" width="260px" radius="sm" />
          <Skeleton height="168px" radius="lg" />
          <PageBody>
            <Skeleton height="28px" width="200px" radius="sm" />
            <CardList>
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
