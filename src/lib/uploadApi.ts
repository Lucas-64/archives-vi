// Envio de imagens pelo navegador para `POST /api/v1/uploads/imagem` (ADR-043). A validação local é só conveniência
// (o servidor confere o conteúdo, o tamanho e a sessão). Nenhum sucesso é simulado: só há URL depois do 201.
export const TIPOS_IMAGEM_ACEITOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024;

export const MENSAGEM_ARMAZENAMENTO_INDISPONIVEL = "Envio de imagens indisponível no momento.";
const MENSAGEM_REDE = "Não foi possível enviar a imagem agora. Verifique sua conexão e tente novamente.";

export type ResultadoUpload = { ok: true; url: string } | { ok: false; erro: string; semSessao?: boolean; indisponivel?: boolean };

// Mensagem de erro para um arquivo recusado antes do envio, ou undefined se ele pode ser enviado.
export function validarArquivoDeImagem(arquivo: { type: string; size: number }): string | undefined {
  if (!(TIPOS_IMAGEM_ACEITOS as readonly string[]).includes(arquivo.type)) return "Use uma imagem JPEG, PNG ou WebP.";
  if (arquivo.size === 0) return "O arquivo está vazio.";
  if (arquivo.size > LIMITE_IMAGEM_BYTES) return "A imagem pode ter no máximo 5 MB.";
  return undefined;
}

export async function armazenamentoDeImagensDisponivel(): Promise<boolean> {
  try {
    const resposta = await fetch("/api/v1/uploads/imagem", { credentials: "same-origin" });
    if (!resposta.ok) return false;
    const json = (await resposta.json().catch(() => null)) as { disponivel?: unknown } | null;
    return json?.disponivel === true;
  } catch {
    return false;
  }
}

function mensagemDoErro(json: unknown, padrao: string): string {
  const erro = (json as { erro?: { mensagem?: unknown; campos?: Record<string, unknown> } } | null)?.erro;
  const campo = erro?.campos?.arquivo;
  if (typeof campo === "string") return campo;
  return typeof erro?.mensagem === "string" ? erro.mensagem : padrao;
}

export async function enviarImagemNaApi(arquivo: File): Promise<ResultadoUpload> {
  const antes = validarArquivoDeImagem(arquivo);
  if (antes) return { ok: false, erro: antes };

  const corpo = new FormData();
  corpo.set("arquivo", arquivo);
  try {
    const resposta = await fetch("/api/v1/uploads/imagem", {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-Requested-With": "archives-vi" },
      body: corpo,
    });
    const json = await resposta.json().catch(() => null);
    if (resposta.status === 201) {
      const url = (json as { url?: unknown } | null)?.url;
      if (typeof url === "string" && url !== "") return { ok: true, url };
      return { ok: false, erro: MENSAGEM_REDE };
    }
    if (resposta.status === 401) return { ok: false, erro: "Sua sessão expirou. Entre novamente para enviar a imagem.", semSessao: true };
    if (resposta.status === 503) return { ok: false, erro: MENSAGEM_ARMAZENAMENTO_INDISPONIVEL, indisponivel: true };
    return { ok: false, erro: mensagemDoErro(json, MENSAGEM_REDE) };
  } catch {
    return { ok: false, erro: MENSAGEM_REDE };
  }
}
