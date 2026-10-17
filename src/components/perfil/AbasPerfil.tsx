"use client";

import { useId, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import styled from "styled-components";

import { ABAS_PERFIL, type AbaPerfil, lerAbaPerfil } from "../../lib/perfil";

export interface AbasPerfilProps {
  // Conteúdo de cada aba, montado pelo servidor. Só o painel ativo entra no DOM.
  paineis: Record<AbaPerfil, ReactNode>;
}

// Evento disparado após pushState, que não emite popstate. Mantém a aba sincronizada com a URL.
const EVENTO_LOCALIZACAO = "perfil-abas:localizacao";

function assinarLocalizacao(aoMudar: () => void) {
  window.addEventListener("popstate", aoMudar);
  window.addEventListener(EVENTO_LOCALIZACAO, aoMudar);
  return () => {
    window.removeEventListener("popstate", aoMudar);
    window.removeEventListener(EVENTO_LOCALIZACAO, aoMudar);
  };
}

function lerBuscaNoNavegador() {
  return window.location.search;
}

// Durante a hidratação e na geração estática, a aba é a Visão geral. O cliente corrige logo em seguida.
function lerBuscaNoServidor() {
  return "";
}

// Abas do perfil como botões ARIA (tablist/tab/tabpanel). Não usa FilterTabs, porque ele navega por
// link e não troca o painel no cliente. Escolhas:
// - Clique: pushState cria uma entrada de histórico, então voltar e avançar percorrem as abas.
// - Setas, Home e End: só movem o foco (ativação manual, como recomenda o padrão ARIA). Assim, uma
//   tecla repetida não empilha entradas no histórico. Enter e Espaço ativam a aba.
// - Não há replaceState: a Visão geral também é uma entrada, sem parâmetro.
export function AbasPerfil({ paineis }: AbasPerfilProps) {
  const busca = useSyncExternalStore(assinarLocalizacao, lerBuscaNoNavegador, lerBuscaNoServidor);
  const abaAtiva = lerAbaPerfil(new URLSearchParams(busca).get("aba"));

  const idBase = useId();
  const botoes = useRef<Map<AbaPerfil, HTMLButtonElement>>(new Map());

  function selecionar(chave: AbaPerfil) {
    const destino = new URL(window.location.href);
    const aba = ABAS_PERFIL.find((item) => item.chave === chave);

    if (aba?.parametro) {
      destino.searchParams.set("aba", aba.parametro);
    } else {
      destino.searchParams.delete("aba");
    }

    // Não empilha entrada repetida: clicar na aba já ativa, com a URL já correta, não faz nada.
    if (destino.href === window.location.href) return;

    window.history.pushState(null, "", destino.href);
    window.dispatchEvent(new Event(EVENTO_LOCALIZACAO));
  }

  function navegarComTeclado(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = ABAS_PERFIL.length;
    let proximo: number | undefined;

    if (evento.key === "ArrowRight") proximo = (indice + 1) % total;
    else if (evento.key === "ArrowLeft") proximo = (indice - 1 + total) % total;
    else if (evento.key === "Home") proximo = 0;
    else if (evento.key === "End") proximo = total - 1;

    if (proximo === undefined) return;

    evento.preventDefault();
    botoes.current.get(ABAS_PERFIL[proximo].chave)?.focus();
  }

  return (
    <Area>
      <Lista role="tablist" aria-label="Seções do perfil">
        {ABAS_PERFIL.map((aba, indice) => {
          const ativa = aba.chave === abaAtiva;
          return (
            <li key={aba.chave} role="presentation">
              <Aba
                type="button"
                role="tab"
                id={`${idBase}-aba-${aba.chave}`}
                aria-selected={ativa}
                aria-controls={ativa ? `${idBase}-painel` : undefined}
                tabIndex={ativa ? 0 : -1}
                $ativa={ativa}
                ref={(elemento) => {
                  if (elemento) botoes.current.set(aba.chave, elemento);
                  else botoes.current.delete(aba.chave);
                }}
                onClick={() => selecionar(aba.chave)}
                onKeyDown={(evento) => navegarComTeclado(evento, indice)}
              >
                {aba.rotulo}
              </Aba>
            </li>
          );
        })}
      </Lista>

      <Painel role="tabpanel" id={`${idBase}-painel`} aria-labelledby={`${idBase}-aba-${abaAtiva}`}>
        {paineis[abaAtiva]}
      </Painel>
    </Area>
  );
}

const Area = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;

// Mesmo padrão visual de FilterTabs: linha inferior, sublinhado rosa na aba ativa, rolagem horizontal
// no celular com a barra oculta.
const Lista = styled.ul`
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
  list-style: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Aba = styled.button<{ $ativa: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ $ativa, theme }) => ($ativa ? theme.colors.text : theme.colors.textSecondary)};

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: ${({ theme }) => theme.colors.pink};
    opacity: ${({ $ativa }) => ($ativa ? 1 : 0)};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

// Espaço entre os blocos de um mesmo painel (ex.: destaque e publicações na Visão geral).
const Painel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;
