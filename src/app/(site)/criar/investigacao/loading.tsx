import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { PageBody } from "../../../../components/page/PageBody";
import { Skeleton } from "../../../../components/states/Skeleton";

// Loading state for /criar/investigacao. Mirrors the header and the form card (no sidebar).
export default function CriarInvestigacaoLoading() {
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
