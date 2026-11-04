// Busca da página /buscar. Funções puras: recebem a consulta e as listas já lidas
// de src/lib/data.ts e devolvem os resultados por tipo. Não acessam dados nem mocks.
import { ROUTES } from "@/constants/routes";
import { CLASSIFICACOES_MISTERIO } from "@/constants/classificacoesMisterio";
import { rotuloDaTag } from "@/lib/tags";
import { normalizarParaBusca } from "@/lib/texto";
import type { CasoDeCard } from "@/types/Case";
import type { Criador } from "@/types/Criador";
import type { Publicacao } from "@/types/Publicacao";

// Valores de aba aceitos na URL (?tipo=...). Qualquer outro valor equivale a "todos".
// "misterios" é o tipo simples (ADR-044); "investigacoes" é o objeto rico.
export const ABAS_BUSCA = ["todos", "misterios", "investigacoes", "publicacoes", "criadores"] as const;
export type AbaBusca = (typeof ABAS_BUSCA)[number];

// Mistério como a busca o usa (subconjunto de MisterioResumo).
export interface MisterioDeBusca {
  slug: string;
  titulo: string;
  descricao: string;
  imagem: string | null;
  classificacao: string;
  investigacoesAbertas: number;
  atualizadoEm: string;
}

export interface DadosBusca {
  misterios?: readonly MisterioDeBusca[];
  publicacoes: readonly Publicacao[];
  investigacoes: readonly CasoDeCard[];
  criadores: readonly Criador[];
}

export interface ResultadoBusca {
  misterios: MisterioDeBusca[];
  publicacoes: Publicacao[];
  investigacoes: CasoDeCard[];
  criadores: Criador[];
}

export function lerAbaBusca(valor?: string): AbaBusca {
  return ABAS_BUSCA.find((aba) => aba === valor) ?? "todos";
}

// Consulta sem espaços nas pontas. Vazia significa "sem consulta".
export function normalizarConsulta(valor?: string): string {
  return (valor ?? "").trim();
}

// `termo` já vem normalizado por buscar(). Campos e termo são comparados sem acentos e sem
// diferença de maiúsculas e minúsculas.
function contem(texto: string, termo: string): boolean {
  return normalizarParaBusca(texto).includes(termo);
}

// Publicações: título, resumo, palavras-chave (termos) e rótulos dos temas. Mais recentes primeiro
// (data ISO AAAA-MM-DD). Os temas entram pelo rótulo do catálogo, não pelo id.
function pesquisarPublicacoes(termo: string, publicacoes: readonly Publicacao[]): Publicacao[] {
  return publicacoes
    .filter(
      (item) =>
        contem(item.titulo, termo) ||
        contem(item.resumo, termo) ||
        item.termos.some((palavra) => contem(palavra, termo)) ||
        item.tags.some((tag) => contem(rotuloDaTag(tag), termo)),
    )
    .sort((a, b) => b.data.localeCompare(a.data));
}

// Investigações: título, descrição e localização. Ordenadas por updatedAt, mais recentes
// primeiro. Registros sem updatedAt vêm depois, na ordem em que estão no mock.
function pesquisarInvestigacoes(termo: string, investigacoes: readonly CasoDeCard[]): CasoDeCard[] {
  const encontrados = investigacoes.filter(
    (item) =>
      contem(item.title, termo) ||
      contem(item.description, termo) ||
      (item.location !== undefined && contem(item.location, termo)),
  );

  const comData = encontrados
    .filter((item): item is CasoDeCard & { updatedAt: string } => item.updatedAt !== undefined)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const semData = encontrados.filter((item) => item.updatedAt === undefined);

  return [...comData, ...semData];
}

// Mistérios: título, descrição e rótulo da classificação. Mais recentes primeiro.
function pesquisarMisterios(termo: string, misterios: readonly MisterioDeBusca[]): MisterioDeBusca[] {
  const rotulo = (id: string) => CLASSIFICACOES_MISTERIO.find((c) => c.id === id)?.rotulo ?? "";
  return misterios
    .filter((item) => contem(item.titulo, termo) || contem(item.descricao, termo) || contem(rotulo(item.classificacao), termo))
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

// Criadores: nome, usuário e bio. Mantém a ordem do mock.
function pesquisarCriadores(termo: string, criadores: readonly Criador[]): Criador[] {
  return criadores.filter(
    (item) => contem(item.nome, termo) || contem(item.usuario, termo) || contem(item.bio, termo),
  );
}

// Devolve os resultados do tipo escolhido na aba. Na aba "todos", devolve os três tipos.
// Consulta vazia devolve listas vazias.
export function buscar(consulta: string, aba: AbaBusca, dados: DadosBusca): ResultadoBusca {
  const termo = normalizarParaBusca(normalizarConsulta(consulta));
  const vazio: ResultadoBusca = { misterios: [], publicacoes: [], investigacoes: [], criadores: [] };

  if (!termo) return vazio;

  return {
    misterios: aba === "todos" || aba === "misterios" ? pesquisarMisterios(termo, dados.misterios ?? []) : [],
    publicacoes:
      aba === "todos" || aba === "publicacoes" ? pesquisarPublicacoes(termo, dados.publicacoes) : [],
    investigacoes:
      aba === "todos" || aba === "investigacoes" ? pesquisarInvestigacoes(termo, dados.investigacoes) : [],
    criadores: aba === "todos" || aba === "criadores" ? pesquisarCriadores(termo, dados.criadores) : [],
  };
}

export function contarResultados(resultado: ResultadoBusca): number {
  return resultado.misterios.length + resultado.publicacoes.length + resultado.investigacoes.length + resultado.criadores.length;
}

// Monta o endereço de /buscar mantendo a consulta. A aba "todos" não aparece na URL.
export function montarHrefBusca(consulta: string, aba: AbaBusca): string {
  const params = new URLSearchParams();
  const termo = normalizarConsulta(consulta);
  if (termo) params.set("q", termo);
  if (aba !== "todos") params.set("tipo", aba);

  const query = params.toString();
  return query ? `${ROUTES.buscar}?${query}` : ROUTES.buscar;
}
