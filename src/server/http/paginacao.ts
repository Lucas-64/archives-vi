import { z } from "zod";

import { ErroApi } from "./erros";
import { validar } from "./validar";

export const LIMITE_PADRAO = 20;
export const LIMITE_MAXIMO = 50;

const esquemaPaginacao = z.object({
  limite: z.coerce
    .number({ error: "Informe um número para o limite." })
    .int("O limite precisa ser um número inteiro.")
    .min(1, "O limite mínimo é 1.")
    .max(LIMITE_MAXIMO, `O limite máximo é ${LIMITE_MAXIMO}.`)
    .default(LIMITE_PADRAO),
  cursor: z.string().min(1, "O cursor não pode ser vazio.").max(512, "Cursor inválido.").optional(),
});

export interface Paginacao {
  limite: number;
  cursor?: string;
}

// ?limite=20&cursor=... Valor acima do máximo é rejeitado (422), não truncado em silêncio.
export function lerPaginacao(url: URL | string): Paginacao {
  const endereco = typeof url === "string" ? new URL(url) : url;
  const entrada: Record<string, string> = {};
  for (const chave of ["limite", "cursor"]) {
    const valor = endereco.searchParams.get(chave);
    if (valor !== null) entrada[chave] = valor;
  }
  return validar(esquemaPaginacao, entrada);
}

// O cursor é opaco para o cliente: JSON em base64url. Não é segurança (qualquer um decodifica), então
// nunca coloque nele nada que o cliente não possa ver, e valide o formato ao ler.
export function codificarCursor(valor: unknown): string {
  return Buffer.from(JSON.stringify(valor), "utf8").toString("base64url");
}

export function decodificarCursor<S extends z.ZodType>(cursor: string, esquema: S): z.output<S> {
  let bruto: unknown;
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error("alfabeto");
    bruto = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new ErroApi("requisicao_invalida", "Cursor inválido.");
  }
  const resultado = esquema.safeParse(bruto);
  if (!resultado.success) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
  return resultado.data;
}

export interface Pagina<T> {
  itens: T[];
  proximoCursor: string | null;
}

export function paginar<T>(itens: T[], proximoCursor: string | null): Pagina<T> {
  return { itens, proximoCursor };
}

// Para consultas que buscam `limite + 1` linhas: se sobrou uma, há próxima página e o cursor sai da
// última linha devolvida.
export function fatiarPagina<T>(linhas: T[], limite: number, cursorDe: (ultima: T) => unknown): Pagina<T> {
  if (linhas.length <= limite) return paginar(linhas, null);
  const itens = linhas.slice(0, limite);
  return paginar(itens, codificarCursor(cursorDe(itens[itens.length - 1])));
}
