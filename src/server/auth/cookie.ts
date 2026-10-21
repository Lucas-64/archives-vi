// Cookie de sessão. Em produção usa o prefixo __Host- (exige Secure, Path=/ e nenhum Domain); em
// desenvolvimento o nome é "sessao" e o cookie não é Secure, porque o ambiente local roda em http.
export interface ConfiguracaoCookie {
  nome: string;
  seguro: boolean;
}

export function configuracaoCookie(producao: boolean): ConfiguracaoCookie {
  return producao ? { nome: "__Host-sessao", seguro: true } : { nome: "sessao", seguro: false };
}

function atributos(config: ConfiguracaoCookie, extras: string[]): string {
  const base = ["Path=/", "HttpOnly", "SameSite=Lax", ...extras];
  if (config.seguro) base.push("Secure");
  return base.join("; ");
}

// Expiração explícita (Max-Age e Expires), igual ao limite absoluto da sessão.
export function cookieDeSessao(config: ConfiguracaoCookie, token: string, expiraEm: Date, agora: Date): string {
  const segundos = Math.max(0, Math.floor((expiraEm.getTime() - agora.getTime()) / 1000));
  return `${config.nome}=${token}; ${atributos(config, [`Max-Age=${segundos}`, `Expires=${expiraEm.toUTCString()}`])}`;
}

export function cookieApagado(config: ConfiguracaoCookie): string {
  return `${config.nome}=; ${atributos(config, ["Max-Age=0", "Expires=Thu, 01 Jan 1970 00:00:00 GMT"])}`;
}

export function lerTokenDoCookie(cabecalho: string | null, config: ConfiguracaoCookie): string | null {
  if (!cabecalho) return null;
  for (const par of cabecalho.split(";")) {
    const indice = par.indexOf("=");
    if (indice === -1) continue;
    if (par.slice(0, indice).trim() === config.nome) return par.slice(indice + 1).trim() || null;
  }
  return null;
}
