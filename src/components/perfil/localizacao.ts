// Sincronização do perfil com a URL no cliente (ADR-017). Usado pelas abas e pelo filtro de temas.
// A página é estática: o servidor não lê a URL. O cliente lê window.location.search e reage a
// voltar/avançar (popstate) e às trocas feitas aqui (EVENTO_LOCALIZACAO, porque pushState não emite popstate).

export const EVENTO_LOCALIZACAO = "perfil:localizacao";

export function assinarLocalizacao(aoMudar: () => void) {
  window.addEventListener("popstate", aoMudar);
  window.addEventListener(EVENTO_LOCALIZACAO, aoMudar);
  return () => {
    window.removeEventListener("popstate", aoMudar);
    window.removeEventListener(EVENTO_LOCALIZACAO, aoMudar);
  };
}

export function lerBuscaNoNavegador() {
  return window.location.search;
}

// Na geração estática e na hidratação, não há URL no servidor. O cliente corrige logo em seguida.
export function lerBuscaNoServidor() {
  return "";
}

// Define (ou remove, sem valor) um parâmetro da URL, mantendo os demais. Não empilha entrada repetida.
export function definirParametroDaUrl(nome: string, valor?: string) {
  const destino = new URL(window.location.href);

  if (valor) {
    destino.searchParams.set(nome, valor);
  } else {
    destino.searchParams.delete(nome);
  }

  if (destino.href === window.location.href) return;

  window.history.pushState(null, "", destino.href);
  window.dispatchEvent(new Event(EVENTO_LOCALIZACAO));
}
