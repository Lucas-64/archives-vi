import { ContentGrid } from "../../../components/layout/ContentGrid";
import { PageBody } from "../../../components/page/PageBody";
import { Skeleton } from "../../../components/states/Skeleton";

// Loading state for /criar. Mirrors the header, the form card and the preview in the sidebar.
export default function CriarLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="96px" radius="lg" />
          <PageBody>
            <Skeleton height="520px" radius="lg" />
          </PageBody>
        </>
      }
      sidebar={<Skeleton height="360px" radius="lg" />}
    />
  );
}
