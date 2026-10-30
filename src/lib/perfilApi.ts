// Edição do próprio perfil pela API real (PATCH /api/v1/me/perfil). Nenhum sucesso é simulado: só há
// sucesso quando o servidor confirma e devolve os dados gravados.
import { interpretarErro, type ResultadoAutenticacao } from "./autenticacaoApi";

export interface PerfilEditado {
  nome: string;
  bio: string;
  // URL das imagens enviadas (Vercel Blob) ou null quando não há.
  avatar: string | null;
  banner: string | null;
}

export type ResultadoEdicaoPerfil =
  | { ok: true; perfil: PerfilEditado }
  | { ok: false; erroGeral?: string; campos: Record<string, string>; semSessao: boolean };

const MENSAGEM_INDISPONIVEL = "Não foi possível concluir agora. Verifique sua conexão e tente novamente.";

export async function editarPerfilNaApi(dados: PerfilEditado): Promise<ResultadoEdicaoPerfil> {
  try {
    const resposta = await fetch("/api/v1/me/perfil", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Requested-With": "archives-vi" },
      body: JSON.stringify(dados),
    });
    const corpo = await resposta.json().catch(() => null);
    if (resposta.ok) {
      const u = (corpo as { usuario?: { nome?: unknown; bio?: unknown; avatar?: unknown; banner?: unknown } } | null)?.usuario;
      if (typeof u?.nome === "string" && typeof u.bio === "string") {
        return {
          ok: true,
          perfil: { nome: u.nome, bio: u.bio, avatar: typeof u.avatar === "string" ? u.avatar : null, banner: typeof u.banner === "string" ? u.banner : null },
        };
      }
      return { ok: false, campos: {}, erroGeral: MENSAGEM_INDISPONIVEL, semSessao: false };
    }
    const erro = interpretarErro(resposta.status, corpo, resposta.headers.get("Retry-After"), ["nome", "bio", "avatar", "banner"]) as Exclude<ResultadoAutenticacao, { ok: true }>;
    return { ok: false, campos: erro.campos, erroGeral: erro.erroGeral, semSessao: resposta.status === 401 };
  } catch {
    return { ok: false, campos: {}, erroGeral: MENSAGEM_INDISPONIVEL, semSessao: false };
  }
}
