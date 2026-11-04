import Link from "next/link";

import { PublicationCardComCapa } from "../../../components/cards/PublicationCardComCapa";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { Subtitulo } from "../../../components/investigacao/Secao";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { Sidebar } from "../../../components/home/Sidebar";
import { FiltroTemas } from "../../../components/tags/FiltroTemas";
import { EmptyState } from "../../../components/states/EmptyState";
import { FILTROS_PUBLICACOES } from "../../../constants/filtrosPublicacoes";
import { ROUTES } from "../../../constants/routes";
import { TAGS_TEMATICAS, type TagTematica } from "../../../constants/tagsTematicas";
import { perfilParaCriador, publicacaoParaFront } from "../../../lib/adaptadores";
import { getAtualizacoes, getTopicosForum } from "../../../lib/data";
import { lerTagTematica } from "../../../lib/tags";
import { publicacoesDaListagem } from "../../../server/leitura/publicacoes";
import type { TipoPublicacao } from "../../../types/Publicacao";

// Área comunitária unificada de Teorias e Investigações (ADR-020) no layout da versão de backup (commit 355b30ad),
// restaurado pelo ADR-041: abas de tipo (Todas, Teorias, Investigações), filtro de tema, dois grupos (Investigações
// e Publicações) e a sidebar de fórum e atualizações. Os dados são reais (API, via serviço no processo; ADR-029);
// só a sidebar continua vindo de src/mocks. A área de cada investigação tem rota própria: /publicacoes/investigacao/[slug].
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ tipo?: string; tag?: string }>;

// Limite provisório da lista (decisão D2): sem "Ver mais" ainda, evita a lista longa.
const LIMITE_EXIBIDO = 12;

const TIPOS_VALIDOS: readonly TipoPublicacao[] = ["teoria", "investigacao"];

function lerTipo(valor?: string): TipoPublicacao | undefined {
  return TIPOS_VALIDOS.find((tipo) => tipo === valor);
}

// Endereço da listagem com os filtros ativos. Tipo e tema são independentes, e cada escolha
// preserva a outra. Valor de tema desconhecido já chega aqui como undefined (ignorado).
function hrefPublicacoes({ tipo, tag }: { tipo?: TipoPublicacao; tag?: TagTematica }): string {
  const query = new URLSearchParams();
  if (tipo) query.set("tipo", tipo);
  if (tag) query.set("tag", tag);
  const texto = query.toString();
  return texto ? `${ROUTES.publicacoes}?${texto}` : ROUTES.publicacoes;
}

export default async function PublicacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const tipo = lerTipo(params.tipo);
  const tag = lerTagTematica(params.tag);

  const [{ itens: todos, haMais: haMaisServidor }, topicos, atualizacoes] = await Promise.all([
    publicacoesDaListagem(tipo, tag),
    getTopicosForum(),
    getAtualizacoes(),
  ]);
  const itens = todos.slice(0, LIMITE_EXIBIDO);
  const haMais = haMaisServidor || todos.length > LIMITE_EXIBIDO;
  const publicacoes = itens.map((item) => ({
    publicacao: publicacaoParaFront(item),
    autor: perfilParaCriador({ usuario: item.autor.usuario, nome: item.autor.nome, bio: "" }),
  }));

  const abas = FILTROS_PUBLICACOES.map((filtro) => ({
    label: filtro.label,
    href: hrefPublicacoes({ tipo: filtro.value, tag }),
    active: filtro.value === tipo,
  }));

  const rotuloPublicacoes =
    tipo === "investigacao" ? "Publicações de investigação" : tipo === "teoria" ? "Teorias" : "Publicações";

  const semNada = publicacoes.length === 0;

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Publicações"
            descricao="Teorias e publicações anteriores da comunidade. Para aprofundar um tema, abra uma investigação."
          />

          <FilterTabs label="Filtrar publicações" tabs={abas} />

          <FiltroTemas
            label="Filtrar publicações por tema"
            opcoes={[
              { href: hrefPublicacoes({ tipo }), ativa: tag === undefined },
              ...TAGS_TEMATICAS.map((item) => ({
                tag: item.id,
                href: hrefPublicacoes({ tipo, tag: item.id }),
                ativa: tag === item.id,
              })),
            ]}
          />

          <PageBody>
            {semNada ? (
              tag ? (
                <EmptyState
                  titulo="Nenhuma publicação com este tema"
                  descricao="Não há publicações deste tema neste filtro. Escolha outro tema ou veja todas."
                  acao={<Link href={hrefPublicacoes({ tipo })}>Ver todos os temas</Link>}
                />
              ) : (
                <EmptyState
                  titulo="Nada por aqui ainda"
                  descricao="Ainda não há teorias ou investigações neste filtro. Tente outra categoria."
                />
              )
            ) : null}

            {publicacoes.length > 0 ? (
              <section aria-label={rotuloPublicacoes}>
                <Subtitulo>{rotuloPublicacoes}</Subtitulo>
                <CardList>
                  {publicacoes.map(({ publicacao, autor }) => (
                    <PublicationCardComCapa key={publicacao.id} publicacao={publicacao} autor={autor} />
                  ))}
                </CardList>
                {haMais ? <NotaLista>Mostrando as {LIMITE_EXIBIDO} publicações mais recentes.</NotaLista> : null}
              </section>
            ) : null}
          </PageBody>
        </>
      }
      sidebar={<Sidebar topicos={topicos} atualizacoes={atualizacoes} />}
    />
  );
}
