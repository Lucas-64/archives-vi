import Link from "next/link";

import { CaseCard } from "../../../components/cards/CaseCard";
import { PublicationCard } from "../../../components/cards/PublicationCard";
import { FiltrosRecolhiveis } from "../../../components/filters/FiltrosRecolhiveis";
import { SidebarDemonstrativa } from "../../../components/home/Sidebar";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { Subtitulo } from "../../../components/investigacao/Secao";
import { CardList } from "../../../components/page/CardList";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { FiltroTemas } from "../../../components/tags/FiltroTemas";
import { EmptyState } from "../../../components/states/EmptyState";
import { ROUTES } from "../../../constants/routes";
import { TAGS_TEMATICAS, type TagTematica } from "../../../constants/tagsTematicas";
import { investigacaoParaCaso, perfilParaCriador, publicacaoParaFront } from "../../../lib/adaptadores";
import { lerTagTematica } from "../../../lib/tags";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { publicacoesDaListagem } from "../../../server/leitura/publicacoes";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";

// Publicações e investigações reais (API, via serviço no processo; ADR-029 e ADR-031), em dois grupos (Investigações e
// Publicações), filtrados apenas por tema, sem criar vínculos entre elas (ADR-013). Não há filtro de tipo: teoria e
// investigação são tratadas como a mesma coisa, e o antigo ?tipo= é ignorado. A área de cada investigação tem rota própria: /publicacoes/investigacao/[slug].
// Sidebar demonstrativa (ADR-036): tópicos do fórum e atualizações não têm endpoint e aparecem rotulados como exemplo.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ tag?: string }>;

// Endereço da listagem com o tema ativo. Valor de tema desconhecido já chega aqui como undefined (ignorado).
// O antigo parâmetro ?tipo= é ignorado: a listagem mostra teorias e investigações juntas.
function hrefPublicacoes({ tag }: { tag?: TagTematica }): string {
  return tag ? `${ROUTES.publicacoes}?${new URLSearchParams({ tag }).toString()}` : ROUTES.publicacoes;
}

export default async function PublicacoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const tag = lerTagTematica(params.tag);

  // O tema vale para as duas listas (a API filtra publicações e investigações por tema).
  const [{ itens, haMais }, investigacoesLista] = await Promise.all([
    publicacoesDaListagem(undefined, tag),
    investigacoesDaListagem(tag),
  ]);

  const investigacoes = investigacoesLista.itens.map(investigacaoParaCaso);
  const publicacoes = itens.map((item) => ({
    publicacao: publicacaoParaFront(item),
    autor: perfilParaCriador({ usuario: item.autor.usuario, nome: item.autor.nome, bio: "" }),
  }));

  const semNada = publicacoes.length === 0 && investigacoes.length === 0;
  const tagAtiva = TAGS_TEMATICAS.find((item) => item.id === tag);

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Teorias e investigações"
            descricao="Teorias, investigações e discussões da comunidade de Leonida."
          />

          <FiltrosRecolhiveis resumoAtivo={tagAtiva ? `Tema: ${tagAtiva.rotulo}` : undefined}>
            <FiltroTemas
              label="Filtrar publicações por tema"
              opcoes={[
                { href: hrefPublicacoes({}), ativa: tag === undefined },
                ...TAGS_TEMATICAS.map((item) => ({
                  tag: item.id,
                  href: hrefPublicacoes({ tag: item.id }),
                  ativa: tag === item.id,
                })),
              ]}
            />
          </FiltrosRecolhiveis>

          <PageBody>
            {semNada ? (
              tag ? (
                <EmptyState
                  titulo="Nenhuma publicação com este tema"
                  descricao="Não há publicações deste tema neste filtro. Escolha outro tema ou veja todas."
                  acao={<Link href={hrefPublicacoes({})}>Ver todos os temas</Link>}
                />
              ) : (
                <EmptyState
                  titulo="Nada por aqui ainda"
                  descricao="Ainda não há teorias ou investigações neste filtro. Publique a primeira teoria."
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
              <section aria-label="Publicações">
                <Subtitulo>Publicações</Subtitulo>
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
      sidebar={<SidebarDemonstrativa />}
    />
  );
}
