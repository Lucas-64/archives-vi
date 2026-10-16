import { CreatorCard } from "../../../components/cards/CreatorCard";
import { CardList } from "../../../components/page/CardList";
import { PageBody } from "../../../components/page/PageBody";
import { PageHeader } from "../../../components/page/PageHeader";
import { EmptyState } from "../../../components/states/EmptyState";
import { getCriadores } from "../../../lib/data";

// Lista de criadores em coluna única, na ordem do mock. Sem sidebar e sem contagens.
export default async function CriadoresPage() {
  const criadores = await getCriadores();

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
            descricao="Assim que novos criadores forem publicados, eles aparecem aqui."
          />
        ) : (
          <CardList>
            {criadores.map((criador) => (
              <CreatorCard key={criador.id} criador={criador} />
            ))}
          </CardList>
        )}
      </PageBody>
    </>
  );
}
