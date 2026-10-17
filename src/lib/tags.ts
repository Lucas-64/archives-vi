// Funções puras das tags temáticas. Não acessam mocks: recebem listas já lidas por src/lib/data.ts.
import { TAGS_TEMATICAS, type TagTematica } from "../constants/tagsTematicas";
import { normalizarParaBusca } from "./texto";

// Texto exibido de uma tag do catálogo.
export function rotuloDaTag(id: TagTematica): string {
  const tag = TAGS_TEMATICAS.find((item) => item.id === id);
  // O tipo garante que `id` pertence ao catálogo; o fallback só existe para o compilador.
  return tag ? tag.rotulo : id;
}

// Lê um valor vindo da URL (?tag=) e devolve o id canônico, ou undefined se não for do catálogo.
// Aceita o id ou o rótulo, sem diferença de maiúsculas, acentos ou espaços nas extremidades.
// Valor desconhecido não filtra nada: quem chama trata undefined como "todas".
export function lerTagTematica(valor?: string | null): TagTematica | undefined {
  if (!valor) return undefined;
  const chave = normalizarParaBusca(valor).trim();
  if (chave === "") return undefined;

  const encontrada = TAGS_TEMATICAS.find(
    (tag) => tag.id === chave || normalizarParaBusca(tag.rotulo) === chave,
  );
  return encontrada?.id;
}

// Mantém os itens que têm a tag. Sem tag, devolve todos. Itens sem `tags` não entram no filtro.
export function filtrarPorTag<T extends { tags?: readonly TagTematica[] }>(
  itens: readonly T[],
  tag?: TagTematica,
): T[] {
  if (!tag) return [...itens];
  return itens.filter((item) => (item.tags ?? []).includes(tag));
}
