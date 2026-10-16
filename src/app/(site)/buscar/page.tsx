import type { Metadata } from "next";

import { FilterTabs } from "../../../components/filters/FilterTabs";
import { BuscaForm } from "../../../components/busca/BuscaForm";
import { ResultadosBusca } from "../../../components/busca/ResultadosBusca";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import {
  ABAS_BUSCA,
  buscar,
  contarResultados,
  lerAbaBusca,
  montarHrefBusca,
  normalizarConsulta,
  type AbaBusca,
} from "../../../lib/busca";
import {
  getCriadores,
  getInvestigacoes,
  getPublicacoes,
} from "../../../lib/data";

type SearchParams = Promise<{ q?: string | string[]; tipo?: string | string[] }>;

export const metadata: Metadata = {
  title: "Buscar | ARCHIVES VI",
  description: "Busque publicações, investigações e criadores da comunidade.",
};

// Parâmetro repetido na URL (?q=a&q=b) usa o primeiro valor.
function primeiroValor(valor?: string | string[]): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

const ROTULO_ABA: Record<AbaBusca, string> = {
  todos: "Todos",
  publicacoes: "Publicações",
  investigacoes: "Investigações",
  criadores: "Criadores",
};

const ROTULO_TIPO_VAZIO: Record<AbaBusca, string> = {
  todos: "",
  publicacoes: "em publicações ",
  investigacoes: "em investigações ",
  criadores: "em criadores ",
};

export default async function BuscaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const consulta = normalizarConsulta(primeiroValor(params.q));
  const aba = lerAbaBusca(primeiroValor(params.tipo));

  const [publicacoes, investigacoes, criadores] = await Promise.all([
    getPublicacoes(),
    getInvestigacoes(),
    getCriadores(),
  ]);

  const resultado = buscar(consulta, aba, { publicacoes, investigacoes, criadores });
  const abas = ABAS_BUSCA.map((valor) => ({
    label: ROTULO_ABA[valor],
    href: montarHrefBusca(consulta, valor),
    active: valor === aba,
  }));

  return (
    <>
      <PageHeader
        titulo="Buscar"
        descricao="Pesquise publicações, investigações e criadores pelo texto."
      />

      <BuscaForm consulta={consulta} aba={aba} />

      <FilterTabs label="Filtrar resultados por tipo" tabs={abas} />

      <PageBody>
        {consulta === "" ? (
          <EmptyState
            titulo="Digite um termo para buscar"
            descricao="Use o campo acima para pesquisar por título, resumo, tag, localização, nome, usuário ou bio."
          />
        ) : contarResultados(resultado) === 0 ? (
          <EmptyState
            titulo={`Nenhum resultado ${ROTULO_TIPO_VAZIO[aba]}para "${consulta}"`}
            descricao="Tente outro termo ou confira a grafia."
          />
        ) : (
          <ResultadosBusca resultado={resultado} criadores={criadores} />
        )}
      </PageBody>
    </>
  );
}
