"use client";

import { useId, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import styled from "styled-components";

import { ABAS_PERFIL } from "../../lib/perfil";
import {
  assinarLocalizacao,
  definirParametroDaUrl,
  lerBuscaNoNavegador,
  lerBuscaNoServidor,
} from "./localizacao";

// Definição de uma aba. A primeira aba é a padrão e não aparece na URL (parametro undefined).
export interface AbaDefinicao {
  chave: string;
  rotulo: string;
  parametro?: string;
}

export interface AbasPerfilProps {
  // Conteúdo de cada aba, montado pelo servidor. Só o painel ativo entra no DOM.
  paineis: Record<string, ReactNode>;
  // Abas exibidas. Padrão: as abas do perfil público (ABAS_PERFIL).
  abas?: readonly AbaDefinicao[];
  // Nome do parâmetro de URL que guarda a aba. Padrão: "aba".
  parametro?: string;
  // Rótulo acessível da lista de abas.
  rotuloLista?: string;
  // "padrao" é o estilo do perfil público. "caixa" (Meu Perfil, ADR-021) usa rótulos em maiúsculas.
  variante?: "padrao" | "caixa";
  // Ações exibidas à direita da lista de abas, na mesma linha (só "caixa" usa).
  acoes?: ReactNode;
}

// Escolhe a aba pela URL. Valor desconhecido cai na aba padrão, como em lerAbaPerfil.
function lerAba(valor: string | null, abas: readonly AbaDefinicao[]): string {
  const aba = abas.find((item) => item.parametro !== undefined && item.parametro === valor);
  return aba ? aba.chave : abas[0].chave;
}

// Abas como botões ARIA (tablist/tab/tabpanel). Não usa FilterTabs, porque ele navega por link e não
// troca o painel no cliente. Escolhas:
// - Clique: pushState cria uma entrada de histórico, então voltar e avançar percorrem as abas.
// - Setas, Home e End: só movem o foco (ativação manual, como recomenda o padrão ARIA). Assim, uma
//   tecla repetida não empilha entradas no histórico. Enter e Espaço ativam a aba.
// - Não há replaceState: a aba padrão também é uma entrada, sem parâmetro.
export function AbasPerfil({
  paineis,
  abas = ABAS_PERFIL,
  parametro = "aba",
  rotuloLista = "Seções do perfil",
  variante = "padrao",
  acoes,
}: AbasPerfilProps) {
  const busca = useSyncExternalStore(assinarLocalizacao, lerBuscaNoNavegador, lerBuscaNoServidor);
  const abaAtiva = lerAba(new URLSearchParams(busca).get(parametro), abas);
  const caixa = variante === "caixa";

  const idBase = useId();
  const botoes = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Clicar na aba já ativa, com a URL já correta, não empilha entrada (ver definirParametroDaUrl).
  function selecionar(chave: string) {
    const aba = abas.find((item) => item.chave === chave);
    definirParametroDaUrl(parametro, aba?.parametro);
  }

  function navegarComTeclado(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = abas.length;
    let proximo: number | undefined;

    if (evento.key === "ArrowRight") proximo = (indice + 1) % total;
    else if (evento.key === "ArrowLeft") proximo = (indice - 1 + total) % total;
    else if (evento.key === "Home") proximo = 0;
    else if (evento.key === "End") proximo = total - 1;

    if (proximo === undefined) return;

    evento.preventDefault();
    botoes.current.get(abas[proximo].chave)?.focus();
  }

  const lista = (
    <Lista role="tablist" aria-label={rotuloLista} $caixa={caixa}>
      {abas.map((aba, indice) => {
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
              $caixa={caixa}
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
  );

  return (
    <Area>
      {acoes ? (
        <Barra>
          {lista}
          <Acoes>{acoes}</Acoes>
        </Barra>
      ) : (
        lista
      )}

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

// Linha com as abas e as ações (Meu Perfil). A lista ocupa o espaço e as ações ficam à direita.
const Barra = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 16px;
  min-width: 0;
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
`;

// Mesmo padrão visual de FilterTabs: linha inferior, sublinhado rosa na aba ativa, rolagem horizontal
// no celular com a barra oculta.
const Lista = styled.ul<{ $caixa: boolean }>`
  display: flex;
  gap: ${({ $caixa }) => ($caixa ? "28px" : "24px")};
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
  list-style: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  max-width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Aba = styled.button<{ $ativa: boolean; $caixa: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  font-family: inherit;
  font-size: ${({ $caixa }) => ($caixa ? "13px" : "14px")};
  font-weight: 600;
  letter-spacing: ${({ $caixa }) => ($caixa ? "0.04em" : "normal")};
  text-transform: ${({ $caixa }) => ($caixa ? "uppercase" : "none")};
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
