import Link from "next/link";

import { CaseCardClassico } from "../../../components/cards/CaseCardClassico";
import { SidebarDemonstrativa } from "../../../components/home/Sidebar";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { CardList } from "../../../components/page/CardList";
import { LinkDeAcao } from "../../../components/page/LinkDeAcao";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { ROUTES } from "../../../constants/routes";
import { investigacaoParaCaso } from "../../../lib/adaptadores";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { investigacoesDoMisterio, misterioPorSlug } from "../../../server/leitura/misterios";
import { LIMITE_LISTA } from "../../../server/leitura/usuarios";

// Listagem de investigações (tabela `investigacoes`, ADR-044). `?misterio=<slug>` mostra só as vinculadas a um mistério.
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ misterio?: string }>;

export default async function InvestigacoesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const slugMisterio = params.misterio?.trim() || undefined;

  const [misterio, { itens, haMais }] = await Promise.all([
    slugMisterio ? misterioPorSlug(slugMisterio) : Promise.resolve(null),
    slugMisterio ? investigacoesDoMisterio(slugMisterio) : investigacoesDaListagem(),
  ]);
  const casos = itens.map(investigacaoParaCaso);

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Investigações"
            descricao="Teorias, pistas e evidências investigadas pela comunidade."
            acao={<LinkDeAcao href={ROUTES.criarInvestigacao}>Abrir investigação</LinkDeAcao>}
          />

          {slugMisterio ? (
            <NotaLista>
              {misterio ? (
                <>
                  Investigações sobre o mistério <Link href={ROUTES.misterio(misterio.slug)}>{misterio.titulo}</Link>.{" "}
                </>
              ) : (
                "Mistério não encontrado. "
              )}
              <Link href={ROUTES.investigacoes}>Ver todas as investigações</Link>
            </NotaLista>
          ) : null}

          <PageBody>
            {casos.length === 0 ? (
              <EmptyState
                titulo="Nenhuma investigação por enquanto"
                descricao={
                  slugMisterio
                    ? "Ainda não há investigações abertas sobre este mistério."
                    : "Assim que novas investigações forem abertas, elas aparecem aqui."
                }
              />
            ) : (
              <CardList>
                {casos.map((caso) => (
                  <CaseCardClassico key={caso.id} caso={caso} orientacao="horizontal" href={ROUTES.investigacao(caso.id)} />
                ))}
              </CardList>
            )}
            {haMais ? <NotaLista>Mostrando as {LIMITE_LISTA} investigações mais recentes.</NotaLista> : null}
          </PageBody>
        </>
      }
      sidebar={<SidebarDemonstrativa />}
    />
  );
}
