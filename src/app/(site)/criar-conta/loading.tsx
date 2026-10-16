import { AuthCardSkeleton } from "../../../components/auth/AuthCardSkeleton";

// Loading state for /criar-conta. Mirrors the card: title, context, four fields, button and notice.
export default function CriarContaLoading() {
  return <AuthCardSkeleton campos={4} />;
}
