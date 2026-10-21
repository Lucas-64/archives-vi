"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ROUTES } from "../../constants/routes";
import { useSessao } from "./SessaoProvider";

// Conteúdo que só faz sentido com sessão. Sem sessão, o visitante vai para /entrar e o conteúdo nem chega
// a ser renderizado no navegador. Isto é conveniência de navegação: os dados protegidos continuam
// protegidos pela API, que exige a sessão em cada requisição.
export function ExigeSessao({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { estado } = useSessao();

  useEffect(() => {
    if (estado === "visitante") router.replace(ROUTES.entrar);
  }, [estado, router]);

  if (estado === "autenticado") return children;
  if (estado === "erro") return <p role="alert">Não foi possível verificar sua sessão. Recarregue a página.</p>;
  return null;
}

// Páginas de entrada e cadastro: quem já tem sessão vai para o início.
export function RedirecionaSeAutenticado() {
  const router = useRouter();
  const { estado } = useSessao();

  useEffect(() => {
    if (estado === "autenticado") router.replace(ROUTES.inicio);
  }, [estado, router]);

  return null;
}
