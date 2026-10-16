import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../../../components/auth/AuthCard";
import { FormularioCriarConta } from "../../../components/auth/FormularioCriarConta";
import { ROUTES } from "../../../constants/routes";

export const metadata: Metadata = {
  title: "Criar conta | ARCHIVES VI",
};

// Demonstrative sign-up page. It does not create an account (ADR-010, approved exception).
export default function CriarContaPage() {
  return (
    <AuthCard
      titulo="Criar conta"
      contexto="Escolha um nome de usuário para participar da comunidade quando o cadastro estiver disponível."
      rodape={<Link href={ROUTES.entrar}>Já tenho conta</Link>}
    >
      <FormularioCriarConta />
    </AuthCard>
  );
}
