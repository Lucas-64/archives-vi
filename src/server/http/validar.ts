import { z } from "zod";

import { ErroApi } from "./erros";

// Mensagens padrão do Zod em português do Brasil. Esquemas de domínio devem trazer mensagens próprias
// para os campos principais; isto é a rede de segurança para o restante.
const mensagensZod = z.locales.ptBR().localeError;

export const LIMITE_PADRAO_CORPO_BYTES = 100_000;

function juntarCaminho(caminho: ReadonlyArray<PropertyKey>): string {
  return caminho.map(String).join(".");
}

// Converte os problemas do Zod em { campo: mensagem }, uma mensagem por campo (a primeira). Problemas na
// raiz usam a chave "_". Chaves não permitidas em esquemas strict() viram um campo cada.
export function camposDoErro(erro: z.ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const problema of erro.issues) {
    if (problema.code === "unrecognized_keys") {
      for (const chave of problema.keys) {
        campos[juntarCaminho([...problema.path, chave])] ??= "Campo não permitido.";
      }
      continue;
    }
    campos[juntarCaminho(problema.path) || "_"] ??= problema.message;
  }
  return campos;
}

// Valida `dados` com o esquema. Falha com ErroApi("validacao") e a lista de campos.
export function validar<S extends z.ZodType>(esquema: S, dados: unknown): z.output<S> {
  const resultado = esquema.safeParse(dados, { error: mensagensZod });
  if (!resultado.success) {
    throw new ErroApi("validacao", undefined, { campos: camposDoErro(resultado.error) });
  }
  return resultado.data;
}

export function validarQuery<S extends z.ZodType>(esquema: S, url: URL | string): z.output<S> {
  const endereco = typeof url === "string" ? new URL(url) : url;
  return validar(esquema, Object.fromEntries(endereco.searchParams));
}

// Lê o corpo em partes e interrompe ao passar do limite; não confia em Content-Length.
async function lerCorpoLimitado(requisicao: Request, limiteBytes: number): Promise<string> {
  const declarado = Number(requisicao.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > limiteBytes) throw new ErroApi("corpo_grande");
  if (!requisicao.body) return "";

  const leitor = requisicao.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    total += value.byteLength;
    if (total > limiteBytes) {
      await leitor.cancel();
      throw new ErroApi("corpo_grande");
    }
    partes.push(value);
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(partes));
}

export async function lerJson(
  requisicao: Request,
  opcoes: { limiteBytes?: number } = {},
): Promise<unknown> {
  const tipo = requisicao.headers.get("content-type") ?? "";
  if (!/^application\/json\s*(;|$)/i.test(tipo)) {
    throw new ErroApi("tipo_nao_suportado", "Envie o corpo como application/json.");
  }

  let texto: string;
  try {
    texto = await lerCorpoLimitado(requisicao, opcoes.limiteBytes ?? LIMITE_PADRAO_CORPO_BYTES);
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;
    throw new ErroApi("requisicao_invalida", "O corpo da requisição não é um texto UTF-8 válido.");
  }
  if (texto.trim() === "") throw new ErroApi("requisicao_invalida", "O corpo da requisição está vazio.");

  try {
    return JSON.parse(texto);
  } catch {
    throw new ErroApi("requisicao_invalida", "O corpo da requisição não é um JSON válido.");
  }
}

// Lê o JSON do corpo e valida com o esquema.
export async function lerCorpo<S extends z.ZodType>(
  requisicao: Request,
  esquema: S,
  opcoes: { limiteBytes?: number } = {},
): Promise<z.output<S>> {
  return validar(esquema, await lerJson(requisicao, opcoes));
}
