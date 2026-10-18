import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentGrid } from "../../../components/layout/ContentGrid";
import { InvestigacoesPerfil } from "../../../components/perfil/InvestigacoesPerfil";
import { MeuPerfilArea } from "../../../components/perfil/MeuPerfilArea";
import { MeuPerfilEvidencias, MeuPerfilRespostas, MeuPerfilSolicitacoes } from "../../../components/perfil/MeuPerfilListas";
import { TeoriasPublicacoesPerfil } from "../../../components/perfil/TeoriasPublicacoesPerfil";
import {
  getConquistasDoMembro,
  getCriadorPorId,
  getInvestigacaoPorSlug,
  getInvestigacoes,
  getPatentesDoMembro,
  getPublicacoes,
} from "../../../lib/data";
import {
  ID_CRIADOR_DEMONSTRATIVO,
  evidenciasDoMembro,
  respostasDoMembro,
} from "../../../lib/meuPerfil";
import { investigacoesDoMembro } from "../../../lib/perfil";
import {
  conexoesDemonstrativas,
  notificacoesDemonstrativas,
  solicitacoesDemonstrativas,
} from "../../../mocks/meuPerfil";

// Área pessoal demonstrativa (ADR-021). Não há login: a página mostra um criador fixo dos mocks.
// Rota estática sem parâmetros, então não há 404 dinâmico a tratar.
export const metadata: Metadata = {
  title: "Meu perfil | ARCHIVES VI",
  description: "Área pessoal demonstrativa do membro.",
  robots: { index: false, follow: false },
};

export default async function MeuPerfilPage() {
  const criador = await getCriadorPorId(ID_CRIADOR_DEMONSTRATIVO);

  if (!criador) notFound();

  const [publicacoes, casos, patentes, conquistas] = await Promise.all([
    getPublicacoes(),
    getInvestigacoes(),
    getPatentesDoMembro(criador.id),
    getConquistasDoMembro(criador.id),
  ]);

  // Só investigações com detalhe publicado entram nas listas (mesma regra do perfil público).
  const detalhes = (await Promise.all(casos.map((caso) => getInvestigacaoPorSlug(caso.id))))
    .flatMap((resultado) => (resultado?.detalhe ? [resultado.detalhe] : []));

  const { criadas, participacoes } = investigacoesDoMembro(criador, detalhes);
  const casoPorId = new Map(casos.map((caso) => [caso.id, caso]));
  const investigacoesCriadas = criadas.flatMap((detalhe) => casoPorId.get(detalhe.id) ?? []);
  const investigacoesParticipadas = participacoes.flatMap((detalhe) => casoPorId.get(detalhe.id) ?? []);

  // Registro simples por id, para as listas (sem funções: o servidor passa só dados).
  const titulos = Object.fromEntries(casos.map((caso) => [caso.id, caso.title]));

  const publicacoesDoMembro = publicacoes.filter((item) => item.autorId === criador.id);
  const evidencias = evidenciasDoMembro(criador, detalhes);
  const respostas = respostasDoMembro(criador, detalhes);

  return (
    <ContentGrid
      main={
        <MeuPerfilArea
          criador={criador}
          patentes={patentes}
          conquistas={conquistas}
          notificacoes={notificacoesDemonstrativas}
          solicitacoes={solicitacoesDemonstrativas}
          evidencias={evidencias}
          titulos={titulos}
          publicacoes={publicacoesDoMembro}
          investigacoes={[...investigacoesCriadas, ...investigacoesParticipadas]}
          paineis={{
            "teorias-publicacoes": <TeoriasPublicacoesPerfil publicacoes={publicacoesDoMembro} autor={criador} />,
            investigacoes: (
              <InvestigacoesPerfil criadas={investigacoesCriadas} participacoes={investigacoesParticipadas} />
            ),
            evidencias: <MeuPerfilEvidencias itens={evidencias} titulos={titulos} />,
            atividade: (
              <>
                <MeuPerfilSolicitacoes solicitacoes={solicitacoesDemonstrativas} conexoes={conexoesDemonstrativas} />
                <MeuPerfilRespostas itens={respostas} titulos={titulos} />
              </>
            ),
          }}
        />
      }
    />
  );
}
