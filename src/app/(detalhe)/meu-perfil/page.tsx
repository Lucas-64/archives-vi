import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ContentGrid } from "../../../components/layout/ContentGrid";
import { MeuPerfilArea } from "../../../components/perfil/MeuPerfilArea";
import { ROUTES } from "../../../constants/routes";
import { usuarioDaSessao } from "../../../server/auth/sessaoServidor";
import { InvestigacoesDoPerfil, PublicacoesDoPerfil } from "../perfil/[usuario]/dados";

// Área pessoal (ADR-021) com dados reais da sessão (ADR-029). A página lê o cookie no servidor, então é
// dinâmica; as demais rotas do site continuam estáticas. Sem sessão, redireciona para /entrar.
// Visão geral, evidências, atividade, patente e conquistas voltam na Fatia 6 da Etapa I.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meu perfil | ARCHIVES VI",
  description: "Sua área pessoal no Archives VI.",
  robots: { index: false, follow: false },
};

export default async function MeuPerfilPage() {
  const sessao = await usuarioDaSessao();
  if (!sessao) redirect(ROUTES.entrar);

  const criador = { id: sessao.usuario, usuario: sessao.usuario, nome: sessao.nome, bio: sessao.bio };

  return (
    <ContentGrid
      main={
        <MeuPerfilArea
          // A chave só muda com a pessoa. Incluir nome e bio fazia o componente remontar após router.refresh()
          // e apagava o aviso "Perfil atualizado."; o estado já recebe os dados confirmados pela API.
          key={sessao.usuario}
          criador={criador}
          paineis={{
            "teorias-publicacoes": <PublicacoesDoPerfil criador={criador} abaCompleta />,
            investigacoes: <InvestigacoesDoPerfil usuario={sessao.usuario} />,
          }}
        />
      }
    />
  );
}
