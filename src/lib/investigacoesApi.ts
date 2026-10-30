// Evidências e sugestões pela API real, no navegador. Só há sucesso quando o servidor confirma e devolve o
// registro gravado. Quem pode enviar, aceitar ou recusar é decidido pelo servidor.
import { chamar, texto } from "./publicacoesApi";

export type OrigemEnviavel = "referencia_textual" | "origem_nao_verificada" | "imagem_propria" | "imagem_terceiro";

export interface EntradaEvidencia {
  origem: OrigemEnviavel;
  titulo: string;
  descricao: string;
  fonte?: string;
  // URL devolvida pelo envio de imagem (UploadImagem). Opcional.
  imagem?: string;
}

// `aceita`: o responsável publicou a própria evidência. `pendente`: a sugestão aguarda análise.
export function enviarEvidenciaNaApi(slug: string, dados: EntradaEvidencia) {
  return chamar(
    `/api/v1/investigacoes/${encodeURIComponent(slug)}/evidencias`,
    "POST",
    dados,
    ["origem", "titulo", "descricao", "fonte", "imagem"],
    (json) => {
      const e = json as { id?: unknown; status?: unknown } | null;
      return texto(e?.id) && (e.status === "aceita" || e.status === "pendente") ? { status: e.status as "aceita" | "pendente" } : null;
    },
  );
}

export function decidirSugestaoNaApi(slug: string, id: string, decisao: "aceitar" | "recusar", motivo?: string) {
  return chamar(
    `/api/v1/investigacoes/${encodeURIComponent(slug)}/sugestoes/${encodeURIComponent(id)}/${decisao}`,
    "POST",
    decisao === "recusar" && motivo ? { motivo } : undefined,
    ["motivo"],
    (json) => {
      const e = json as { status?: unknown } | null;
      return e?.status === "aceita" || e?.status === "recusada" ? { status: e.status as "aceita" | "recusada" } : null;
    },
  );
}

export interface EntradaInvestigacao {
  titulo: string;
  descricao: string;
  categoria: string;
  localizacao?: string;
  tags: string[];
  video?: { url: string; titulo?: string };
  imagem?: string;
  teoria: { hipotese: string; argumentosFavoraveis: string[]; perguntaCentral: string; fontes: string[] };
}

// Máximo de itens das listas da teoria (espelha `itensPorLista` do contrato). Define quais chaves de erro
// (`teoria.argumentosFavoraveis.N`) o formulário sabe mostrar junto ao item.
export const MAXIMO_ITENS_LISTA = 10;

const CAMPOS_CRIACAO = [
  "titulo",
  "descricao",
  "categoria",
  "localizacao",
  "tags",
  "video.url",
  "video.titulo",
  "imagem",
  "teoria.hipotese",
  "teoria.argumentosFavoraveis",
  "teoria.perguntaCentral",
  "teoria.fontes",
  ...Array.from({ length: MAXIMO_ITENS_LISTA }, (_, i) => `teoria.argumentosFavoraveis.${i}`),
  ...Array.from({ length: MAXIMO_ITENS_LISTA }, (_, i) => `teoria.fontes.${i}`),
] as const;

// Cria a investigação. Só há sucesso quando o servidor responde 201 com o `slug` gravado; a navegação
// para ela acontece depois disso. Limites (3 abertas, taxa) e permissões são decididos pelo servidor.
export function criarInvestigacaoNaApi(dados: EntradaInvestigacao) {
  return chamar("/api/v1/investigacoes", "POST", dados, CAMPOS_CRIACAO, (json) => {
    const slug = (json as { slug?: unknown } | null)?.slug;
    return texto(slug) ? { slug } : null;
  });
}
