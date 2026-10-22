import { Suspense, type ReactNode } from "react";

import { InvestigacoesPerfil } from "../../../../components/perfil/InvestigacoesPerfil";
import { PublicacoesSecao } from "../../../../components/perfil/PublicacoesSecao";
import { TeoriasPublicacoesPerfil } from "../../../../components/perfil/TeoriasPublicacoesPerfil";
import { NotaLista } from "../../../../components/page/NotaLista";
import { Skeleton } from "../../../../components/states/Skeleton";
import { MeuPerfilVisaoGeral } from "../../../../components/perfil/MeuPerfilVisaoGeral";
import { investigacaoParaCaso, publicacaoParaFront } from "../../../../lib/adaptadores";
import { LIMITE_LISTA, investigacoesDoUsuario, publicacoesDoUsuario } from "../../../../server/leitura/usuarios";
import type { Criador } from "../../../../types/Criador";

// Listas do perfil. Cada uma busca os próprios dados e aparece dentro de um Suspense, então o cabeçalho e os
// indicadores chegam primeiro e as listas mostram um esqueleto enquanto carregam. A existência do perfil já
// foi verificada pela página (404 real) antes de qualquer uma destas ser renderizada.
function Carregando({ altura }: { altura: string }): ReactNode {
  return <Skeleton height={altura} radius="lg" />;
}

async function Publicacoes({ criador, abaCompleta }: { criador: Criador; abaCompleta: boolean }) {
  const { itens, haMais } = await publicacoesDoUsuario(criador.usuario);
  const publicacoes = itens.map(publicacaoParaFront);
  return (
    <>
      {abaCompleta ? (
        <TeoriasPublicacoesPerfil publicacoes={publicacoes} autor={criador} />
      ) : (
        <PublicacoesSecao publicacoes={publicacoes} autor={criador} />
      )}
      {haMais ? <NotaLista>Mostrando as {LIMITE_LISTA} publicações mais recentes.</NotaLista> : null}
    </>
  );
}

export function PublicacoesDoPerfil(props: { criador: Criador; abaCompleta?: boolean }) {
  return (
    <Suspense fallback={<Carregando altura="260px" />}>
      <Publicacoes criador={props.criador} abaCompleta={props.abaCompleta ?? false} />
    </Suspense>
  );
}

async function Investigacoes({ usuario }: { usuario: string }) {
  const { itens, haMais } = await investigacoesDoUsuario(usuario);
  return (
    <>
      <InvestigacoesPerfil criadas={itens.map(investigacaoParaCaso)} />
      {haMais ? <NotaLista>Mostrando as {LIMITE_LISTA} investigações mais recentes.</NotaLista> : null}
    </>
  );
}

export function InvestigacoesDoPerfil({ usuario }: { usuario: string }) {
  return (
    <Suspense fallback={<Carregando altura="260px" />}>
      <Investigacoes usuario={usuario} />
    </Suspense>
  );
}

async function VisaoGeral({ usuario }: { usuario: string }) {
  const [publicacoes, investigacoes] = await Promise.all([
    publicacoesDoUsuario(usuario),
    investigacoesDoUsuario(usuario),
  ]);
  return (
    <MeuPerfilVisaoGeral
      publicacoes={publicacoes.itens.map(publicacaoParaFront)}
      investigacoes={investigacoes.itens.map(investigacaoParaCaso)}
    />
  );
}

// Resumo de Meu Perfil: as mesmas listas reais das abas, em versão curta.
export function VisaoGeralDoPerfil({ usuario }: { usuario: string }) {
  return (
    <Suspense fallback={<Carregando altura="260px" />}>
      <VisaoGeral usuario={usuario} />
    </Suspense>
  );
}
