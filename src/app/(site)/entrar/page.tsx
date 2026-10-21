import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../../../components/auth/AuthCard";
import { FormularioEntrar } from "../../../components/auth/FormularioEntrar";
import { RedirecionaSeAutenticado } from "../../../components/auth/GuardaSessao";
import { ROUTES } from "../../../constants/routes";

export const metadata: Metadata = {
  title: "Entrar | ARCHIVES VI",
};

// Página de entrada. Quem já tem sessão é levado ao início (RedirecionaSeAutenticado).
export default function EntrarPage() {
  return (
    <>
      <RedirecionaSeAutenticado />
      <AuthCard
        titulo="Entrar"
        contexto="Entre com seu e-mail e sua senha para acessar sua conta."
        rodape={<Link href={ROUTES.criarConta}>Criar conta</Link>}
      >
        <FormularioEntrar />
      </AuthCard>
    </>
  );
}
