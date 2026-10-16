import { AuthCardSkeleton } from "../../../components/auth/AuthCardSkeleton";

// Loading state for /entrar. Mirrors the card: title, context, two fields, button and notice.
export default function EntrarLoading() {
  return <AuthCardSkeleton campos={2} />;
}
