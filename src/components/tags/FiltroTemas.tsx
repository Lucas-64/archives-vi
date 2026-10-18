"use client";

import styled from "styled-components";

import type { TagTematica as IdTagTematica } from "../../constants/tagsTematicas";
import { PilulaBotao, PilulaLink, TagTematica } from "./TagTematica";

export interface OpcaoTema {
  // Tema do catálogo. Undefined é a opção "Todos os temas".
  tag?: IdTagTematica;
  // Obrigatório no modo de links. No modo de botões (onSelecionar), não é usado.
  href?: string;
  ativa: boolean;
}

export interface FiltroTemasProps {
  label: string;
  // Dados simples, montados pelo servidor. Funções não podem atravessar a fronteira para um
  // componente cliente, por isso o endereço de cada opção chega pronto.
  opcoes: OpcaoTema[];
  // Quando informado, as opções viram botões, e a seleção é devolvida a quem chamou (ex.: o perfil,
  // que troca ?tag= sem recarregar a página). Undefined devolve "Todos os temas".
  onSelecionar?: (tag?: IdTagTematica) => void;
}

// Filtro por tema. Modo de links (padrão, /publicacoes): cada opção é um link (?tag=...), para
// funcionar sem JavaScript e manter a seleção na URL. Modo de botões (perfil): a seleção vai para
// onSelecionar. Os temas vêm sempre do catálogo; nenhum tema é inventado aqui.
export function FiltroTemas({ label, opcoes, onSelecionar }: FiltroTemasProps) {
  return (
    <Nav aria-label={label}>
      <Lista>
        {opcoes.map((opcao) => (
          <li key={opcao.tag ?? "todos"}>
            {opcao.tag ? (
              onSelecionar ? (
                <TagTematica tag={opcao.tag} ativa={opcao.ativa} onSelecionar={() => onSelecionar(opcao.tag)} />
              ) : (
                <TagTematica tag={opcao.tag} href={opcao.href} ativa={opcao.ativa} />
              )
            ) : onSelecionar ? (
              <PilulaBotao type="button" aria-pressed={opcao.ativa} $ativa={opcao.ativa} onClick={() => onSelecionar(undefined)}>
                Todos os temas
              </PilulaBotao>
            ) : (
              <PilulaLink href={opcao.href ?? ""} aria-current={opcao.ativa ? "true" : undefined} $ativa={opcao.ativa}>
                Todos os temas
              </PilulaLink>
            )}
          </li>
        ))}
      </Lista>
    </Nav>
  );
}

const Nav = styled.nav`
  min-width: 0;
`;

const Lista = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;
