import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao } from "../auth/guarda";
import { esquemaCriarMisterio, esquemaCursorMisterios, esquemaListarMisterios } from "../contracts/misterios";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validarQuery } from "../http/validar";
import { criarMisterio, listarMisterios, obterMisterio, type DependenciasMisterios } from "../servicos/misterios";

const LIMITE_CORPO_BYTES = 10_000;

export interface OpcoesRotasMisterios {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

interface ContextoSlug {
  params: Promise<{ slug: string }>;
}

async function lerSlug(contexto: ContextoSlug): Promise<string> {
  const resultado = esquemaSlug.safeParse((await contexto.params).slug);
  if (!resultado.success) throw new ErroApi("nao_encontrado", "Mistério não encontrado.");
  return resultado.data;
}

export function criarManipuladoresMisterios(opcoes: OpcoesRotasMisterios = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const deps = (): DependenciasMisterios => ({ db: (opcoes.obterDb ?? obterDb)(), agora });
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };

  return {
    listar: envolver(async (requisicao) => {
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarMisterios, url);
      const { limite, cursor } = lerPaginacao(url);
      const pagina = await listarMisterios(deps(), filtros, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorMisterios) : undefined,
      });
      return semCache(json(pagina));
    }),

    detalhe: envolver(async (_requisicao, contexto: ContextoSlug) => semCache(json(await obterMisterio(deps(), await lerSlug(contexto))))),

    // Mutação: origem confiável e sessão antes de ler o corpo.
    criar: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      const dependencias = deps();
      const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
      const entrada = await lerCorpo(requisicao, esquemaCriarMisterio, { limiteBytes: LIMITE_CORPO_BYTES });
      const criado = await criarMisterio(dependencias, sessao.usuario, entrada);
      const resposta = semCache(json(criado, 201));
      resposta.headers.set("Location", `/api/v1/misterios/${criado.slug}`);
      return resposta;
    }),
  };
}
