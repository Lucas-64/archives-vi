import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ComunidadeInvestigacaoClassica } from "../../../../../components/investigacao-classica/ComunidadeInvestigacaoClassica";
import { InvestigacaoSidebarClassica } from "../../../../../components/investigacao-classica/InvestigacaoSidebarClassica";
import { EvidenciasInvestigacao } from "../../../../../components/investigacao/EvidenciasInvestigacao";
import { ContentGrid } from "../../../../../components/layout/ContentGrid";
import { EmptyState } from "../../../../../components/states/EmptyState";
import { getInvestigacaoPorSlug } from "../../../../../lib/data";
import { Skeleton } from "../../../../../components/states/Skeleton";
import {
  evidenciaParaFront,
  historicoParaFront,
  investigacaoDetalheParaFront,
  investigacaoParaCaso,
  sugestaoParaFront,
} from "../../../../../lib/adaptadores";
import { detalheClassicoDoBanco } from "../../../../../lib/detalheClassico";
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

// Área comunitária de uma investigação, no layout da versão de backup (ADR-041) com capa em TODAS (ADR-042):
// slugs com conteúdo completo no mock (ex.: simbolos-vice-city) mostram os dados do backup; as investigações do banco
// usam o mesmo layout com dados reais (teoria, estado, histórico e a lista REAL de evidências, com envio, sugestões e
// aceitar/recusar pela API) e estado vazio rotulado onde a API não tem dado (discussão, síntese, atividade e
// participantes). Dinâmica: investigações criadas depois do build abrem sem recompilar, e um slug inexistente
// responde HTTP 404 real porque a verificação acontece antes de qualquer Suspense e este grupo não tem `loading.tsx`
// (ADR-028). O cookie é lido só para as permissões e para as sugestões da própria pessoa; a API repete a autorização.
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
  return { title: `Discussão: ${dados.titulo} | ARCHIVES VI` };
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

export default async function ComunidadeInvestigacaoPage({ params }: { params: Params }) {
  const { slug } = await params;

  const classico = await getInvestigacaoPorSlug(slug);
  const sessao = await usuarioDaSessao();
  const dados = await investigacaoPorSlug(slug, sessao?.id, sessao?.papel);

  // Slug com conteúdo completo no mock (ex.: simbolos-vice-city): dados e componente do backup, mais a capa.
  if (classico?.detalhe) {
    return (
      <ContentGrid
        main={
          <ComunidadeInvestigacaoClassica
            caso={classico.caso}
            detalhe={classico.detalhe}
            capa={classico.caso.image}
            mostrarLinkMisterio={dados !== null}
          />
        }
        sidebar={<InvestigacaoSidebarClassica caso={classico.caso} detalhe={classico.detalhe} />}
      />
    );
  }

  if (!dados) {
    // Registro do mock sem a discussão publicada: mesma mensagem da página antiga. Sem registro algum: 404 real.
    if (classico) {
      return (
        <ContentGrid
          main={
            <EmptyState
              titulo={classico.caso.title}
              descricao="A discussão deste mistério ainda não foi publicada."
            />
          }
        />
      );
    }
    notFound();
  }

  const caso = investigacaoParaCaso(dados);
  const { itens: registros } = await historicoDaInvestigacao(slug);
  const detalhe = detalheClassicoDoBanco(investigacaoDetalheParaFront(dados), historicoParaFront(registros));

  return (
    <ContentGrid
      main={
        <ComunidadeInvestigacaoClassica
          caso={caso}
          detalhe={detalhe}
          capa={caso.capa}
          semFonte
          evidenciasReais={
            <Suspense fallback={<Skeleton height="260px" radius="lg" />}>
              <Evidencias dados={dados} sessao={sessao} />
            </Suspense>
          }
        />
      }
      sidebar={<InvestigacaoSidebarClassica caso={caso} detalhe={detalhe} semFonte />}
    />
  );
}
