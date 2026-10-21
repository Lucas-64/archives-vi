"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

// Sessão conhecida pela interface. O cookie é HttpOnly, então a única fonte é GET /api/v1/auth/eu.
// Isto serve só para decidir o que mostrar; a autorização é sempre do servidor, em cada operação.
export type EstadoSessao = "carregando" | "visitante" | "autenticado" | "erro";

export interface UsuarioSessao {
  usuario: string;
  nome: string;
  papel: "membro" | "moderador" | "admin";
}

interface ValorSessao {
  estado: EstadoSessao;
  usuario: UsuarioSessao | null;
  // Relê a sessão no servidor (após entrar, cadastrar ou sair).
  atualizar: () => Promise<void>;
}

const SessaoContexto = createContext<ValorSessao | null>(null);

const PAPEIS = new Set(["membro", "moderador", "admin"]);

// Extrai só o que a interface usa. Qualquer formato inesperado vira visitante (nunca "autenticado").
export function lerUsuarioDaResposta(corpo: unknown): UsuarioSessao | null {
  const u = (corpo as { usuario?: unknown } | null)?.usuario as Record<string, unknown> | null | undefined;
  if (!u || typeof u.usuario !== "string" || typeof u.nome !== "string" || typeof u.papel !== "string" || !PAPEIS.has(u.papel)) return null;
  return { usuario: u.usuario, nome: u.nome, papel: u.papel as UsuarioSessao["papel"] };
}

async function consultarSessao(): Promise<{ estado: EstadoSessao; usuario: UsuarioSessao | null }> {
  try {
    const resposta = await fetch("/api/v1/auth/eu", { credentials: "same-origin", cache: "no-store" });
    if (!resposta.ok) return { estado: "erro", usuario: null };
    const usuario = lerUsuarioDaResposta(await resposta.json());
    return usuario ? { estado: "autenticado", usuario } : { estado: "visitante", usuario: null };
  } catch {
    return { estado: "erro", usuario: null };
  }
}

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [valor, setValor] = useState<{ estado: EstadoSessao; usuario: UsuarioSessao | null }>({ estado: "carregando", usuario: null });
  // Descarta respostas atrasadas: vale sempre a consulta mais recente.
  const consulta = useRef(0);

  const atualizar = useCallback(async () => {
    const minha = ++consulta.current;
    const resultado = await consultarSessao();
    if (minha === consulta.current) setValor(resultado);
  }, []);

  useEffect(() => {
    void atualizar();
    // Outra aba pode ter entrado ou saído: ao voltar para esta, a sessão é relida.
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void atualizar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [atualizar]);

  const contexto = useMemo(() => ({ ...valor, atualizar }), [valor, atualizar]);
  return <SessaoContexto.Provider value={contexto}>{children}</SessaoContexto.Provider>;
}

export function useSessao(): ValorSessao {
  const contexto = useContext(SessaoContexto);
  if (!contexto) throw new Error("useSessao deve ser usado dentro de SessaoProvider.");
  return contexto;
}
