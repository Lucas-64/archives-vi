// Operações de publicações, comentários e curtidas pela API real, no navegador. Nenhum sucesso é simulado:
// só há sucesso quando o servidor confirma e devolve os dados gravados. O servidor valida e autoriza.
import { interpretarErro } from "./autenticacaoApi";

export const MENSAGEM_INDISPONIVEL = "Não foi possível concluir agora. Verifique sua conexão e tente novamente.";

export interface ComentarioApi {
  id: string;
  texto: string;
  autor: { nome: string; usuario: string };
  criadoEm: string;
}

export type Falha = { ok: false; erroGeral?: string; campos: Record<string, string>; semSessao: boolean };
export type Resultado<T> = ({ ok: true } & T) | Falha;

const CABECALHOS = { "Content-Type": "application/json", "X-Requested-With": "archives-vi" };

export async function chamar<T>(
  caminho: string,
  metodo: "GET" | "POST" | "PUT" | "DELETE",
  corpo: unknown,
  camposDoFormulario: readonly string[],
  ler: (json: unknown) => T | null,
): Promise<Resultado<T>> {
  try {
    const resposta = await fetch(caminho, {
      method: metodo,
      credentials: "same-origin",
      headers: metodo === "GET" ? undefined : CABECALHOS,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    const json = await resposta.json().catch(() => null);
    if (resposta.ok) {
      const dados = ler(json);
      if (dados) return { ok: true, ...dados };
      return { ok: false, campos: {}, erroGeral: MENSAGEM_INDISPONIVEL, semSessao: false };
    }
    const erro = interpretarErro(resposta.status, json, resposta.headers.get("Retry-After"), camposDoFormulario);
    if (erro.ok) return { ok: false, campos: {}, erroGeral: MENSAGEM_INDISPONIVEL, semSessao: false };
    return { ok: false, campos: erro.campos, erroGeral: erro.erroGeral, semSessao: resposta.status === 401 };
  } catch {
    return { ok: false, campos: {}, erroGeral: MENSAGEM_INDISPONIVEL, semSessao: false };
  }
}

export const texto = (v: unknown): v is string => typeof v === "string";

function lerComentario(v: unknown): ComentarioApi | null {
  const c = v as Partial<ComentarioApi> | null;
  if (!c || !texto(c.id) || !texto(c.texto) || !texto(c.criadoEm) || !texto(c.autor?.nome) || !texto(c.autor?.usuario)) return null;
  return { id: c.id, texto: c.texto, autor: { nome: c.autor.nome, usuario: c.autor.usuario }, criadoEm: c.criadoEm };
}

export function criarPublicacaoNaApi(dados: { titulo: string; corpo: string }) {
  return chamar("/api/v1/publicacoes", "POST", dados, ["titulo", "corpo"], (json) => {
    const slug = (json as { slug?: unknown } | null)?.slug;
    return texto(slug) ? { slug } : null;
  });
}

export function criarComentarioNaApi(slug: string, textoDoComentario: string) {
  return chamar("/api/v1/comentarios", "POST", { alvo: `publicacao:${slug}`, texto: textoDoComentario }, ["texto"], (json) => {
    const comentario = lerComentario(json);
    return comentario ? { comentario } : null;
  });
}

export function listarComentariosNaApi(slug: string, cursor: string) {
  const query = new URLSearchParams({ alvo: `publicacao:${slug}`, cursor });
  return chamar(`/api/v1/comentarios?${query}`, "GET", undefined, [], (json) => {
    const pagina = json as { itens?: unknown[]; proximoCursor?: unknown } | null;
    if (!Array.isArray(pagina?.itens)) return null;
    const comentarios = pagina.itens.map(lerComentario);
    if (comentarios.some((c) => c === null)) return null;
    return {
      comentarios: comentarios as ComentarioApi[],
      proximoCursor: texto(pagina.proximoCursor) ? pagina.proximoCursor : null,
    };
  });
}

export function alterarCurtidaNaApi(slug: string, curtir: boolean) {
  return chamar(`/api/v1/publicacoes/${encodeURIComponent(slug)}/curtida`, curtir ? "PUT" : "DELETE", undefined, [], (json) => {
    const e = json as { curtidas?: unknown; euCurti?: unknown } | null;
    return typeof e?.curtidas === "number" && typeof e.euCurti === "boolean" ? { curtidas: e.curtidas, euCurti: e.euCurti } : null;
  });
}
