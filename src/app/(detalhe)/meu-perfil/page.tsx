import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ContentGrid } from "../../../components/layout/ContentGrid";
import { MeuPerfilArea } from "../../../components/perfil/MeuPerfilArea";
import { demonstracaoDoUsuario } from "../../../constants/demonstracaoMamoa";
import { ROUTES } from "../../../constants/routes";
import { usuarioDaSessao } from "../../../server/auth/sessaoServidor";
import { InvestigacoesDoPerfil, PublicacoesDoPerfil, VisaoGeralDoPerfil } from "../perfil/[usuario]/dados";

// Área pessoal (ADR-021) com dados reais da sessão (ADR-029). A página lê o cookie no servidor, então é
// dinâmica; as demais rotas do site continuam estáticas. Sem sessão, redireciona para /entrar.
// Patente, especializações, evidências e atividade não têm fonte real e aparecem como estado vazio (ADR-037).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meu perfil | ARCHIVES VI",
  description: "Sua área pessoal no Archives VI.",
  robots: { index: false, follow: false },
};

export default async function MeuPerfilPage() {
  const sessao = await usuarioDaSessao();
  if (!sessao) redirect(ROUTES.entrar);

  const criador = { id: sessao.usuario, usuario: sessao.usuario, nome: sessao.nome,
    bio: sessao.bio,
    ...(sessao.avatarUrl ? { avatar: sessao.avatarUrl } : {}),
    ...(sessao.bannerUrl ? { banner: sessao.bannerUrl } : {}),
  };

  return (
    <ContentGrid
      main={
        <MeuPerfilArea
          // A chave só muda com a pessoa. Incluir nome e bio fazia o componente remontar após router.refresh()
          // e apagava o aviso "Perfil atualizado."; o estado já recebe os dados confirmados pela API.
          key={sessao.usuario}
          criador={criador}
          demonstracao={demonstracaoDoUsuario(sessao.usuario)}
          paineis={{
            "visao-geral": <VisaoGeralDoPerfil usuario={sessao.usuario} />,
            "teorias-publicacoes": <PublicacoesDoPerfil criador={criador} abaCompleta />,
            investigacoes: <InvestigacoesDoPerfil usuario={sessao.usuario} />,
          }}
        />
      }
    />
  );
}
