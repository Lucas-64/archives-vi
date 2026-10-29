import { ExploreGrid } from "../../../components/home/ExploreCards";
import { ContentGrid } from "../../../components/layout/ContentGrid";
import { InvestigacoesRecentes } from "../../../components/home/InvestigacoesRecentes";
import { TeoriasRecentes } from "../../../components/home/TeoriasRecentes";
import { PageHeader } from "../../../components/page/PageHeader";
import { investigacaoParaCaso, perfilParaCriador, publicacaoParaFront } from "../../../lib/adaptadores";
import { investigacoesDaListagem } from "../../../server/leitura/investigacoes";
import { publicacoesDaListagem } from "../../../server/leitura/publicacoes";

// Atalhos para as áreas que existem (Mistérios e Teorias), as investigações e as teorias mais recentes, reais (API, via
// serviço no processo; ADR-029). Mapa e Galeria não têm rota nem dados e ficaram de fora.
export const dynamic = "force-dynamic";

const QUANTIDADE_RECENTES = 3;

export default async function ExplorarPage() {
  const [{ itens }, publicacoes] = await Promise.all([investigacoesDaListagem(), publicacoesDaListagem()]);
  const recentes = itens.slice(0, QUANTIDADE_RECENTES).map(investigacaoParaCaso);
  const teorias = publicacoes.itens.slice(0, QUANTIDADE_RECENTES).map((item) => ({
    publicacao: publicacaoParaFront(item),
    autor: perfilParaCriador({ usuario: item.autor.usuario, nome: item.autor.nome, bio: "" }),
  }));

  return (
    <ContentGrid
      main={
        <>
          <PageHeader titulo="Explorar" descricao="Escolha por onde começar: mistérios e teorias da comunidade." />
          <ExploreGrid />
          <InvestigacoesRecentes casos={recentes} />
          <TeoriasRecentes itens={teorias} />
        </>
      }
    />
  );
}
