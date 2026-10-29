import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { PageBody } from "../../../../components/page/PageBody";
import { Skeleton } from "../../../../components/states/Skeleton";

// Loading state for /criar/misterio. Mirrors the header and the form card (no sidebar).
export default function CriarMisterioLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="96px" radius="lg" />
          <PageBody>
            <Skeleton height="640px" radius="lg" />
          </PageBody>
        </>
      }
    />
  );
}
