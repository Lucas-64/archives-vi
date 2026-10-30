import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Breadcrumb } from "../../../../components/navigation/Breadcrumb";
import { AbasPerfil } from "../../../../components/perfil/AbasPerfil";
import { IndicadoresContribuicao } from "../../../../components/perfil/IndicadoresContribuicao";
import { ProfileHeader } from "../../../../components/perfil/ProfileHeader";
import { EmptyState } from "../../../../components/states/EmptyState";
import { ROUTES } from "../../../../constants/routes";
import { perfilParaCriador } from "../../../../lib/adaptadores";
import { perfilPublico } from "../../../../server/leitura/usuarios";
import { InvestigacoesDoPerfil, PublicacoesDoPerfil } from "./dados";

type Params = Promise<{ usuario: string }>;

// Perfis reais, lidos do banco a cada requisição: uma conta criada depois do build tem perfil sem novo build.
// Sem generateStaticParams nem dynamicParams = false (ADR-014 foi atendido de outra forma, ADR-028): o 404
// real vem do notFound() abaixo, que roda antes de qualquer streaming porque esta rota está no grupo
// (detalhe), sem loading.tsx.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { usuario } = await params;
  const perfil = await perfilPublico(usuario);

  if (!perfil) {
    return { title: "Perfil não encontrado | ARCHIVES VI" };
  }

  return { title: `${perfil.nome} | ARCHIVES VI`, description: perfil.bio || undefined };
}

export default async function PerfilPage({ params }: { params: Params }) {
  const { usuario } = await params;
  const perfil = await perfilPublico(usuario);

  // Conta inexistente ou nome fora do formato: HTTP 404 real, não um perfil vazio.
  if (!perfil) notFound();

  const criador = perfilParaCriador(perfil);
  const { indicadores } = perfil;

  // Sem patente, conquistas, investigação em destaque, participações e atividade recente: a API ainda não tem
  // esses dados, então a interface não os mostra (nada fixo nem demonstrativo).
  return (
    <ContentGrid
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
          <IndicadoresContribuicao
            itens={[
              { rotulo: "Mistérios", valor: indicadores.investigacoes },
              { rotulo: "Publicações", valor: indicadores.publicacoes },
              { rotulo: "Evidências aceitas", valor: indicadores.evidenciasAceitas },
              { rotulo: "Comentários", valor: indicadores.comentarios },
            ]}
            nota="Contagens de conteúdo público: publicações publicadas, mistérios que a pessoa abriu, evidências aceitas e comentários em publicações."
          />
          {/* A aba é escolhida no cliente por ?aba=. */}
          <AbasPerfil
            paineis={{
              "visao-geral": <PublicacoesDoPerfil criador={criador} />,
              investigacoes: <InvestigacoesDoPerfil usuario={criador.usuario} />,
              "teorias-publicacoes": <PublicacoesDoPerfil criador={criador} abaCompleta />,
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
