import Link from "next/link";

import { CaseCard } from "../../../components/cards/CaseCard";
import { PublicationCard } from "../../../components/cards/PublicationCard";
import { FilterTabs } from "../../../components/filters/FilterTabs";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { Subtitulo } from "../../../components/investigacao/Secao";
import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { Sidebar } from "../../../components/home/Sidebar";
import { FiltroTemas } from "../../../components/tags/FiltroTemas";
import { EmptyState } from "../../../components/states/EmptyState";
import { FILTROS_PUBLICACOES } from "../../../constants/filtros";
import { ROUTES } from "../../../constants/routes";
import { TAGS_TEMATICAS, type TagTematica } from "../../../constants/tagsTematicas";
import {
  getAtualizacoes,
  getCriadores,
  getInvestigacoes,
  getPublicacoes,
  getTopicosForum,
  SIMULACOES,
  type Simulacao,
} from "../../../lib/data";
import { lerTagTematica } from "../../../lib/tags";
import type { TipoPublicacao } from "../../../types/Publicacao";

// Área comunitária unificada de Teorias e Investigações (ADR-020). Lista as investigações estruturadas e
// as publicações, em grupos separados, sem criar vínculos entre elas. A discussão de cada investigação
// tem rota própria: /publicacoes/investigacao/[slug].
type SearchParams = Promise<{ tipo?: string; tag?: string; simular?: string }>;

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

function lerSimulacao(valor?: string): Simulacao | undefined {
  return SIMULACOES.find((estado) => estado === valor);
}

export default async function PublicacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const tipo = lerTipo(params.tipo);
  const tag = lerTagTematica(params.tag);
  const simular = lerSimulacao(params.simular);

  // Investigações só têm tags se o registro tiver. Com um tema ativo, a lista de investigações fica fora.
  const mostrarInvestigacoes = tag === undefined && (tipo === undefined || tipo === "investigacao");

  const [publicacoes, investigacoes, criadores, topicos, atualizacoes] = await Promise.all([
    getPublicacoes({ tipo, tag, simular }),
    mostrarInvestigacoes ? getInvestigacoes({ simular }) : Promise.resolve([]),
    getCriadores(),
    getTopicosForum(),
    getAtualizacoes(),
  ]);
  const autores = new Map(criadores.map((criador) => [criador.id, criador]));

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
                  descricao="Ainda não há teorias ou investigações neste filtro. Tente outra categoria."
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
              </section>
            ) : null}

            {publicacoes.length > 0 ? (
              <section aria-label={rotuloPublicacoes}>
                <Subtitulo>{rotuloPublicacoes}</Subtitulo>
                <CardList>
                  {publicacoes.map((publicacao) => (
                    <PublicationCard
                      key={publicacao.id}
                      publicacao={publicacao}
                      autor={autores.get(publicacao.autorId)}
                    />
                  ))}
                </CardList>
              </section>
            ) : null}
          </PageBody>
        </>
      }
      sidebar={<Sidebar topicos={topicos} atualizacoes={atualizacoes} />}
    />
  );
}
