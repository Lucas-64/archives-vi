import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { PerfilSkeleton, PerfilSkeletonLateral } from "../../../../components/perfil/PerfilSkeleton";

// Loading state for /perfil/[usuario]. Mirrors the profile: the main column (breadcrumb, identity,
// indicators, tabs and content) and the profile sidebar (patente and conquistas). No global sidebar.
export default function PerfilLoading() {
  return <ContentGrid main={<PerfilSkeleton />} sidebar={<PerfilSkeletonLateral />} />;
}
