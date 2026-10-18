"use client";

import Link from "next/link";
import styled from "styled-components";

import { AcaoRestrita } from "../acoes/AcaoRestrita";
import { ROUTES } from "../../constants/routes";
import { formatarData } from "../../lib/formatacao";
import type { EvidenciaMeu, RespostaMeu, Solicitacao, Conexao, EstadoEvidenciaMeu, EstadoSolicitacao } from "../../types/MeuPerfil";
import { EmptyState } from "../states/EmptyState";
import { Badge, type BadgeVariant } from "../ui/Badge";
import { Card } from "../ui/Card";

// Listas das abas de Meu Perfil. Títulos de investigação vêm de Case.title, passados como registro simples
// (serializável, sem funções: ver docs/DECISIONS.md, ADR-020).
export interface TitulosInvestigacao {
  [id: string]: string;
}

const ESTADO_EVIDENCIA: Record<EstadoEvidenciaMeu, { rotulo: string; variant: BadgeVariant }> = {
  pendente: { rotulo: "Aguardando revisão", variant: "warning" },
  aceita: { rotulo: "Aceita", variant: "success" },
  rejeitada: { rotulo: "Não aceita", variant: "danger" },
};

const ESTADO_SOLICITACAO: Record<EstadoSolicitacao, { rotulo: string; variant: BadgeVariant }> = {
  pendente: { rotulo: "Pendente", variant: "warning" },
  aceita: { rotulo: "Aceita", variant: "success" },
  recusada: { rotulo: "Recusada", variant: "danger" },
};

export interface MeuPerfilEvidenciasProps {
  itens: EvidenciaMeu[];
  titulos: TitulosInvestigacao;
}

// Evidências enviadas. Só as aceitas aparecem na comunidade. Pendentes e recusadas não recebem link público
// e a interface não inventa motivos.
export function MeuPerfilEvidencias({ itens, titulos }: MeuPerfilEvidenciasProps) {
  return (
    <Secao aria-labelledby="meu-perfil-evidencias">
      <Titulo id="meu-perfil-evidencias">Evidências</Titulo>
      {itens.length === 0 ? (
        <EmptyState titulo="Nenhuma evidência enviada" descricao="As evidências que você enviar aparecem aqui, com o estado de revisão." />
      ) : (
        <Lista>
          {itens.map((item) => {
            const estado = ESTADO_EVIDENCIA[item.estado];
            return (
              <li key={item.chave}>
                <Card padding="medium">
                  <Linha>
                    <Badge variant={estado.variant}>{estado.rotulo}</Badge>
                    {item.publica ? <Badge variant="default">Na lista pública</Badge> : null}
                  </Linha>
                  <ItemTitulo>{item.titulo}</ItemTitulo>
                  <Meta>
                    Na investigação {titulos[item.investigacaoId] ?? item.investigacaoId} · enviada em {formatarData(item.data)}
                  </Meta>
                  <Descricao>{item.descricao}</Descricao>
                  {item.publica ? (
                    <Link href={`${ROUTES.comunidadeInvestigacao(item.investigacaoId)}${item.ancora ?? ""}`}>
                      Ver na investigação
                    </Link>
                  ) : (
                    <Meta>
                      {item.estado === "pendente"
                        ? "Aguardando revisão do investigador responsável. Ainda não aparece na lista pública."
                        : "Não aparece na lista pública."}
                    </Meta>
                  )}
                </Card>
              </li>
            );
          })}
        </Lista>
      )}
    </Secao>
  );
}

export interface MeuPerfilRespostasProps {
  itens: RespostaMeu[];
  titulos: TitulosInvestigacao;
}

// Comentários do membro nas discussões. Abrir leva à discussão da investigação na área comunitária.
export function MeuPerfilRespostas({ itens, titulos }: MeuPerfilRespostasProps) {
  return (
    <Secao aria-labelledby="meu-perfil-respostas">
      <Titulo id="meu-perfil-respostas">Respostas e discussões</Titulo>
      {itens.length === 0 ? (
        <EmptyState titulo="Nenhuma resposta publicada" descricao="Seus comentários nas discussões aparecem aqui." />
      ) : (
        <Lista>
          {itens.map((item) => (
            <li key={item.chave}>
              <Card padding="medium">
                <Linha>
                  <Badge variant="default">{item.local}</Badge>
                  <Meta>{formatarData(item.data)}</Meta>
                </Linha>
                <Meta>Em {titulos[item.investigacaoId] ?? item.investigacaoId}</Meta>
                <Descricao>{item.texto}</Descricao>
                <Link href={`${ROUTES.comunidadeInvestigacao(item.investigacaoId)}#discussao`}>Abrir discussão</Link>
              </Card>
            </li>
          ))}
        </Lista>
      )}
    </Secao>
  );
}

export interface MeuPerfilSolicitacoesProps {
  solicitacoes: Solicitacao[];
  conexoes: Conexao[];
}

// Solicitações e conexões são demonstrativas (ADR-021). Responder exige conta: a ação fica desabilitada.
export function MeuPerfilSolicitacoes({ solicitacoes, conexoes }: MeuPerfilSolicitacoesProps) {
  return (
    <Secao aria-labelledby="meu-perfil-solicitacoes">
      <Titulo id="meu-perfil-solicitacoes">Solicitações e conexões</Titulo>
      <Aviso>
        Dados demonstrativos. Nenhuma solicitação ou conexão real existe ainda, e responder não é salvo.
      </Aviso>

      <Subtitulo>Solicitações</Subtitulo>
      {solicitacoes.length === 0 ? (
        <EmptyState titulo="Nenhuma solicitação" />
      ) : (
        <Lista>
          {solicitacoes.map((item) => {
            const estado = ESTADO_SOLICITACAO[item.estado];
            return (
              <li key={item.id}>
                <Card padding="medium">
                  <Linha>
                    <Badge variant={estado.variant}>{estado.rotulo}</Badge>
                    <Meta>{formatarData(item.data)}</Meta>
                  </Linha>
                  <ItemTitulo>{item.titulo}</ItemTitulo>
                  <Meta>
                    De {item.de.nome} (@{item.de.usuario})
                  </Meta>
                  <Descricao>{item.descricao}</Descricao>
                  <Acoes>
                    {item.estado === "pendente" ? (
                      <AcaoRestrita rotulo="Responder" mensagem="Responder a solicitações exige conta." />
                    ) : null}
                    <Link href={item.href}>Ver contexto</Link>
                  </Acoes>
                </Card>
              </li>
            );
          })}
        </Lista>
      )}

      <Subtitulo>Conexões</Subtitulo>
      {conexoes.length === 0 ? (
        <EmptyState titulo="Nenhuma conexão" />
      ) : (
        <Lista>
          {conexoes.map((item) => (
            <li key={item.id}>
              <Card padding="medium">
                <Linha>
                  <Badge variant="default">Não verificada</Badge>
                  <Meta>{formatarData(item.data)}</Meta>
                </Linha>
                <ItemTitulo>{item.titulo}</ItemTitulo>
                <Descricao>{item.descricao}</Descricao>
                <Link href={item.href}>Ver investigação</Link>
              </Card>
            </li>
          ))}
        </Lista>
      )}
    </Secao>
  );
}

const Secao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Subtitulo = styled.h3`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Aviso = styled.p`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Linha = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const ItemTitulo = styled.h4`
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Descricao = styled.p`
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-top: 12px;
  font-size: 14px;

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;
