import { ContentGrid } from "../../components/layout/ContentGrid";
import { Skeleton } from "../../components/states/Skeleton";

// Loading state for the public shell. Sizes follow the Home layout to avoid layout shift.
export default function SiteLoading() {
  return (
    <ContentGrid
      main={
        <>
          <Skeleton height="360px" radius="xl" />
          <Skeleton height="140px" radius="lg" />
          <Skeleton height="260px" radius="lg" />
        </>
      }
    />
  );
}
