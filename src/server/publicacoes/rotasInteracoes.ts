import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao } from "../auth/guarda";
import { esquemaCriarComentario, esquemaCursorComentarios, esquemaListarComentarios } from "../contracts/interacoes";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validarQuery } from "../http/validar";
import { criarComentario, curtir, descurtir, listarComentarios } from "../servicos/interacoes";

const LIMITE_CORPO_BYTES = 8_000;

export interface OpcoesRotasInteracoes {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

interface ContextoSlug {
  params: Promise<{ slug: string }>;
}

export function criarManipuladoresInteracoes(opcoes: OpcoesRotasInteracoes = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const deps = () => ({ db: (opcoes.obterDb ?? obterDb)(), agora });
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };

  async function slugDaCurtida(contexto: ContextoSlug): Promise<string> {
    const resultado = esquemaSlug.safeParse((await contexto.params).slug);
    if (!resultado.success) throw new ErroApi("nao_encontrado", "Publicação não encontrada.");
    return resultado.data;
  }

  return {
    listarComentarios: envolver(async (requisicao) => {
      const url = new URL(requisicao.url);
      const { alvo } = validarQuery(esquemaListarComentarios, url);
      const { limite, cursor } = lerPaginacao(url);
      const pagina = await listarComentarios(deps(), alvo, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorComentarios) : undefined,
      });
      return semCache(json(pagina));
    }),

    criarComentario: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      const dependencias = deps();
      const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
      const entrada = await lerCorpo(requisicao, esquemaCriarComentario, { limiteBytes: LIMITE_CORPO_BYTES });
      return semCache(json(await criarComentario(dependencias, sessao.usuario, entrada), 201));
    }),

    curtir: envolver(async (requisicao, contexto: ContextoSlug) => {
      exigirOrigemConfiavel(requisicao);
      const dependencias = deps();
      const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
      return semCache(json(await curtir(dependencias, sessao.usuario.id, await slugDaCurtida(contexto))));
    }),

    descurtir: envolver(async (requisicao, contexto: ContextoSlug) => {
      exigirOrigemConfiavel(requisicao);
      const dependencias = deps();
      const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
      return semCache(json(await descurtir(dependencias, sessao.usuario.id, await slugDaCurtida(contexto))));
    }),
  };
}
