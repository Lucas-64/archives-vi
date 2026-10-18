import { ContentGrid } from "../../../components/layout/ContentGrid";
import { MeuPerfilSkeleton } from "../../../components/perfil/MeuPerfilSkeleton";

// Loading de Meu Perfil: mesma hierarquia da página (identidade, abas e conteúdo), sem sidebar.
export default function MeuPerfilLoading() {
  return <ContentGrid main={<MeuPerfilSkeleton />} />;
}
