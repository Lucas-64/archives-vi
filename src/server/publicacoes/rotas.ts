import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao, sessaoDaRequisicao } from "../auth/guarda";
import {
  esquemaCriarPublicacao,
  esquemaCursorPublicacoes,
  esquemaListarPublicacoes,
  esquemaRelacionadas,
  esquemaSlug,
} from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validarQuery } from "../http/validar";
import {
  criarPublicacao,
  listarPublicacoes,
  listarRelacionadas,
  obterPublicacao,
  type DependenciasPublicacoes,
} from "../servicos/publicacoes";

const LIMITE_CORPO_BYTES = 20_000;

export interface OpcoesRotasPublicacoes {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

interface ContextoSlug {
  params: Promise<{ slug: string }>;
}

// Slug fora do formato nunca existe: 404, sem consultar o banco.
async function lerSlug(contexto: ContextoSlug): Promise<string> {
  const { slug } = await contexto.params;
  const resultado = esquemaSlug.safeParse(slug);
  if (!resultado.success) throw new ErroApi("nao_encontrado", "Publicação não encontrada.");
  return resultado.data;
}

export function criarManipuladoresPublicacoes(opcoes: OpcoesRotasPublicacoes = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const deps = (): DependenciasPublicacoes => ({ db: (opcoes.obterDb ?? obterDb)(), agora });
  // Leitura pública com sessão opcional: só serve para `euCurti`. Visitante (ou cookie inválido) lê normalmente.
  const depsDeLeitura = async (requisicao: Request): Promise<DependenciasPublicacoes> => {
    const dependencias = deps();
    const sessao = await sessaoDaRequisicao(dependencias.db, requisicao, cookie, agora());
    return { ...dependencias, visitanteId: sessao?.usuario.id };
  };
  // Conteúdo público, mas a política de cache fica para a integração (decisão D8): por ora, sem cache.
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };

  return {
    listar: envolver(async (requisicao) => {
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarPublicacoes, url);
      const { limite, cursor } = lerPaginacao(url);
      const pagina = await listarPublicacoes(await depsDeLeitura(requisicao), filtros, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorPublicacoes) : undefined,
      });
      return semCache(json(pagina));
    }),

    detalhe: envolver(async (requisicao, contexto: ContextoSlug) => {
      const publicacao = await obterPublicacao(await depsDeLeitura(requisicao), await lerSlug(contexto));
      return semCache(json(publicacao));
    }),

    relacionadas: envolver(async (requisicao, contexto: ContextoSlug) => {
      const slug = await lerSlug(contexto);
      const { limite } = validarQuery(esquemaRelacionadas, new URL(requisicao.url));
      return semCache(json(await listarRelacionadas(await depsDeLeitura(requisicao), slug, limite)));
    }),

    criar: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      const dependencias = deps();
      // Autenticação antes de ler o corpo: visitante recebe 401 sem que o servidor processe o conteúdo.
      const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
      const entrada = await lerCorpo(requisicao, esquemaCriarPublicacao, { limiteBytes: LIMITE_CORPO_BYTES });
      const criada = await criarPublicacao(dependencias, sessao.usuario, entrada);
      const resposta = semCache(json(criada, 201));
      resposta.headers.set("Location", `/api/v1/publicacoes/${criada.slug}`);
      return resposta;
    }),
  };
}
