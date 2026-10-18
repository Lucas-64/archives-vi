"use client";

import styled from "styled-components";

import type { Conquista } from "../../types/Conquista";
import { Badge, type BadgeVariant } from "../ui/Badge";
import { Card } from "../ui/Card";

export interface ConquistasInvestigadorProps {
  conquistas: Conquista[];
}

// Cores discretas e distintas para os rótulos, com as mesmas variantes do Badge usado nos cards.
// Vermelho (danger) fica de fora, porque significa "refutado" no restante do site.
const VARIANTES: readonly BadgeVariant[] = ["info", "success", "warning", "primary", "secondary"];

// Seção "Conquistas do Investigador": só os nomes, em rótulos compactos. Sem descrição, contador,
// ícone, link ou ação. Os dados são do próprio membro (mocks), não o catálogo temático.
export function ConquistasInvestigador({ conquistas }: ConquistasInvestigadorProps) {
  return (
    <Secao aria-labelledby="perfil-conquistas">
      <Card padding="medium">
        <Titulo id="perfil-conquistas">Conquistas do Investigador</Titulo>

        {conquistas.length === 0 ? (
          <Vazio>Nenhuma conquista registrada.</Vazio>
        ) : (
          <Lista>
            {conquistas.map((conquista, indice) => (
              <li key={conquista.id}>
                <Badge size="small" variant={VARIANTES[indice % VARIANTES.length]} uppercase>
                  {conquista.nome}
                </Badge>
              </li>
            ))}
          </Lista>
        )}
      </Card>
    </Secao>
  );
}

const Secao = styled.section`
  min-width: 0;
`;

const Titulo = styled.h2`
  margin-bottom: 16px;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
`;

const Lista = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
`;

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
