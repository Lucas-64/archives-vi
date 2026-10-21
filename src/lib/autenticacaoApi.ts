// Chamadas de autenticação à API real e tradução das respostas de erro para a interface.
// O servidor é quem valida e autoriza; aqui só se decide o que mostrar.

export type ResultadoAutenticacao =
  | { ok: true }
  | { ok: false; erroGeral?: string; campos: Record<string, string> };

const MENSAGEM_INDISPONIVEL = "Não foi possível concluir agora. Verifique sua conexão e tente novamente.";

interface CorpoErro {
  erro?: { codigo?: string; mensagem?: string; campos?: Record<string, string> };
}

// Traduz uma resposta de erro da API. `camposDoFormulario` separa o que cabe em um campo do que é geral.
export function interpretarErro(
  status: number,
  corpo: unknown,
  retryAfter: string | null,
  camposDoFormulario: readonly string[],
): ResultadoAutenticacao {
  const erro = (corpo as CorpoErro | null)?.erro;
  const campos: Record<string, string> = {};
  const gerais: string[] = [];
  for (const [chave, mensagem] of Object.entries(erro?.campos ?? {})) {
    if (typeof mensagem !== "string") continue;
    if (camposDoFormulario.includes(chave)) campos[chave] = mensagem;
    else gerais.push(mensagem);
  }

  if (status === 429) {
    const segundos = Number(retryAfter);
    const espera = Number.isFinite(segundos) && segundos > 0 ? ` Tente novamente em ${Math.ceil(segundos)} segundos.` : " Tente novamente em instantes.";
    return { ok: false, campos: {}, erroGeral: `Muitas tentativas.${espera}` };
  }
  if (status >= 500 || !erro?.mensagem) return { ok: false, campos, erroGeral: MENSAGEM_INDISPONIVEL };

  // Erros com campos (422, 409 por usuário) aparecem no campo; os demais, como mensagem geral.
  if (Object.keys(campos).length > 0 && gerais.length === 0) return { ok: false, campos };
  return { ok: false, campos, erroGeral: gerais[0] ?? erro.mensagem };
}

async function enviar(caminho: string, corpo: unknown, campos: readonly string[]): Promise<ResultadoAutenticacao> {
  try {
    const resposta = await fetch(caminho, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Requested-With": "archives-vi" },
      body: JSON.stringify(corpo),
    });
    if (resposta.ok) return { ok: true };
    const json = await resposta.json().catch(() => null);
    return interpretarErro(resposta.status, json, resposta.headers.get("Retry-After"), campos);
  } catch {
    return { ok: false, campos: {}, erroGeral: MENSAGEM_INDISPONIVEL };
  }
}

export const entrarNaApi = (dados: { email: string; senha: string }) => enviar("/api/v1/auth/entrar", dados, ["email", "senha"]);

export const cadastrarNaApi = (dados: { usuario: string; email: string; senha: string }) =>
  enviar("/api/v1/auth/cadastro", dados, ["usuario", "email", "senha"]);

export async function sairDaApi(): Promise<boolean> {
  try {
    const resposta = await fetch("/api/v1/auth/sair", {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-Requested-With": "archives-vi" },
    });
    return resposta.ok;
  } catch {
    return false;
  }
}
