// Página ativa de um link de navegação. Compara por segmento de caminho: "/criar" fica ativo
// em "/criar" e em "/criar/..." , mas não em "/criar-conta" nem em "/criadores".
export function isRotaAtiva(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
