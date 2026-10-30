// Destino interno seguro para voltar depois do login (`/entrar?voltar=/caminho`). Só aceita caminho do próprio site:
// começa com uma barra, não com duas (URL "protocol-relative"), sem barra invertida, sem esquema e só com caracteres
// de caminho. Qualquer outra coisa vira o padrão. Evita redirecionamento aberto.
const CAMINHO_INTERNO = /^\/(?!\/)[A-Za-z0-9\-._~/%?=&+#]*$/;

export function destinoInternoSeguro(valor: string | string[] | null | undefined, padrao = "/"): string {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  if (typeof texto !== "string" || texto.length === 0 || texto.length > 300) return padrao;
  if (!CAMINHO_INTERNO.test(texto)) return padrao;
  return texto;
}
