import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ComunidadeInvestigacao } from "../../../../../components/investigacao/ComunidadeInvestigacao";
import { ComunidadeInvestigacaoClassica } from "../../../../../components/investigacao-classica/ComunidadeInvestigacaoClassica";
import { InvestigacaoSidebarClassica } from "../../../../../components/investigacao-classica/InvestigacaoSidebarClassica";
import { EvidenciasInvestigacao } from "../../../../../components/investigacao/EvidenciasInvestigacao";
import { HistoricoTimeline } from "../../../../../components/investigacao/HistoricoTimeline";
import { InvestigacaoSidebar } from "../../../../../components/investigacao/InvestigacaoSidebar";
import { ContentGrid } from "../../../../../components/layout/ContentGrid";
import { EmptyState } from "../../../../../components/states/EmptyState";
import { ROUTES } from "../../../../../constants/routes";
import { getInvestigacaoPorSlug } from "../../../../../lib/data";
import { NotaLista } from "../../../../../components/page/NotaLista";
import { Skeleton } from "../../../../../components/states/Skeleton";
import {
  evidenciaParaFront,
  historicoParaFront,
  investigacaoDetalheParaFront,
  investigacaoParaCaso,
  sugestaoParaFront,
} from "../../../../../lib/adaptadores";
import { detalheDemonstrativo } from "../../../../../lib/demonstracaoInvestigacao";
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

// Área comunitária de uma investigação real (ADR-020, ADR-031), com o layout antigo restaurado (ADR-039): discussão,
// localização e síntese mostram o exemplo do slug (rotulado como demonstração) ou estado vazio rotulado. Dinâmica: investigações criadas depois do build
// abrem sem recompilar, e um slug inexistente responde HTTP 404 real porque a verificação acontece antes de
// qualquer Suspense e este grupo não tem `loading.tsx` (ADR-028). O cookie é lido só para as permissões e para
// as sugestões da própria pessoa; a API repete a autorização em cada operação.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  // Versão de backup (mock com conteúdo completo): mesmo título da página antiga (ADR-041).
  const classico = await getInvestigacaoPorSlug(slug);
  if (classico?.detalhe) return { title: `Discussão: ${classico.caso.title} | ARCHIVES VI` };
  const dados = await investigacaoPorSlug(slug);
  if (!dados) {
    return { title: classico ? `Discussão: ${classico.caso.title} | ARCHIVES VI` : "Investigação não encontrada | ARCHIVES VI" };
  }
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

  // Slug com conteúdo completo no mock (ex.: simbolos-vice-city): a página fica IDÊNTICA à da versão de backup
  // (ADR-041), com o componente e os dados antigos. As demais seguem lendo o banco, como antes.
  const classico = await getInvestigacaoPorSlug(slug);
  if (classico?.detalhe) {
    return (
      <ContentGrid
        main={<ComunidadeInvestigacaoClassica caso={classico.caso} detalhe={classico.detalhe} />}
        sidebar={<InvestigacaoSidebarClassica caso={classico.caso} detalhe={classico.detalhe} />}
      />
    );
  }

  const sessao = await usuarioDaSessao();
  const dados = await investigacaoPorSlug(slug, sessao?.id, sessao?.papel);

  if (!dados) {
    // Registro do mock sem a discussão publicada: mesma mensagem da página antiga. Sem registro algum: 404 real.
    if (classico) {
      return (
        <ContentGrid
          main={
            <EmptyState
              titulo={classico.caso.title}
              descricao="A discussão deste mistério ainda não foi publicada."
              acao={<Link href={ROUTES.investigacao(classico.caso.id)}>Ler o mistério</Link>}
            />
          }
        />
      );
    }
    notFound();
  }

  const caso = investigacaoParaCaso(dados);
  const detalhe = investigacaoDetalheParaFront(dados);
  const demonstracao = detalheDemonstrativo(slug);

  return (
    <ContentGrid
      main={
        <ComunidadeInvestigacao
          caso={caso}
          detalhe={detalhe}
          demonstracao={demonstracao}
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
      sidebar={<InvestigacaoSidebar caso={caso} detalhe={detalhe} demonstracao={demonstracao} />}
    />
  );
}
