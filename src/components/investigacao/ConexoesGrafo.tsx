"use client";

import styled from "styled-components";

import type {
  NoConexao,
  RelacaoConexao,
  TipoRelacao,
} from "../../types/InvestigacaoDetalhe";

export interface ConexoesGrafoProps {
  nos: NoConexao[];
  relacoes: RelacaoConexao[];
}

// Fixed layout for the three-node graph: a triangle inside a 720 x 300 viewBox.
// Positions are assigned by node order, so the component works for the demo data.
const POSICOES: Array<{ x: number; y: number }> = [
  { x: 160, y: 80 },
  { x: 560, y: 80 },
  { x: 360, y: 230 },
];

const ROTULO_RELACAO: Record<TipoRelacao, string> = {
  mesmo_tracado: "Mesmo traçado",
  mesmo_local: "Mesmo local",
  mesma_cena: "Mesma cena",
};

const TRACO_RELACAO: Record<TipoRelacao, { dash: string; largura: number }> = {
  mesmo_tracado: { dash: "none", largura: 3 },
  mesmo_local: { dash: "10 6", largura: 2 },
  mesma_cena: { dash: "2 6", largura: 3 },
};

export function ConexoesGrafo({ nos, relacoes }: ConexoesGrafoProps) {
  const indice = new Map(nos.map((no, i) => [no.id, i]));
  const posicao = (id: string) => POSICOES[indice.get(id) ?? 0];

  const descricao =
    `Grafo de conexões investigadas com ${nos.length} nós: ` +
    nos.map((no) => no.rotulo).join(", ") +
    ". Relações: " +
    relacoes
      .map((r) => {
        const de = nos.find((no) => no.id === r.de)?.rotulo ?? r.de;
        const para = nos.find((no) => no.id === r.para)?.rotulo ?? r.para;
        return `${de} e ${para}, ${ROTULO_RELACAO[r.tipo].toLowerCase()}`;
      })
      .join("; ") +
    ". São conexões investigadas, não provas definitivas.";

  return (
    <Wrapper>
      <Scroll>
        <Svg viewBox="0 0 720 300" role="img" aria-label={descricao}>
          {relacoes.map((r) => {
            const de = posicao(r.de);
            const para = posicao(r.para);
            const meio = { x: (de.x + para.x) / 2, y: (de.y + para.y) / 2 };
            return (
              <g key={`${r.de}-${r.para}`}>
                <Aresta
                  x1={de.x}
                  y1={de.y}
                  x2={para.x}
                  y2={para.y}
                  $tipo={r.tipo}
                />
                <RotuloAresta x={meio.x} y={meio.y - 10}>
                  {r.rotulo}
                </RotuloAresta>
              </g>
            );
          })}

          {nos.map((no, i) => {
            const { x, y } = POSICOES[i] ?? POSICOES[0];
            return (
              <g key={no.id}>
                <Caixa x={x - 110} y={y - 26} width={220} height={52} rx={10} />
                <RotuloNo x={x} y={y}>
                  {no.rotulo}
                </RotuloNo>
              </g>
            );
          })}
        </Svg>
      </Scroll>

      <Legenda aria-label="Legenda das relações">
        {(Object.keys(ROTULO_RELACAO) as TipoRelacao[]).map((tipo) => (
          <LegendaItem key={tipo}>
            <Amostra $tipo={tipo} aria-hidden="true" />
            {ROTULO_RELACAO[tipo]}
          </LegendaItem>
        ))}
      </Legenda>
      <Nota>Conexões investigadas. Não são provas definitivas.</Nota>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

// The graph scrolls horizontally inside this container only, never the whole page.
const Scroll = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Svg = styled.svg`
  display: block;
  width: 100%;
  min-width: 560px;
  height: auto;
`;

const Aresta = styled.line<{ $tipo: TipoRelacao }>`
  stroke: ${({ $tipo, theme }) =>
    $tipo === "mesmo_tracado"
      ? theme.colors.pink
      : $tipo === "mesma_cena"
        ? theme.colors.purple
        : theme.colors.textSecondary};
  stroke-width: ${({ $tipo }) => TRACO_RELACAO[$tipo].largura};
  stroke-dasharray: ${({ $tipo }) => TRACO_RELACAO[$tipo].dash};
`;

const RotuloAresta = styled.text`
  font-size: 13px;
  text-anchor: middle;
  fill: ${({ theme }) => theme.colors.textSecondary};
  paint-order: stroke;
  stroke: ${({ theme }) => theme.colors.card};
  stroke-width: 6px;
`;

const Caixa = styled.rect`
  fill: ${({ theme }) => theme.colors.backgroundSecondary};
  stroke: ${({ theme }) => theme.colors.border};
  stroke-width: 1px;
`;

const RotuloNo = styled.text`
  font-size: 14px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: ${({ theme }) => theme.colors.text};
`;

const Legenda = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  list-style: none;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LegendaItem = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Amostra = styled.span<{ $tipo: TipoRelacao }>`
  display: inline-block;
  width: 28px;
  border-top: ${({ $tipo }) => TRACO_RELACAO[$tipo].largura}px solid
    ${({ $tipo, theme }) =>
      $tipo === "mesmo_tracado"
        ? theme.colors.pink
        : $tipo === "mesma_cena"
          ? theme.colors.purple
          : theme.colors.textSecondary};
  border-style: ${({ $tipo }) => (TRACO_RELACAO[$tipo].dash === "none" ? "solid" : "dashed")};
`;

const Nota = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
