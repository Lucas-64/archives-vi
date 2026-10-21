import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "../../../components/auth/AuthCard";
import { FormularioCriarConta } from "../../../components/auth/FormularioCriarConta";
import { RedirecionaSeAutenticado } from "../../../components/auth/GuardaSessao";
import { ROUTES } from "../../../constants/routes";

export const metadata: Metadata = {
  title: "Criar conta | ARCHIVES VI",
};

// Página de cadastro. Quem já tem sessão é levado ao início (RedirecionaSeAutenticado).
export default function CriarContaPage() {
  return (
    <>
      <RedirecionaSeAutenticado />
      <AuthCard
        titulo="Criar conta"
        contexto="Escolha um nome de usuário, informe seu e-mail e crie uma senha para participar da comunidade."
        rodape={<Link href={ROUTES.entrar}>Já tenho conta</Link>}
      >
        <FormularioCriarConta />
      </AuthCard>
    </>
  );
}
