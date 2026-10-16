import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../../../components/auth/AuthCard";
import { FormularioEntrar } from "../../../components/auth/FormularioEntrar";
import { ROUTES } from "../../../constants/routes";

export const metadata: Metadata = {
  title: "Entrar | ARCHIVES VI",
};

// Demonstrative sign-in page. It does not authenticate anyone (ADR-010, approved exception).
export default function EntrarPage() {
  return (
    <AuthCard
      titulo="Entrar"
      contexto="Entre para seguir investigações, comentar e enviar pistas. Esta versão ainda não tem autenticação."
      rodape={<Link href={ROUTES.criarConta}>Criar conta</Link>}
    >
      <FormularioEntrar />
    </AuthCard>
  );
}
