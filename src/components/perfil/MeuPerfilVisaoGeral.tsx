"use client";

import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { rotuloDaTag } from "../../lib/tags";
import { formatarData } from "../../lib/formatacao";
import type { Case } from "../../types/Case";
import type { Publicacao } from "../../types/Publicacao";
import type { EvidenciaMeu, Notificacao, Solicitacao } from "../../types/MeuPerfil";
import { StatusBadge } from "../ui/StatusBadge";
import { Badge, type BadgeVariant } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../states/EmptyState";
import { MeuPerfilAtividade } from "./MeuPerfilAtividade";
import { IrParaAba } from "./IrParaAba";
import type { TitulosInvestigacao } from "./MeuPerfilListas";

export interface MeuPerfilVisaoGeralProps {
  solicitacoes: Solicitacao[];
  evidencias: EvidenciaMeu[];
  notificacoes: Notificacao[];
  lidas: ReadonlySet<string>;
  onMarcar: (id: string) => void;
  publicacoes: Publicacao[];
  investigacoes: Case[];
  titulos: TitulosInvestigacao;
}

const ESTADO_EVIDENCIA: Record<EvidenciaMeu["estado"], { rotulo: string; variant: BadgeVariant }> = {
  pendente: { rotulo: "Em análise", variant: "info" },
  aceita: { rotulo: "Aceita", variant: "success" },
  rejeitada: { rotulo: "Não aceita", variant: "danger" },
};

const LIMITE_RESUMO = 3;

// Visão geral de Meu Perfil, no layout da referência visual: à esquerda, o que aguarda ação e a atividade
// recente; à direita, as listas de teorias, investigações e evidências do membro. Os itens de ação são
// demonstrativos (solicitações) ou reais (evidências pendentes). Responder exige conta (ADR-021).
export function MeuPerfilVisaoGeral({
  solicitacoes,
  evidencias,
  notificacoes,
  lidas,
  onMarcar,
  publicacoes,
  investigacoes,
  titulos,
}: MeuPerfilVisaoGeralProps) {
  const solicitacoesPendentes = solicitacoes.filter((item) => item.estado === "pendente");
  const evidenciasPendentes = evidencias.filter((item) => item.estado === "pendente");
  const totalPendencias = solicitacoesPendentes.length + evidenciasPendentes.length;

  return (
    <Grade>
      <Coluna>
        <Cartao aria-labelledby="meu-perfil-aguardando">
          <Cabecalho>
            <Titulo id="meu-perfil-aguardando">Aguardando sua ação</Titulo>
            {totalPendencias > 0 ? (
              <Badge size="small" variant="warning">
                {totalPendencias === 1 ? "1 pendência" : `${totalPendencias} pendências`}
              </Badge>
            ) : null}
          </Cabecalho>

          {totalPendencias === 0 ? (
            <EmptyState titulo="Nada aguardando sua ação" descricao="Solicitações e revisões pendentes aparecem aqui." />
          ) : (
            <Lista>
              {solicitacoesPendentes.map((item) => (
                <li key={item.id}>
                  <Item $cor="investigating">
                    <LinhaItem>
                      <ItemTitulo>{item.titulo}</ItemTitulo>
                      <Badge size="small" variant="warning">Aguardando resposta</Badge>
                    </LinhaItem>
                    <Descricao>{item.descricao}</Descricao>
                    <Meta>
                      De {item.de.nome} (@{item.de.usuario}) · {formatarData(item.data)}
                    </Meta>
                    <Acoes>
                      <Button variant="primary" size="small" disabled aria-describedby={`${item.id}-aviso`}>
                        Responder
                      </Button>
                      <Link href={item.href}>Ver discussão</Link>
                    </Acoes>
                    <Aviso id={`${item.id}-aviso`}>Responder exige conta.</Aviso>
                  </Item>
                </li>
              ))}

              {evidenciasPendentes.map((item) => (
                <li key={item.chave}>
                  <Item $cor="unexplained">
                    <LinhaItem>
                      <ItemTitulo>{item.titulo}</ItemTitulo>
                      <Badge size="small" variant="info">Em análise</Badge>
                    </LinhaItem>
                    <Descricao>{item.descricao}</Descricao>
                    <Meta>
                      Na investigação {titulos[item.investigacaoId] ?? item.investigacaoId} · enviada em{" "}
                      {formatarData(item.data)}
                    </Meta>
                    <Acoes>
                      <Link href={ROUTES.comunidadeInvestigacao(item.investigacaoId)}>Ver investigação</Link>
                    </Acoes>
                  </Item>
                </li>
              ))}
            </Lista>
          )}
        </Cartao>

        <Cartao aria-labelledby="meu-perfil-atividade">
          <Cabecalho>
            <Titulo id="meu-perfil-atividade">Atividade recente</Titulo>
            <IrParaAba aba="atividade">Ver toda a atividade</IrParaAba>
          </Cabecalho>
          <MeuPerfilAtividade itens={notificacoes} lidas={lidas} onMarcar={onMarcar} limite={LIMITE_RESUMO} />
        </Cartao>
      </Coluna>

      <Coluna>
        <Cartao aria-labelledby="meu-perfil-teorias">
          <Cabecalho>
            <Titulo id="meu-perfil-teorias">Minhas teorias</Titulo>
          </Cabecalho>
          {publicacoes.length === 0 ? (
            <Vazio>Nenhuma teoria publicada.</Vazio>
          ) : (
            <Resumo>
              {publicacoes.slice(0, LIMITE_RESUMO).map((item) => (
                <li key={item.id}>
                  <ResumoTitulo href={ROUTES.publicacao(item.slug)}>{item.titulo}</ResumoTitulo>
                  <Meta>
                    {item.tags.length > 0 ? rotuloDaTag(item.tags[0]) : item.tipo === "teoria" ? "Teoria" : "Investigação"}
                  </Meta>
                </li>
              ))}
            </Resumo>
          )}
          <Rodape>
            <IrParaAba aba="teorias-publicacoes">Ver todas as teorias</IrParaAba>
          </Rodape>
        </Cartao>

        <Cartao aria-labelledby="meu-perfil-investigacoes">
          <Cabecalho>
            <Titulo id="meu-perfil-investigacoes">Minhas investigações</Titulo>
          </Cabecalho>
          {investigacoes.length === 0 ? (
            <Vazio>Nenhuma investigação com detalhe publicado.</Vazio>
          ) : (
            <Resumo>
              {investigacoes.slice(0, LIMITE_RESUMO).map((caso) => (
                <li key={caso.id}>
                  <LinhaItem>
                    <ResumoTitulo href={ROUTES.comunidadeInvestigacao(caso.id)}>{caso.title}</ResumoTitulo>
                    <StatusBadge status={caso.status} />
                  </LinhaItem>
                </li>
              ))}
            </Resumo>
          )}
          <Rodape>
            <IrParaAba aba="investigacoes">Ver todas as investigações</IrParaAba>
          </Rodape>
        </Cartao>

        <Cartao aria-labelledby="meu-perfil-evidencias">
          <Cabecalho>
            <Titulo id="meu-perfil-evidencias">Minhas evidências</Titulo>
          </Cabecalho>
          {evidencias.length === 0 ? (
            <Vazio>Nenhuma evidência enviada.</Vazio>
          ) : (
            <Resumo>
              {evidencias.slice(0, LIMITE_RESUMO).map((item) => {
                const estado = ESTADO_EVIDENCIA[item.estado];
                return (
                  <li key={item.chave}>
                    <LinhaItem>
                      <ResumoTexto>
                        <strong>{item.titulo}</strong>
                        <Meta>{titulos[item.investigacaoId] ?? item.investigacaoId}</Meta>
                      </ResumoTexto>
                      <Badge size="small" variant={estado.variant}>{estado.rotulo}</Badge>
                    </LinhaItem>
                  </li>
                );
              })}
            </Resumo>
          )}
          <Rodape>
            <IrParaAba aba="evidencias">Ver todas as evidências</IrParaAba>
          </Rodape>
        </Cartao>
      </Coluna>
    </Grade>
  );
}

const Grade = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }
`;

const Coluna = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const Cartao = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.card};

  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
`;

const Titulo = styled.h2`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 17px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const Lista = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.div<{ $cor: "investigating" | "unexplained" }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 3px solid ${({ $cor, theme }) => theme.colors[$cor]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  min-width: 0;
`;

const LinhaItem = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-width: 0;
`;

const ItemTitulo = styled.p`
  font-size: 15px;
  font-weight: 700;
  overflow-wrap: anywhere;
`;

const Descricao = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Meta = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-top: 6px;
  font-size: 13px;

  a {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const Aviso = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Resumo = styled.ul`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  li:first-child {
    border-top: 0;
    padding-top: 0;
  }
`;

const ResumoTitulo = styled(Link)`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    color: ${({ theme }) => theme.colors.pink};
  }
`;

const ResumoTexto = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  strong {
    font-size: 14px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
`;

const Rodape = styled.div`
  padding-top: 4px;
  font-size: 13px;
`;

const Vazio = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
