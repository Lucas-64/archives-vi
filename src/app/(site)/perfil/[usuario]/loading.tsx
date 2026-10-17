import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { PerfilSkeleton } from "../../../../components/perfil/PerfilSkeleton";

// Loading state for /perfil/[usuario]. Mirrors the profile hierarchy: breadcrumb, identity, indicators,
// tabs and the Visão geral content. No sidebar: the profile page has none (ContentGrid uses full width).
export default function PerfilLoading() {
  return <ContentGrid main={<PerfilSkeleton />} />;
}
