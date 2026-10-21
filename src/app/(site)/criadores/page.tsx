import { CreatorCard } from "../../../components/cards/CreatorCard";
import { CardList } from "../../../components/page/CardList";
import { NotaLista } from "../../../components/page/NotaLista";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { LIMITE_LISTA, criadoresDaPagina } from "../../../server/leitura/usuarios";
import { perfilParaCriador } from "../../../lib/adaptadores";

// Os dados vêm do banco a cada requisição (não há conteúdo fixo no build).
export const dynamic = "force-dynamic";

// Criadores reais: contas com ao menos uma publicação publicada ou uma investigação, em ordem alfabética
// de usuário. Sem sidebar. Mostra as primeiras LIMITE_LISTA e avisa quando há mais (ainda não há "ver mais").
export default async function CriadoresPage() {
  const { itens, haMais } = await criadoresDaPagina();
  const criadores = itens.map(perfilParaCriador);

  return (
    <>
      <PageHeader
        titulo="Criadores"
        descricao="Criadores da comunidade, com perfis públicos e as publicações de cada um."
      />

      <PageBody>
        {criadores.length === 0 ? (
          <EmptyState
            titulo="Nenhum criador por enquanto"
            descricao="Os criadores aparecem aqui quando publicam uma teoria ou abrem uma investigação."
          />
        ) : (
          <>
            <CardList>
              {criadores.map((criador) => (
                <CreatorCard key={criador.id} criador={criador} />
              ))}
            </CardList>
            {haMais ? <NotaLista>Mostrando os primeiros {LIMITE_LISTA} criadores, em ordem alfabética.</NotaLista> : null}
          </>
        )}
      </PageBody>
    </>
  );
}
