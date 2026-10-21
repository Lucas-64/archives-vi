import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ComunidadeInvestigacao } from "../../../../../components/investigacao/ComunidadeInvestigacao";
import { EvidenciasInvestigacao } from "../../../../../components/investigacao/EvidenciasInvestigacao";
import { HistoricoTimeline } from "../../../../../components/investigacao/HistoricoTimeline";
import { InvestigacaoSidebar } from "../../../../../components/investigacao/InvestigacaoSidebar";
import { ContentGrid } from "../../../../../components/layout/ContentGrid";
import { NotaLista } from "../../../../../components/page/NotaLista";
import { Skeleton } from "../../../../../components/states/Skeleton";
import {
  evidenciaParaFront,
  historicoParaFront,
  investigacaoDetalheParaFront,
  investigacaoParaCaso,
  sugestaoParaFront,
} from "../../../../../lib/adaptadores";
import { usuarioDaSessao, type UsuarioDaSessao } from "../../../../../server/auth/sessaoServidor";
import type { InvestigacaoDetalhePublico } from "../../../../../server/contracts/investigacoes";
import {
  evidenciasAceitas,
  filaDeSugestoes,
  historicoDaInvestigacao,
  investigacaoPorSlug,
  minhasSugestoesNaInvestigacao,
} from "../../../../../server/leitura/investigacoes";

type Params = Promise<{ slug: string }>;

// Área comunitária de uma investigação real (ADR-020, ADR-031). Dinâmica: investigações criadas depois do build
// abrem sem recompilar, e um slug inexistente responde HTTP 404 real porque a verificação acontece antes de
// qualquer Suspense e este grupo não tem `loading.tsx` (ADR-028). O cookie é lido só para as permissões e para
// as sugestões da própria pessoa; a API repete a autorização em cada operação.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const dados = await investigacaoPorSlug(slug);
  if (!dados) return { title: "Investigação não encontrada | ARCHIVES VI" };
  return { title: `Comunidade: ${dados.titulo} | ARCHIVES VI` };
}

async function Evidencias({ dados, sessao }: { dados: InvestigacaoDetalhePublico; sessao: UsuarioDaSessao | null }) {
  const slug = dados.slug;
  const ator = sessao ? { id: sessao.id, nome: sessao.nome, usuario: sessao.usuario, papel: sessao.papel } : null;
  const podeAnalisar = dados.permissoes.podeGerenciar || dados.permissoes.podeModerar;

  const [aceitas, minhas, fila] = await Promise.all([
    evidenciasAceitas(slug),
    ator ? minhasSugestoesNaInvestigacao(slug, ator) : Promise.resolve([]),
    ator && podeAnalisar ? filaDeSugestoes(slug, ator) : Promise.resolve({ itens: [], haMais: false }),
  ]);

  return (
    <EvidenciasInvestigacao
      slug={slug}
      evidencias={aceitas.itens.map(evidenciaParaFront)}
      total={dados.contagens.evidencias}
      haMais={aceitas.haMais}
      investigador={dados.autor}
      podeSugerir={dados.permissoes.podeSugerirEvidencia}
      podeAnalisar={podeAnalisar}
      minhasSugestoes={minhas.map(sugestaoParaFront)}
      fila={fila.itens.map(sugestaoParaFront)}
      filaTemMais={fila.haMais}
    />
  );
}

async function Historico({ slug }: { slug: string }) {
  const { itens, haMais } = await historicoDaInvestigacao(slug);
  return (
    <>
      <HistoricoTimeline registros={historicoParaFront(itens)} />
      {haMais ? <NotaLista>Mostrando os registros mais recentes.</NotaLista> : null}
    </>
  );
}

export default async function ComunidadeInvestigacaoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const sessao = await usuarioDaSessao();
  const dados = await investigacaoPorSlug(slug, sessao?.id, sessao?.papel);

  if (!dados) notFound();

  const caso = investigacaoParaCaso(dados);
  const detalhe = investigacaoDetalheParaFront(dados);

  return (
    <ContentGrid
      main={
        <ComunidadeInvestigacao
          caso={caso}
          detalhe={detalhe}
          evidencias={
            <Suspense fallback={<Skeleton height="260px" radius="lg" />}>
              <Evidencias dados={dados} sessao={sessao} />
            </Suspense>
          }
          historico={
            <Suspense fallback={<Skeleton height="180px" radius="lg" />}>
              <Historico slug={slug} />
            </Suspense>
          }
        />
      }
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} />}
    />
  );
}
