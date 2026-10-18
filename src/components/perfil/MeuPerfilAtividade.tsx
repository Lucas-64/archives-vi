"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import { FiAward, FiFileText, FiHelpCircle, FiMessageSquare, FiSearch } from "react-icons/fi";
import styled from "styled-components";

import { formatarData } from "../../lib/formatacao";
import type { Notificacao, TipoNotificacao } from "../../types/MeuPerfil";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export interface MeuPerfilAtividadeProps {
  itens: Notificacao[];
  // Ids marcados como lidos nesta página. O estado não é salvo (ADR-021).
  lidas: ReadonlySet<string>;
  onMarcar: (id: string) => void;
  // Quantos itens mostrar. Sem limite, mostra todos.
  limite?: number;
}

const ROTULO_TIPO: Record<TipoNotificacao, string> = {
  resposta: "Resposta",
  evidencia: "Evidência",
  investigacao: "Investigação",
  solicitacao: "Solicitação",
  conquista: "Conquista",
};

const ICONE_TIPO: Record<TipoNotificacao, IconType> = {
  resposta: FiMessageSquare,
  evidencia: FiFileText,
  investigacao: FiSearch,
  solicitacao: FiHelpCircle,
  conquista: FiAward,
};

// Lista de atividade no estilo da referência: ícone, título e descrição, estado, data e ações.
// Os dados são demonstrativos (nenhum evento real é recebido). Marcar como lida só muda a tela.
export function MeuPerfilAtividade({ itens, lidas, onMarcar, limite }: MeuPerfilAtividadeProps) {
  const visiveis = limite === undefined ? itens : itens.slice(0, limite);

  return (
    <Lista>
      {visiveis.map((item) => {
        const lida = item.lida || lidas.has(item.id);
        const Icone = ICONE_TIPO[item.tipo];
        return (
          <li key={item.id}>
            <Linha>
              <IconeCaixa role="img" aria-label={ROTULO_TIPO[item.tipo]}>
                <Icone />
              </IconeCaixa>

              <Texto>
                <Titulo>{item.titulo}</Titulo>
                <Descricao>{item.descricao}</Descricao>
              </Texto>

              <Lado>
                <Badge size="small" variant={lida ? "info" : "primary"}>
                  {lida ? "Lida" : "Nova"}
                </Badge>
                <Data>{formatarData(item.data)}</Data>
                <Link href={item.href}>Ver detalhes</Link>
                {lida ? null : (
                  <Button variant="ghost" size="small" onClick={() => onMarcar(item.id)}>
                    Marcar como lida
                  </Button>
                )}
              </Lado>
            </Linha>
          </li>
        );
      })}
    </Lista>
  );
}

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Linha = styled.div`
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 767px) {
    grid-template-columns: 36px minmax(0, 1fr);
  }
`;

const IconeCaixa = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Texto = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Titulo = styled.p`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
`;

const Descricao = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Lado = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 12px;
  font-size: 13px;

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }

  @media (max-width: 767px) {
    grid-column: 2;
    justify-content: flex-start;
  }
`;

const Data = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
