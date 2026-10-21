export const RESUMO_MAXIMO = 200;

// Resumo derivado do corpo: espaços normalizados; se passar de 200 caracteres, corta na última palavra
// inteira (se houver espaço na segunda metade) e acrescenta "…". Nunca passa de 200.
export function resumoDoCorpo(corpo: string): string {
  const texto = corpo.replace(/\s+/g, " ").trim();
  if (texto.length <= RESUMO_MAXIMO) return texto;

  const corte = texto.slice(0, RESUMO_MAXIMO - 1);
  const ultimoEspaco = corte.lastIndexOf(" ");
  const base = ultimoEspaco >= RESUMO_MAXIMO / 2 ? corte.slice(0, ultimoEspaco) : corte;
  return `${base.trimEnd()}…`;
}
