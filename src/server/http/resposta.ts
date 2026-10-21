import { randomUUID } from "node:crypto";

import { ErroApi, MENSAGEM_PADRAO } from "./erros";

const CABECALHOS_JSON = { "Content-Type": "application/json; charset=utf-8" } as const;

export function gerarIdRequisicao(): string {
  return `req_${randomUUID()}`;
}

export function json(corpo: unknown, status = 200, cabecalhos: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CABECALHOS_JSON, ...cabecalhos } });
}

export function criado(corpo: unknown, location: string): Response {
  return json(corpo, 201, { Location: location });
}

export function semConteudo(): Response {
  return new Response(null, { status: 204 });
}

export type RegistrarErro = (registro: { idRequisicao: string; nome: string; mensagem: string }) => void;

// Provisório até existir a tarefa de logs estruturados. Registra só nome e mensagem, nunca o corpo da
// requisição, e o texto do erro original jamais vai na resposta.
const registrarNoConsole: RegistrarErro = (registro) => console.error(JSON.stringify({ nivel: "erro", ...registro }));

// Formato único de erro da API: { erro: { codigo, mensagem, campos?, idRequisicao } }.
export function erroParaResposta(
  erro: unknown,
  idRequisicao: string,
  registrar: RegistrarErro = registrarNoConsole,
): Response {
  const conhecido = erro instanceof ErroApi;
  if (!conhecido) {
    registrar({
      idRequisicao,
      nome: erro instanceof Error ? erro.name : "ErroDesconhecido",
      mensagem: erro instanceof Error ? erro.message : String(erro),
    });
  }

  const api = conhecido ? erro : new ErroApi("erro_interno");
  const cabecalhos: Record<string, string> = { "X-Request-Id": idRequisicao };
  if (api.codigo === "limite_excedido" && api.retryAfter !== undefined) {
    cabecalhos["Retry-After"] = String(Math.max(1, Math.ceil(api.retryAfter)));
  }

  const corpo: { erro: { codigo: string; mensagem: string; campos?: Record<string, string>; idRequisicao: string } } = {
    erro: {
      codigo: api.codigo,
      mensagem: api.message || MENSAGEM_PADRAO[api.codigo],
      idRequisicao,
    },
  };
  if (api.campos && Object.keys(api.campos).length > 0) corpo.erro.campos = api.campos;
  return json(corpo, api.status, cabecalhos);
}

type Manipulador<Contexto> = (requisicao: Request, contexto: Contexto, idRequisicao: string) => Promise<Response> | Response;

// Envolve um Route Handler: gera o id da requisição, devolve o erro no formato padrão e acrescenta
// X-Request-Id a toda resposta.
export function envolver<Contexto = unknown>(
  manipulador: Manipulador<Contexto>,
  registrar?: RegistrarErro,
): (requisicao: Request, contexto: Contexto) => Promise<Response> {
  return async (requisicao, contexto) => {
    const idRequisicao = gerarIdRequisicao();
    try {
      const resposta = await manipulador(requisicao, contexto, idRequisicao);
      if (!resposta.headers.has("X-Request-Id")) resposta.headers.set("X-Request-Id", idRequisicao);
      return resposta;
    } catch (erro) {
      return erroParaResposta(erro, idRequisicao, registrar);
    }
  };
}
