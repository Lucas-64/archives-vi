// Endereço de imagem aceito nos campos de imagem (capa, evidência, avatar, banner, publicação). Só vale a URL pública
// devolvida pelo envio ao Vercel Blob (`POST /api/v1/uploads/imagem`): https, host do Blob e caminho dentro de
// `imagens/`. URLs https livres NÃO são aceitas como substitutas do envio (ADR-043). Pura: usada no navegador (para
// avisar cedo) e no servidor (que decide).
export const SUFIXO_HOST_BLOB = ".public.blob.vercel-storage.com";
export const PREFIXO_CAMINHO_IMAGEM = "/imagens/";
export const LIMITE_URL_IMAGEM = 400;

export function urlDeImagemPermitida(valor: string): boolean {
  try {
    const url = new URL(valor);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.hostname.endsWith(SUFIXO_HOST_BLOB) &&
      url.hostname.length > SUFIXO_HOST_BLOB.length &&
      url.pathname.startsWith(PREFIXO_CAMINHO_IMAGEM) &&
      url.pathname.length > PREFIXO_CAMINHO_IMAGEM.length
    );
  } catch {
    return false;
  }
}
