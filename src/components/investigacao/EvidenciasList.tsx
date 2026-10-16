"use client";

import { useState } from "react";
import styled from "styled-components";

import { AcaoRestrita } from "../acoes/AcaoRestrita";
import type {
  Evidencia,
  Pessoa,
  StatusSugestao,
  SugestaoEvidencia,
} from "../../types/InvestigacaoDetalhe";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EvidenciaCard } from "./EvidenciaCard";
import { ROTULO_ORIGEM } from "../../lib/investigacaoEstado";

export interface EvidenciasListProps {
  evidencias: Evidencia[];
  sugestoes: SugestaoEvidencia[];
  // Investigador responsável pela investigação (autor do detalhe).
  investigador: Pessoa;
  total: number;
}

// Public list: the dossier's evidences plus community suggestions accepted by the investigator.
// Pending and rejected suggestions never appear here.
// Acceptance and rejection change only this component's state, for the current page session.
export function EvidenciasList({ evidencias, sugestoes, investigador, total }: EvidenciasListProps) {
  const [statusSugestoes, setStatusSugestoes] = useState<Record<string, StatusSugestao>>(
    () => Object.fromEntries(sugestoes.map((item) => [item.id, item.status])),
  );
  const [aceitasPor, setAceitasPor] = useState<Record<string, Pessoa>>({});
  const [areaAberta, setAreaAberta] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const statusDe = (item: SugestaoEvidencia) => statusSugestoes[item.id] ?? item.status;

  const aceitasNaLista: Evidencia[] = sugestoes
    .filter((item) => statusDe(item) === "aceita")
    .map((item) => ({
      id: item.id,
      origem: item.origem,
      titulo: item.titulo,
      descricao: item.descricao,
      autor: item.enviadaPor,
      data: item.data,
      // Community suggestions have no verified source until the investigator checks one.
      fonte: null,
      temDiscussao: false,
      imagens: item.imagens,
      origemComunidade: {
        enviadaPor: item.enviadaPor,
        aceitaPor: aceitasPor[item.id] ?? item.aceitaPor ?? investigador,
      },
    }));

  const publicas = [...evidencias, ...aceitasNaLista];
  const pendentes = sugestoes.filter((item) => statusDe(item) === "pendente");

  function aceitar(item: SugestaoEvidencia) {
    setStatusSugestoes((atual) => ({ ...atual, [item.id]: "aceita" }));
    setAceitasPor((atual) => ({ ...atual, [item.id]: investigador }));
    setMensagem(`Sugestão #${item.id} aceita. Ela passa a aparecer na lista de evidências. Demonstração: nada é salvo.`);
  }

  function recusar(item: SugestaoEvidencia) {
    setStatusSugestoes((atual) => ({ ...atual, [item.id]: "recusada" }));
    setMensagem(`Sugestão #${item.id} recusada. Ela não é apresentada como evidência. Demonstração: nada é salvo.`);
  }

  return (
    <Wrapper>
      <Cabecalho>
        <Resumo>
          Exibindo {publicas.length} de {total} evidências. Dados demonstrativos.
        </Resumo>
        <AcaoRestrita rotulo="+ Adicionar pista" mensagem="Adicionar pistas exige autenticação." />
      </Cabecalho>

      <Nota>
        “Evidência do criador” indica a procedência do material, publicado pelo criador desta investigação. Não indica veracidade nem força científica.
      </Nota>

      <Lista>
        {publicas.map((evidencia) => (
          <li key={evidencia.id}>
            <EvidenciaCard evidencia={evidencia} ehDoCriador={evidencia.autor.usuario === investigador.usuario} />
          </li>
        ))}
      </Lista>

      <Area>
        <Button
          type="button"
          variant="outline"
          size="small"
          aria-expanded={areaAberta}
          aria-controls="area-investigador"
          onClick={() => setAreaAberta((valor) => !valor)}
        >
          {areaAberta ? "Ocultar área do investigador" : "Mostrar área do investigador"}
        </Button>

        {areaAberta ? (
          <Painel id="area-investigador" aria-labelledby="area-investigador-titulo">
            <Badge size="small" variant="secondary">Demonstração</Badge>
            <TituloArea id="area-investigador-titulo">Sugestões pendentes</TituloArea>
            <Aviso>
              Esta área mostra como o investigador responsável analisaria as sugestões. Não há controle de acesso real: aceitar ou recusar altera apenas esta sessão e não é salvo.
            </Aviso>

            {pendentes.length === 0 ? (
              <Aviso>Nenhuma sugestão pendente.</Aviso>
            ) : (
              <Pendentes>
                {pendentes.map((item) => (
                  <li key={item.id}>
                    <PendenteCard>
                      <Topo>
                        <Identificador>SUGESTÃO #{item.id}</Identificador>
                        <Badge size="small" variant="default">{ROTULO_ORIGEM[item.origem]}</Badge>
                      </Topo>
                      <NomePendente>{item.titulo}</NomePendente>
                      <Descricao>{item.descricao}</Descricao>
                      <Meta>
                        Enviada por @{item.enviadaPor.usuario} em {item.data}
                        {item.imagens?.length ? ` · ${item.imagens.length} imagem(ns)` : " · sem imagem"}
                      </Meta>
                      <Acoes>
                        <Button type="button" variant="primary" size="small" onClick={() => aceitar(item)} aria-label={`Aceitar sugestão #${item.id}`}>
                          Aceitar
                        </Button>
                        <Button type="button" variant="outline" size="small" onClick={() => recusar(item)} aria-label={`Recusar sugestão #${item.id}`}>
                          Recusar
                        </Button>
                      </Acoes>
                    </PendenteCard>
                  </li>
                ))}
              </Pendentes>
            )}

            {mensagem ? <Mensagem role="status">{mensagem}</Mensagem> : null}
          </Painel>
        ) : null}
      </Area>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
`;

const Resumo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Vertical list, one card per row, at every screen size (same decision as /publicacoes).
const Lista = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
`;

const Area = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

const Painel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const TituloArea = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Aviso = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Pendentes = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
`;

const PendenteCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Topo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Identificador = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NomePendente = styled.h4`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  overflow-wrap: anywhere;
`;

const Descricao = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Meta = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Mensagem = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;
