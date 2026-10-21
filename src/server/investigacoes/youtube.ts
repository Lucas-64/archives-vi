// Mesma regra de reconhecimento de links do front (src/lib/youtube.ts), copiada para o servidor: o backend
// não importa código do front. Só aceita links do YouTube com um identificador de vídeo válido. Não acessa a rede.
const PADRAO_ID = /^[A-Za-z0-9_-]{11}$/;

export function extrairIdYoutube(url?: string): string | undefined {
  if (!url) return undefined;

  let destino: URL;
  try {
    destino = new URL(url.trim());
  } catch {
    return undefined;
  }
  if (destino.protocol !== "https:" && destino.protocol !== "http:") return undefined;

  const host = destino.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = destino.pathname.slice(1).split("/")[0] ?? null;
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const partes = destino.pathname.split("/").filter(Boolean);
    if (destino.pathname === "/watch") {
      id = destino.searchParams.get("v");
    } else if (["embed", "shorts", "live"].includes(partes[0] ?? "")) {
      id = partes[1] ?? null;
    }
  }

  return id && PADRAO_ID.test(id) ? id : undefined;
}
