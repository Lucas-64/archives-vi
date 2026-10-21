import { esquemaCadastro, esquemaEntrar } from "../contracts/auth";
import { obterDb } from "../db/cliente";
import type { Banco } from "../db/cliente";
import { envolver, json } from "../http/resposta";
import { lerCorpo } from "../http/validar";
import { cadastrar, entrar, paraUsuarioPrivado, sair, type DependenciasAuth } from "../servicos/auth";
import { configuracaoCookie, cookieApagado, cookieDeSessao, lerTokenDoCookie } from "./cookie";
import { exigirOrigemConfiavel, sessaoDaRequisicao } from "./guarda";
import { ipDaRequisicao } from "./limiteTaxa";
import { PARAMETROS_PADRAO, type ParametrosScrypt } from "./senha";

const LIMITE_CORPO_AUTH_BYTES = 10_000;

export interface OpcoesRotasAuth {
  obterDb?: () => Banco;
  agora?: () => Date;
  parametrosSenha?: ParametrosScrypt;
  producao?: boolean;
}

// Manipuladores de /api/v1/auth/*. As dependências são injetáveis para os testes usarem um banco
// descartável e relógio controlado; os arquivos route.ts usam os padrões.
export function criarManipuladoresAuth(opcoes: OpcoesRotasAuth = {}) {
  const producao = opcoes.producao ?? process.env.NODE_ENV === "production";
  const cookie = configuracaoCookie(producao);
  const agora = opcoes.agora ?? (() => new Date());
  const dependencias = (): DependenciasAuth => ({
    db: (opcoes.obterDb ?? obterDb)(),
    agora,
    parametrosSenha: opcoes.parametrosSenha ?? PARAMETROS_PADRAO,
  });
  const contexto = (requisicao: Request) => ({
    ip: ipDaRequisicao(requisicao),
    agente: requisicao.headers.get("user-agent"),
  });

  // Respostas de autenticação nunca devem ser guardadas em cache.
  function semCache(resposta: Response): Response {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  }

  const comSessao = (resultado: Awaited<ReturnType<typeof cadastrar>>, status: number) => {
    const resposta = semCache(json({ usuario: resultado.usuario }, status));
    resposta.headers.append(
      "Set-Cookie",
      cookieDeSessao(cookie, resultado.sessao.token, resultado.sessao.expiraAbsolutaEm, agora()),
    );
    return resposta;
  };

  return {
    cadastro: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      const entrada = await lerCorpo(requisicao, esquemaCadastro, { limiteBytes: LIMITE_CORPO_AUTH_BYTES });
      const resposta = comSessao(await cadastrar(dependencias(), entrada, contexto(requisicao)), 201);
      resposta.headers.set("Location", "/api/v1/auth/eu");
      return resposta;
    }),

    entrar: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      const entrada = await lerCorpo(requisicao, esquemaEntrar, { limiteBytes: LIMITE_CORPO_AUTH_BYTES });
      return comSessao(await entrar(dependencias(), entrada, contexto(requisicao)), 200);
    }),

    // Idempotente: sair sem sessão também responde 204 e apaga o cookie.
    sair: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      await sair(dependencias(), lerTokenDoCookie(requisicao.headers.get("cookie"), cookie));
      const resposta = semCache(new Response(null, { status: 204 }));
      resposta.headers.append("Set-Cookie", cookieApagado(cookie));
      return resposta;
    }),

    // Visitante recebe 200 com usuario: null (não 401).
    eu: envolver(async (requisicao) => {
      const sessao = await sessaoDaRequisicao(dependencias().db, requisicao, cookie, agora());
      const resposta = semCache(json({ usuario: sessao ? paraUsuarioPrivado(sessao.usuario) : null }));
      if (!sessao && lerTokenDoCookie(requisicao.headers.get("cookie"), cookie)) {
        resposta.headers.append("Set-Cookie", cookieApagado(cookie));
      }
      return resposta;
    }),
  };
}
