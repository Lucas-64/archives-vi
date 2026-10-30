import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../../../components/auth/AuthCard";
import { FormularioEntrar } from "../../../components/auth/FormularioEntrar";
import { RedirecionaSeAutenticado } from "../../../components/auth/GuardaSessao";
import { ROUTES } from "../../../constants/routes";
import { destinoInternoSeguro } from "../../../lib/destinoInterno";

export const metadata: Metadata = {
  title: "Entrar | ARCHIVES VI",
};

// Página de entrada. Quem já tem sessão é levado ao destino (`?voltar=` com caminho interno seguro) ou ao início.
export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ voltar?: string | string[] }> }) {
  const destino = destinoInternoSeguro((await searchParams).voltar);

  return (
    <>
      <RedirecionaSeAutenticado destino={destino} />
      <AuthCard
        titulo="Entrar"
        contexto="Entre com seu e-mail e sua senha para acessar sua conta."
        rodape={<Link href={ROUTES.criarConta}>Criar conta</Link>}
      >
        <FormularioEntrar destino={destino} />
      </AuthCard>
    </>
  );
}
