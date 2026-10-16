import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Sidebar } from "../../../../components/home/Sidebar";
import { ContentGrid } from "../../../../components/layout/ContentGrid";
import { Breadcrumb } from "../../../../components/navigation/Breadcrumb";
import { ProfileHeader } from "../../../../components/perfil/ProfileHeader";
import { PublicacoesSecao } from "../../../../components/perfil/PublicacoesSecao";
import { ROUTES } from "../../../../constants/routes";
import { buscarCriadorPorUsuario } from "../../../../lib/criadores";
import {
  getAtualizacoes,
  getCriadores,
  getPublicacoes,
  getTopicosForum,
} from "../../../../lib/data";

type Params = Promise<{ usuario: string }>;

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

  const [publicacoes, topicos, atualizacoes] = await Promise.all([
    getPublicacoes(),
    getTopicosForum(),
    getAtualizacoes(),
  ]);

  // getPublicacoes already sorts by date, most recent first.
  const publicacoesDoCriador = publicacoes.filter((item) => item.autorId === criador.id);

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
          <PublicacoesSecao publicacoes={publicacoesDoCriador} autor={criador} />
        </>
      }
      sidebar={<Sidebar topicos={topicos} atualizacoes={atualizacoes} />}
    />
  );
}
