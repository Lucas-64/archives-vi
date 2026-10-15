"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { Button } from "../ui/Button";

export interface AcaoRestritaProps {
  rotulo: string;
  mensagem?: string;
}

// An action that requires authentication. It is shown disabled, with a link to sign in.
// It never simulates the action: there is no session, API or storage behind it yet.
export function AcaoRestrita({
  rotulo,
  mensagem = "Esta ação exige autenticação.",
}: AcaoRestritaProps) {
  return (
    <Wrapper>
      <Button variant="outline" size="small" disabled>
        {rotulo}
      </Button>
      <Mensagem>
        {mensagem} <Link href={ROUTES.entrar}>Entre para continuar</Link>
      </Mensagem>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
`;

const Mensagem = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;
