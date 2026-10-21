"use client";

import Link from "next/link";
import { useState } from "react";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarNumero } from "../../lib/formatacao";
import { alterarCurtidaNaApi } from "../../lib/publicacoesApi";
import { useSessao } from "../auth/SessaoProvider";
import { Button } from "../ui/Button";

export interface BotaoCurtirProps {
  slug: string;
  curtidas: number;
  euCurti: boolean;
}

// Curtir pela API real. Não há estado otimista: o botão fica ocupado até o servidor responder e passa a
// mostrar exatamente o que ele devolveu. Em caso de falha, mantém o estado anterior e explica o que houve.
export function BotaoCurtir({ slug, curtidas, euCurti }: BotaoCurtirProps) {
  const { estado } = useSessao();
  const [atual, setAtual] = useState({ curtidas, euCurti });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar() {
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    const resultado = await alterarCurtidaNaApi(slug, !atual.euCurti);
    setEnviando(false);
    if (resultado.ok) {
      setAtual({ curtidas: resultado.curtidas, euCurti: resultado.euCurti });
      return;
    }
    setErro(resultado.semSessao ? "Sua sessão expirou. Entre novamente para curtir." : (resultado.erroGeral ?? "Não foi possível curtir."));
  }

  // O servidor já informou `euCurti` pela sessão do cookie; o botão só age com a sessão confirmada no navegador.
  const podeAgir = estado === "autenticado";
  const rotulo = `${atual.euCurti ? "Descurtir" : "Curtir"} (${formatarNumero(atual.curtidas)})`;

  return (
    <Bloco>
      <Button
        variant={atual.euCurti ? "primary" : "outline"}
        size="small"
        disabled={!podeAgir}
        loading={enviando}
        loadingLabel="Enviando"
        aria-pressed={atual.euCurti}
        onClick={alternar}
      >
        {rotulo}
      </Button>
      {estado === "visitante" ? (
        <Mensagem>
          Curtir exige conta. <Link href={ROUTES.entrar}>Entre para continuar</Link>
        </Mensagem>
      ) : null}
      {erro ? <Erro role="alert">{erro}</Erro> : null}
    </Bloco>
  );
}

const Bloco = styled.div`
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

const Erro = styled.p`
  width: 100%;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  border-left: 3px solid ${({ theme }) => theme.colors.debunked};
  padding-left: 10px;
`;
