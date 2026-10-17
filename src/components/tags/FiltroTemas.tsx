"use client";

import styled from "styled-components";

import type { TagTematica as IdTagTematica } from "../../constants/tagsTematicas";
import { PilulaLink, TagTematica } from "./TagTematica";

export interface OpcaoTema {
  // Tema do catálogo. Undefined é a opção "Todos os temas".
  tag?: IdTagTematica;
  href: string;
  ativa: boolean;
}

export interface FiltroTemasProps {
  label: string;
  // Dados simples, montados pelo servidor. Funções não podem atravessar a fronteira para um
  // componente cliente, por isso o endereço de cada opção chega pronto.
  opcoes: OpcaoTema[];
}

// Filtro por tema da listagem de publicações. Cada opção é um link (?tag=...), para funcionar sem
// JavaScript e manter a seleção na URL. Os temas vêm do catálogo; nenhum tema é inventado aqui.
export function FiltroTemas({ label, opcoes }: FiltroTemasProps) {
  return (
    <Nav aria-label={label}>
      <Lista>
        {opcoes.map((opcao) => (
          <li key={opcao.tag ?? "todos"}>
            {opcao.tag ? (
              <TagTematica tag={opcao.tag} href={opcao.href} ativa={opcao.ativa} />
            ) : (
              <PilulaLink href={opcao.href} aria-current={opcao.ativa ? "true" : undefined} $ativa={opcao.ativa}>
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
