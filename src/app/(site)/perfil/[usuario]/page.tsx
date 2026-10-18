import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Breadcrumb } from "../../../../components/navigation/Breadcrumb";
import { AbasPerfil } from "../../../../components/perfil/AbasPerfil";
import { ProfileHeader } from "../../../../components/perfil/ProfileHeader";
import { PublicacoesSecao } from "../../../../components/perfil/PublicacoesSecao";
import { EmptyState } from "../../../../components/states/EmptyState";
import { ROUTES } from "../../../../constants/routes";
import { buscarCriadorPorUsuario } from "../../../../lib/criadores";
import {
  getConquistasDoMembro,
  getCriadores,
  getInvestigacaoPorSlug,
  getInvestigacoes,
  getPatentesDoMembro,
  getPublicacoes,
} from "../../../../lib/data";
import { ConquistasInvestigador } from "../../../../components/perfil/ConquistasInvestigador";
import { PatenteInvestigador } from "../../../../components/perfil/PatenteInvestigador";
import { TeoriasPublicacoesPerfil } from "../../../../components/perfil/TeoriasPublicacoesPerfil";
import {
  contarContribuicoes,
  contribuicoesRecentes,
  investigacaoEmDestaque,
  investigacoesDoMembro,
} from "../../../../lib/perfil";
import { InvestigacoesPerfil } from "../../../../components/perfil/InvestigacoesPerfil";
import { ContribuicoesRecentes } from "../../../../components/perfil/ContribuicoesRecentes";
import { IndicadoresContribuicao } from "../../../../components/perfil/IndicadoresContribuicao";
import { InvestigacaoEmDestaque } from "../../../../components/perfil/InvestigacaoEmDestaque";

type Params = Promise<{ usuario: string }>;

// Profiles are generated at build time from the creators list (mocks today). With
// dynamicParams = false, a usuario outside that list gets a real HTTP 404 from the router,
// before any streaming starts. Use this only while the list is fixed at build time: a new
// creator then needs a new build. See docs/DECISIONS.md, ADR-014.
export const dynamicParams = false;

export async function generateStaticParams() {
  const criadores = await getCriadores();
  return criadores.map((criador) => ({ usuario: criador.usuario }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { usuario } = await params;
  const criador = buscarCriadorPorUsuario(await getCriadores(), usuario);

  if (!criador) {
    return { title: "Perfil não encontrado | ARCHIVES VI" };
  }

  return { title: `${criador.nome} | ARCHIVES VI`, description: criador.bio };
}

export default async function PerfilPage({ params }: { params: Params }) {
  const { usuario } = await params;
  const criador = buscarCriadorPorUsuario(await getCriadores(), usuario);

  // Unknown usuario: render the (site) not-found page instead of an empty profile.
  if (!criador) notFound();

  const [publicacoes, casos, patentes, conquistas] = await Promise.all([
    getPublicacoes(),
    getInvestigacoes(),
    getPatentesDoMembro(criador.id),
    getConquistasDoMembro(criador.id),
  ]);

  // Only investigations with a published detail have author and participants (see lib/perfil.ts).
  const detalhes = (await Promise.all(casos.map((caso) => getInvestigacaoPorSlug(caso.id))))
    .flatMap((resultado) => (resultado?.detalhe ? [resultado.detalhe] : []));
  const contagens = contarContribuicoes(criador, publicacoes, detalhes);

  // Fallback determinístico (docs/features/perfil-social.md, seção 4), não escolha do membro.
  // O detalhe e o Case compartilham o mesmo id. Sem elegível, o bloco não é renderizado.
  const detalheEmDestaque = investigacaoEmDestaque(criador, detalhes);
  const casoEmDestaque = detalheEmDestaque
    ? casos.find((caso) => caso.id === detalheEmDestaque.id)
    : undefined;

  // Aba "Investigações": só investigações com detalhe publicado, separadas em criadas e participações.
  const { criadas, participacoes } = investigacoesDoMembro(criador, detalhes);
  const casoPorId = new Map(casos.map((caso) => [caso.id, caso]));
  const investigacoesCriadas = criadas.flatMap((detalhe) => casoPorId.get(detalhe.id) ?? []);
  const investigacoesParticipadas = participacoes.flatMap((detalhe) => casoPorId.get(detalhe.id) ?? []);

  // Limite e ordenação vêm de contribuicoesRecentes (padrão: 10, mais recente primeiro).
  const itensContribuicao = contribuicoesRecentes(criador, publicacoes, detalhes);

  // getPublicacoes already sorts by date, most recent first.
  const publicacoesDoCriador = publicacoes.filter((item) => item.autorId === criador.id);

  // Lateral própria do perfil: patente e conquistas do próprio membro (ADR-019). A sidebar global de
  // tópicos e atualizações não é usada aqui (docs/features/perfil-social.md, seção 8).
  return (
    <ContentGrid
      sidebar={
        <>
          <PatenteInvestigador patentes={patentes} />
          <ConquistasInvestigador conquistas={conquistas} />
        </>
      }
      main={
        <>
          <Breadcrumb
            itens={[
              { label: "Início", href: ROUTES.inicio },
              { label: "Criadores", href: ROUTES.criadores },
              { label: criador.nome },
            ]}
          />
          <ProfileHeader criador={criador} />
          <IndicadoresContribuicao contagens={contagens} />
          {/* A aba é escolhida no cliente por ?aba=; a rota continua estática (ADR-014). */}
          <AbasPerfil
            paineis={{
              "visao-geral": (
                <>
                  {detalheEmDestaque && casoEmDestaque ? (
                    <InvestigacaoEmDestaque caso={casoEmDestaque} detalhe={detalheEmDestaque} />
                  ) : null}
                  <ContribuicoesRecentes itens={itensContribuicao} investigacoes={casos} />
                  <PublicacoesSecao publicacoes={publicacoesDoCriador} autor={criador} />
                </>
              ),
              investigacoes: (
                <InvestigacoesPerfil criadas={investigacoesCriadas} participacoes={investigacoesParticipadas} />
              ),
              "teorias-publicacoes": (
                <TeoriasPublicacoesPerfil publicacoes={publicacoesDoCriador} autor={criador} />
              ),
              conquistas: (
                <EmptyState
                  titulo="Conquistas ainda não disponíveis"
                  descricao="As conquistas ainda não existem no site. Este espaço será preenchido quando existirem."
                />
              ),
            }}
          />
        </>
      }
    />
  );
}
