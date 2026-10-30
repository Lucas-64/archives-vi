"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { Button } from "../ui/Button";

export interface CartaoEnviarEvidenciaProps {
  // Sessão com permissão para enviar (calculada pelo servidor; a API repete a verificação).
  podeEnviar: boolean;
  // Formulário de envio. Só entra no DOM depois de aberto.
  children: ReactNode;
}

// Cartão recolhido para enviar evidência (ADR-043): fechado por padrão; o formulário só abre ao clicar no botão
// (expande no próprio cartão). `aria-expanded` e `aria-controls` no botão, foco no primeiro campo ao abrir, Esc
// fecha e devolve o foco ao botão. Visitante vê o cartão com um botão que leva ao login e volta para esta página.
export function CartaoEnviarEvidencia({ podeEnviar, children }: CartaoEnviarEvidenciaProps) {
  const pathname = usePathname() ?? "/";
  const idPainel = useId();
  const [aberto, setAberto] = useState(false);
  const areaBotao = useRef<HTMLSpanElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aberto) painel.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
  }, [aberto]);

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "Escape") return;
    evento.stopPropagation();
    setAberto(false);
    areaBotao.current?.querySelector<HTMLElement>("button")?.focus();
  }

  return (
    <Cartao aria-label="Enviar evidência">
      <Topo>
        <Textos>
          <Titulo>Enviar evidência</Titulo>
          <Descricao>
            {podeEnviar
              ? "Tem um documento ou uma referência para esta investigação? Envie para análise."
              : "Enviar evidências exige conta."}
          </Descricao>
        </Textos>

        {podeEnviar ? (
          <span ref={areaBotao}>
            <Button
            type="button"
            variant="primary"
            size="small"
            aria-expanded={aberto}
            aria-controls={idPainel}
            onClick={() => setAberto((valor) => !valor)}
          >
            {aberto ? "Fechar" : "Enviar evidência"}
            </Button>
          </span>
        ) : (
          <LinkEntrar href={`${ROUTES.entrar}?voltar=${encodeURIComponent(pathname)}`}>Entrar para enviar evidência</LinkEntrar>
        )}
      </Topo>

      {podeEnviar ? (
        <Painel id={idPainel} ref={painel} hidden={!aberto} onKeyDown={aoTeclar}>
          {aberto ? children : null}
        </Painel>
      ) : null}
    </Cartao>
  );
}

const Cartao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Topo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
`;

const Textos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Titulo = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Descricao = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// `hidden` precisa vencer o display do painel.
const Painel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;

  &[hidden] {
    display: none;
  }
`;

const LinkEntrar = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gradientStart}, ${({ theme }) => theme.colors.gradientEnd});

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
  }
`;
