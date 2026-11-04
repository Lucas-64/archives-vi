"use client";

import { ROUTES } from "../../constants/routes";
import { classificacaoDoMisterio, textoInvestigacoesAbertas } from "../../lib/misterio";
import type { MisterioResumo } from "../../server/contracts/misterios";
import { MisterioCard } from "../cards/MisterioCard";
import { CardList } from "../page/CardList";
import { EmptyState } from "../states/EmptyState";
import { ClassificacaoBadge } from "../ui/ClassificacaoBadge";

// Aba "Mistérios" do perfil: os mistérios que a pessoa publicou (postagens simples, ADR-044).
export function MisteriosPerfil({ itens }: { itens: readonly MisterioResumo[] }) {
  if (itens.length === 0) {
    return <EmptyState titulo="Nenhum mistério publicado aqui" descricao="Quando este membro criar um mistério, ele aparece aqui." />;
  }
  return (
    <CardList>
      {itens.map((item) => (
        <MisterioCard
          key={item.id}
          titulo={item.titulo}
          descricao={item.descricao}
          imagem={item.imagem}
          selo={<ClassificacaoBadge classificacao={classificacaoDoMisterio(item.classificacao)} />}
          meta={[textoInvestigacoesAbertas(item.investigacoesAbertas)]}
          href={ROUTES.misterio(item.slug)}
        />
      ))}
    </CardList>
  );
}
