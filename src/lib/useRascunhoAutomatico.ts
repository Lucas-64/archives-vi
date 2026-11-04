"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Rascunho automático de formulário longo, só no navegador (localStorage). A chave inclui o formulário e o
// usuário, para não vazar texto entre contas no mesmo aparelho. Guarda só o que o formulário já tem em memória
// (texto e URL de imagem já enviada). Qualquer falha de armazenamento é ignorada: o formulário funciona sem rascunho.
const ATRASO_MS = 800;

function ler<T>(chave: string): T | null {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento: segue sem rascunho */
  }
}

function apagar(chave: string) {
  try {
    window.localStorage.removeItem(chave);
  } catch {
    /* ignora */
  }
}

export interface RascunhoAutomatico {
  // Verdadeiro quando um rascunho salvo foi aplicado ao abrir o formulário.
  restaurado: boolean;
  // Apaga o rascunho salvo (ao publicar com sucesso).
  limpar: () => void;
  // Apaga o rascunho e devolve o valor vazio ao formulário.
  descartar: () => void;
}

// `chave` nula desliga o recurso (ex.: sessão ainda não conhecida). `vazio` é o estado inicial do formulário.
export function useRascunhoAutomatico<T>(
  chave: string | null,
  valor: T,
  vazio: T,
  aplicar: (valor: T) => void,
  estaVazio: (valor: T) => boolean,
): RascunhoAutomatico {
  const [restaurado, setRestaurado] = useState(false);
  const pronto = useRef<string | null>(null);
  const marcarRestaurado = () => void Promise.resolve().then(() => setRestaurado(true));

  // Restaura uma vez por chave. Só sobrescreve se o formulário ainda estiver vazio.
  useEffect(() => {
    if (!chave || pronto.current === chave) return;
    pronto.current = chave;
    const salvo = ler<T>(chave);
    if (salvo && !estaVazio(salvo) && estaVazio(valor)) {
      aplicar({ ...vazio, ...salvo });
      marcarRestaurado();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  // Salva com atraso curto. Formulário vazio não deixa rascunho.
  useEffect(() => {
    if (!chave || pronto.current !== chave) return;
    const t = window.setTimeout(() => (estaVazio(valor) ? apagar(chave) : gravar(chave, valor)), ATRASO_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, valor]);

  const limpar = useCallback(() => {
    if (chave) apagar(chave);
    pronto.current = chave;
  }, [chave]);

  const descartar = useCallback(() => {
    if (chave) apagar(chave);
    aplicar(vazio);
    setRestaurado(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return { restaurado, limpar, descartar };
}
