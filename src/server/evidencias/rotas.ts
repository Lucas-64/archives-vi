import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao } from "../auth/guarda";
import {
  esquemaCriarEvidencia,
  esquemaCursorEvidencias,
  esquemaListarSugestoes,
  esquemaRecusarSugestao,
} from "../contracts/evidencias";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validar, validarQuery } from "../http/validar";
import {
  criarEvidencia,
  decidirSugestao,
  listarEvidencias,
  listarSugestoes,
  listarSugestoesDoMembro,
  type DependenciasEvidencias,
} from "../servicos/evidencias";

const LIMITE_CORPO_BYTES = 8_000;

export interface OpcoesRotasEvidencias {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

interface ContextoSlug {
  params: Promise<{ slug: string }>;
}
interface ContextoSugestao {
  params: Promise<{ slug: string; id: string }>;
}

async function lerSlug(parametros: Promise<{ slug: string }>): Promise<string> {
  const resultado = esquemaSlug.safeParse((await parametros).slug);
  if (!resultado.success) throw new ErroApi("nao_encontrado", "Investigação não encontrada.");
  return resultado.data;
}

export function criarManipuladoresEvidencias(opcoes: OpcoesRotasEvidencias = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const deps = (): DependenciasEvidencias => ({ db: (opcoes.obterDb ?? obterDb)(), agora });
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };
  // Sessão antes de qualquer leitura de corpo; o papel vem do banco (validação da sessão).
  const autenticar = async (requisicao: Request, mutacao: boolean) => {
    if (mutacao) exigirOrigemConfiavel(requisicao);
    const dependencias = deps();
    const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
    return { dependencias, usuario: sessao.usuario };
  };
  const cursorDe = (url: URL) => {
    const { limite, cursor } = lerPaginacao(url);
    return { limite, cursor: cursor ? decodificarCursor(cursor, esquemaCursorEvidencias) : undefined };
  };

  return {
    listar: envolver(async (requisicao, contexto: ContextoSlug) => {
      const slug = await lerSlug(contexto.params);
      return semCache(json(await listarEvidencias(deps(), slug, cursorDe(new URL(requisicao.url)))));
    }),

    criar: envolver(async (requisicao, contexto: ContextoSlug) => {
      const { dependencias, usuario } = await autenticar(requisicao, true);
      const slug = await lerSlug(contexto.params);
      const entrada = await lerCorpo(requisicao, esquemaCriarEvidencia, { limiteBytes: LIMITE_CORPO_BYTES });
      return semCache(json(await criarEvidencia(dependencias, usuario, slug, entrada), 201));
    }),

    listarSugestoes: envolver(async (requisicao, contexto: ContextoSlug) => {
      const { dependencias, usuario } = await autenticar(requisicao, false);
      const slug = await lerSlug(contexto.params);
      const url = new URL(requisicao.url);
      const filtro = validarQuery(esquemaListarSugestoes, url);
      return semCache(json(await listarSugestoes(dependencias, usuario, slug, filtro, cursorDe(url))));
    }),

    aceitar: envolver(async (requisicao, contexto: ContextoSugestao) => {
      const { dependencias, usuario } = await autenticar(requisicao, true);
      const { id } = await contexto.params;
      return semCache(json(await decidirSugestao(dependencias, usuario, await lerSlug(contexto.params), id, "aceita")));
    }),

    recusar: envolver(async (requisicao, contexto: ContextoSugestao) => {
      const { dependencias, usuario } = await autenticar(requisicao, true);
      const { id } = await contexto.params;
      const slug = await lerSlug(contexto.params);
      // O motivo é opcional: sem corpo, vale `{}`.
      const { motivo } =
        requisicao.body === null
          ? validar(esquemaRecusarSugestao, {})
          : await lerCorpo(requisicao, esquemaRecusarSugestao, { limiteBytes: LIMITE_CORPO_BYTES });
      return semCache(json(await decidirSugestao(dependencias, usuario, slug, id, "recusada", motivo)));
    }),

    // Sugestões do próprio membro. A identidade é só a da sessão: não há parâmetro de usuário.
    minhasSugestoes: envolver(async (requisicao) => {
      const { dependencias, usuario } = await autenticar(requisicao, false);
      const url = new URL(requisicao.url);
      const filtro = validarQuery(esquemaListarSugestoes, url);
      return semCache(json(await listarSugestoesDoMembro(dependencias, usuario, filtro, cursorDe(url))));
    }),
  };
}
