import type { Metadata } from "next";

import { FilterTabs } from "../../../components/filters/FilterTabs";
import { BuscaForm } from "../../../components/busca/BuscaForm";
import { ResultadosBusca } from "../../../components/busca/ResultadosBusca";
import { NotaLista } from "../../../components/page/NotaLista";
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
import { investigacaoParaCaso, perfilParaCriador, publicacaoParaFront } from "../../../lib/adaptadores";
import { criadoresDaBusca } from "../../../server/leitura/busca";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { publicacoesDaListagem } from "../../../server/leitura/publicacoes";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";

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

// Dados reais (ADR-029). A busca por texto é COMPLETA só para criadores (a API filtra por nome ou usuário).
// Publicações e investigações não têm busca por texto na API: filtramos as LIMITE_LISTA mais recentes de cada
// tipo. Quando existem mais registros do que isso, a página avisa que a busca é parcial.
export const dynamic = "force-dynamic";

const SEM_ITENS: { itens: never[]; haMais: boolean } = { itens: [], haMais: false };

export default async function BuscaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const consulta = normalizarConsulta(primeiroValor(params.q));
  const aba = lerAbaBusca(primeiroValor(params.tipo));

  const buscando = consulta !== "";
  const [listaPublicacoes, listaInvestigacoes, listaCriadores] = await Promise.all([
    buscando && (aba === "todos" || aba === "publicacoes") ? publicacoesDaListagem() : SEM_ITENS,
    buscando && (aba === "todos" || aba === "investigacoes") ? investigacoesDaListagem() : SEM_ITENS,
    buscando && (aba === "todos" || aba === "criadores") ? criadoresDaBusca(consulta) : SEM_ITENS,
  ]);

  const publicacoes = listaPublicacoes.itens.map(publicacaoParaFront);
  // Autor de cada publicação: só nome e usuário (a listagem não traz bio).
  const autores = listaPublicacoes.itens.map((item) =>
    perfilParaCriador({ usuario: item.autor.usuario, nome: item.autor.nome, bio: "" }),
  );
  const encontrados = buscar(consulta, aba, {
    publicacoes,
    investigacoes: listaInvestigacoes.itens.map(investigacaoParaCaso),
    criadores: [],
  });
  // Criadores já vêm filtrados pela API (nome sem acento ou usuário).
  const resultado = { ...encontrados, criadores: listaCriadores.itens.map(perfilParaCriador) };

  const avisos = avisosDeLimite({ publicacoes: listaPublicacoes, investigacoes: listaInvestigacoes, criadores: listaCriadores });
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
            descricao="Pesquise publicações por título, resumo e tema, investigações por título, descrição e localização, e criadores por nome ou usuário."
          />
        ) : contarResultados(resultado) === 0 ? (
          <EmptyState
            titulo={`Nenhum resultado ${ROTULO_TIPO_VAZIO[aba]}para "${consulta}"`}
            descricao="Tente outro termo ou confira a grafia."
          />
        ) : (
          <ResultadosBusca resultado={resultado} criadores={autores} />
        )}
        {buscando
          ? avisos.map((aviso) => <NotaLista key={aviso}>{aviso}</NotaLista>)
          : null}
      </PageBody>
    </>
  );
}

// Avisos de busca parcial: aparecem só quando há mais registros do que os carregados.
function avisosDeLimite(listas: {
  publicacoes: { haMais: boolean };
  investigacoes: { haMais: boolean };
  criadores: { haMais: boolean };
}): string[] {
  const avisos: string[] = [];
  const tipos = [
    listas.publicacoes.haMais ? "publicações" : null,
    listas.investigacoes.haMais ? "investigações" : null,
  ].filter((tipo) => tipo !== null);
  if (tipos.length > 0) {
    avisos.push(
      `A busca por texto em ${tipos.join(" e ")} considera só as ${LIMITE_LISTA} mais recentes de cada tipo, porque a API ainda não tem busca por texto para elas. Resultados mais antigos podem não aparecer.`,
    );
  }
  if (listas.criadores.haMais) avisos.push(`Mostrando os primeiros ${LIMITE_LISTA} criadores encontrados, em ordem alfabética.`);
  return avisos;
}
