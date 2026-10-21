import Link from "next/link";

import { CaseCard } from "../../../components/cards/CaseCard";
import { PublicationCard } from "../../../components/cards/PublicationCard";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { Subtitulo } from "../../../components/investigacao/Secao";
import { CardList } from "../../../components/page/CardList";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { FiltroTemas } from "../../../components/tags/FiltroTemas";
import { EmptyState } from "../../../components/states/EmptyState";
import { FILTROS_PUBLICACOES } from "../../../constants/filtros";
import { ROUTES } from "../../../constants/routes";
import { TAGS_TEMATICAS, type TagTematica } from "../../../constants/tagsTematicas";
import { investigacaoParaCaso, perfilParaCriador, publicacaoParaFront } from "../../../lib/adaptadores";
import { lerTagTematica } from "../../../lib/tags";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { publicacoesDaListagem } from "../../../server/leitura/publicacoes";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";
import type { TipoPublicacao } from "../../../types/Publicacao";

// Publicações e investigações reais (API, via serviço no processo; ADR-029 e ADR-031), em grupos separados, sem
// criar vínculos entre elas (ADR-013). A área de cada investigação tem rota própria: /publicacoes/investigacao/[slug].
// Sem sidebar: tópicos do fórum e atualizações não têm endpoint e não voltam como mocks.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ tipo?: string; tag?: string }>;

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

  // O filtro de tema vale para as duas listas (a API filtra investigações por tema). "Teorias" mostra só publicações.
  const mostrarInvestigacoes = tipo === undefined || tipo === "investigacao";

  const [{ itens, haMais }, investigacoesLista] = await Promise.all([
    publicacoesDaListagem(tipo, tag),
    mostrarInvestigacoes ? investigacoesDaListagem(tag) : Promise.resolve({ itens: [], haMais: false }),
  ]);
  const investigacoes = investigacoesLista.itens.map(investigacaoParaCaso);
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

  const semNada = publicacoes.length === 0 && investigacoes.length === 0;

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Teorias e investigações"
            descricao="Teorias, investigações e discussões da comunidade de Leonida."
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
                  descricao="Ainda não há teorias ou investigações neste filtro. Tente outra categoria ou publique a primeira teoria."
                  acao={<Link href={ROUTES.criar}>Criar teoria</Link>}
                />
              )
            ) : null}

            {investigacoes.length > 0 ? (
              <section aria-label="Investigações">
                <Subtitulo>Investigações</Subtitulo>
                <CardList>
                  {investigacoes.map((caso) => (
                    <CaseCard
                      key={caso.id}
                      caso={caso}
                      orientacao="horizontal"
                      href={ROUTES.comunidadeInvestigacao(caso.id)}
                    />
                  ))}
                </CardList>
                {investigacoesLista.haMais ? <NotaLista>Mostrando as {LIMITE_LISTA} investigações mais recentes.</NotaLista> : null}
              </section>
            ) : null}

            {publicacoes.length > 0 ? (
              <section aria-label={rotuloPublicacoes}>
                <Subtitulo>{rotuloPublicacoes}</Subtitulo>
                <CardList>
                  {publicacoes.map(({ publicacao, autor }) => (
                    <PublicationCard key={publicacao.id} publicacao={publicacao} autor={autor} />
                  ))}
                </CardList>
                {haMais ? <NotaLista>Mostrando as {LIMITE_LISTA} publicações mais recentes.</NotaLista> : null}
              </section>
            ) : null}
          </PageBody>
        </>
      }
    />
  );
}
