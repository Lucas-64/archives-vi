"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { ROUTES } from "../../constants/routes";
import { formatarNumero } from "../../lib/formatacao";
import { ENCERRADA_PELO_AUTOR, ESTADO_INVESTIGACAO } from "../../lib/investigacaoEstado";
import type { Case } from "../../types/Case";
import type { InvestigacaoDetalhe } from "../../types/InvestigacaoDetalhe";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export interface InvestigacaoEmDestaqueProps {
  caso: Case;
  detalhe: InvestigacaoDetalhe;
}

// Bloco "Investigação em destaque" da Visão geral. A escolha vem de investigacaoEmDestaque
// (src/lib/perfil.ts), um fallback determinístico: não é escolha do membro. Os números são os mesmos
// de InvestigacaoCabecalho, para não divergir da página da investigação.
export function InvestigacaoEmDestaque({ caso, detalhe }: InvestigacaoEmDestaqueProps) {
  const estado = ESTADO_INVESTIGACAO[detalhe.estado];

  return (
    <Secao aria-labelledby="perfil-destaque">
      <Titulo id="perfil-destaque">Investigação em destaque</Titulo>

      <Card padding="none">
        <Conteudo>
          <Midia>
            <Image
              src={caso.image}
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 280px"
              style={{ objectFit: "cover" }}
            />
          </Midia>

          <Corpo>
            <Badges>
              <Badge size="small" variant={estado.variant} uppercase>
                {estado.rotulo}
              </Badge>
              {detalhe.encerradaPeloAutor ? (
                <Badge size="small" variant={ENCERRADA_PELO_AUTOR.variant} uppercase>
                  {ENCERRADA_PELO_AUTOR.rotulo}
                </Badge>
              ) : null}
            </Badges>

            <NomeInvestigacao>
              <Link href={ROUTES.investigacao(caso.id)}>{caso.title}</Link>
            </NomeInvestigacao>

            <Hipotese>{detalhe.teoria.hipotese}</Hipotese>

            <Indicadores>
              <Item>
                <Valor>{formatarNumero(detalhe.contagens.evidencias)}</Valor>
                <Rotulo>Evidências</Rotulo>
              </Item>
              <Item>
                <Valor>{formatarNumero(detalhe.contagens.participantes)}</Valor>
                <Rotulo>Participantes</Rotulo>
              </Item>
            </Indicadores>

            <Acao href={ROUTES.investigacao(caso.id)}>Abrir investigação</Acao>
          </Corpo>
        </Conteudo>
      </Card>

      <Nota>
        Exibida automaticamente. Investigações criadas pelo membro vêm antes das de participação;
        dentro de cada grupo, a mais recentemente atualizada.
      </Nota>
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
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;

  @media (max-width: 767px) {
    font-size: 24px;
  }
`;

const Conteudo = styled.div`
  display: flex;
  min-width: 0;

  @media (max-width: 1023px) {
    flex-direction: column;
  }
`;

const Midia = styled.div`
  position: relative;
  flex: 0 0 280px;
  min-height: 180px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};

  @media (max-width: 1023px) {
    flex: none;
    width: 100%;
    aspect-ratio: 16 / 9;
    min-height: 0;
  }
`;

const Corpo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};

  @media (max-width: 767px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const NomeInvestigacao = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;

  a {
    color: ${({ theme }) => theme.colors.text};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.pink};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 3px;
  }
`;

const Hipotese = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Indicadores = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 0;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Valor = styled.dt`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text};
`;

const Rotulo = styled.dd`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acao = styled(Link)`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.pink};

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.pink};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
