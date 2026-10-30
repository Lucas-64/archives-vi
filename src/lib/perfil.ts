// Funções puras do perfil social (etapa 1 de docs/features/perfil-social.md).
// Recebem listas já lidas de src/lib/data.ts e devolvem derivações. Não acessam mocks,
// não gravam dados e não implementam XP, patentes, conquistas ou votação.
import type { Criador } from "@/types/Criador";
import type { InvestigacaoDetalhe, Pessoa } from "@/types/InvestigacaoDetalhe";
import type { Publicacao } from "@/types/Publicacao";

export interface ContagensContribuicao {
  investigacoesCriadas: number;
  teoriasPublicadas: number;
  evidenciasEnviadas: number;
}

export type ContribuicaoRecente =
  | {
      tipo: "publicacao";
      id: string;
      slug: string;
      subtipo: Publicacao["tipo"];
      titulo: string;
      resumo: string;
      data: string;
    }
  | {
      tipo: "evidencia";
      id: string;
      investigacaoId: string;
      titulo: string;
      data: string;
    }
  | {
      tipo: "investigacao";
      papel: "criou" | "participou";
      investigacaoId: string;
      data: string;
    };

// Um membro é identificado pelo `usuario` nas pessoas dos detalhes. Publicações usam `autorId`,
// que é o `id` do criador (ver src/mocks/criadores.ts).
function ehDoMembro(pessoa: Pessoa, criador: Criador): boolean {
  return pessoa.usuario === criador.usuario;
}

// Contagens para os indicadores. Evidências enviadas são as evidências públicas em que o membro
// é autor, mais as sugestões aceitas que ele enviou. Pendentes e recusadas não contam.
export function contarContribuicoes(
  criador: Criador,
  publicacoes: readonly Publicacao[],
  detalhes: readonly InvestigacaoDetalhe[],
): ContagensContribuicao {
  const teoriasPublicadas = publicacoes.filter(
    (publicacao) => publicacao.autorId === criador.id && publicacao.tipo === "teoria",
  ).length;

  const investigacoesCriadas = detalhes.filter((detalhe) => ehDoMembro(detalhe.autor, criador)).length;

  const evidenciasEnviadas = detalhes.reduce((total, detalhe) => {
    const publicas = detalhe.evidencias.filter((evidencia) => ehDoMembro(evidencia.autor, criador)).length;
    const aceitas = detalhe.sugestoes.filter(
      (sugestao) => sugestao.status === "aceita" && ehDoMembro(sugestao.enviadaPor, criador),
    ).length;
    return total + publicas + aceitas;
  }, 0);

  return { investigacoesCriadas, teoriasPublicadas, evidenciasEnviadas };
}

// Investigação em destaque, pela regra determinística de docs/features/perfil-social.md (seção 4):
// elegíveis são as detalhadas em que o membro é autor ou participante. Ordem: criadas antes de
// participações; depois `atualizadoEm` mais recente; por último `id` em ordem crescente.
// Sem elegível, devolve undefined e o bloco não aparece.
export function investigacaoEmDestaque(
  criador: Criador,
  detalhes: readonly InvestigacaoDetalhe[],
): InvestigacaoDetalhe | undefined {
  const elegiveis = detalhes.filter(
    (detalhe) =>
      ehDoMembro(detalhe.autor, criador) ||
      detalhe.participantes.some((pessoa) => ehDoMembro(pessoa, criador)),
  );

  const ordenadas = [...elegiveis].sort((a, b) => {
    const criadaA = ehDoMembro(a.autor, criador) ? 1 : 0;
    const criadaB = ehDoMembro(b.autor, criador) ? 1 : 0;
    if (criadaA !== criadaB) return criadaB - criadaA;
    if (a.atualizadoEm !== b.atualizadoEm) return b.atualizadoEm.localeCompare(a.atualizadoEm);
    return a.id.localeCompare(b.id);
  });

  return ordenadas[0];
}

// Investigações para a aba "Investigações". Criadas: o membro é o autor. Participações: o membro está em
// `participantes` e não é o autor. Só entram investigações com detalhe publicado, porque só o detalhe tem
// autor e participantes. Ordem: `atualizadoEm` mais recente primeiro; desempate por `id`.
export function investigacoesDoMembro(
  criador: Criador,
  detalhes: readonly InvestigacaoDetalhe[],
): { criadas: InvestigacaoDetalhe[]; participacoes: InvestigacaoDetalhe[] } {
  const criadas = detalhes.filter((detalhe) => ehDoMembro(detalhe.autor, criador));
  const participacoes = detalhes.filter(
    (detalhe) =>
      !ehDoMembro(detalhe.autor, criador) &&
      detalhe.participantes.some((pessoa) => ehDoMembro(pessoa, criador)),
  );

  const porAtualizacao = (a: InvestigacaoDetalhe, b: InvestigacaoDetalhe) =>
    a.atualizadoEm !== b.atualizadoEm
      ? b.atualizadoEm.localeCompare(a.atualizadoEm)
      : a.id.localeCompare(b.id);

  return {
    criadas: [...criadas].sort(porAtualizacao),
    participacoes: [...participacoes].sort(porAtualizacao),
  };
}

// Contribuições recentes: publicações do membro, evidências públicas, sugestões aceitas e
// investigações criadas ou de participação. Ordenadas por data, mais recente primeiro.
// Para participações, a data é `atualizadoEm` da investigação: não há data de entrada no membro.
export function contribuicoesRecentes(
  criador: Criador,
  publicacoes: readonly Publicacao[],
  detalhes: readonly InvestigacaoDetalhe[],
  limite = 10,
): ContribuicaoRecente[] {
  const itens: ContribuicaoRecente[] = [];

  for (const publicacao of publicacoes) {
    if (publicacao.autorId !== criador.id) continue;
    itens.push({
      tipo: "publicacao",
      id: publicacao.id,
      slug: publicacao.slug,
      subtipo: publicacao.tipo,
      titulo: publicacao.titulo,
      resumo: publicacao.resumo,
      data: publicacao.data,
    });
  }

  for (const detalhe of detalhes) {
    for (const evidencia of detalhe.evidencias) {
      if (!ehDoMembro(evidencia.autor, criador)) continue;
      itens.push({
        tipo: "evidencia",
        id: evidencia.id,
        investigacaoId: detalhe.id,
        titulo: evidencia.titulo,
        data: evidencia.data,
      });
    }

    for (const sugestao of detalhe.sugestoes) {
      if (sugestao.status !== "aceita" || !ehDoMembro(sugestao.enviadaPor, criador)) continue;
      itens.push({
        tipo: "evidencia",
        id: sugestao.id,
        investigacaoId: detalhe.id,
        titulo: sugestao.titulo,
        data: sugestao.data,
      });
    }

    if (ehDoMembro(detalhe.autor, criador)) {
      itens.push({ tipo: "investigacao", papel: "criou", investigacaoId: detalhe.id, data: detalhe.atualizadoEm });
    } else if (detalhe.participantes.some((pessoa) => ehDoMembro(pessoa, criador))) {
      itens.push({ tipo: "investigacao", papel: "participou", investigacaoId: detalhe.id, data: detalhe.atualizadoEm });
    }
  }

  return itens
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, limite);
}

// Abas do perfil (etapa 4). A Visão geral é o padrão e não aparece na URL. Valores desconhecidos
// em ?aba= equivalem à Visão geral. A leitura acontece no cliente (AbasPerfil), não no servidor,
// para a rota continuar estática (ADR-014).
export const ABAS_PERFIL = [
  { chave: "visao-geral", rotulo: "Visão geral", parametro: undefined },
  { chave: "investigacoes", rotulo: "Mistérios", parametro: "investigacoes" },
  { chave: "teorias-publicacoes", rotulo: "Teorias e publicações", parametro: "teorias-publicacoes" },
  { chave: "conquistas", rotulo: "Conquistas", parametro: "conquistas" },
] as const;

export type AbaPerfil = (typeof ABAS_PERFIL)[number]["chave"];

export function lerAbaPerfil(valor?: string | null): AbaPerfil {
  const aba = ABAS_PERFIL.find((item) => item.parametro !== undefined && item.parametro === valor);
  return aba ? aba.chave : "visao-geral";
}
