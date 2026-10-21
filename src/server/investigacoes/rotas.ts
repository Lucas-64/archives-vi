import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao, sessaoDaRequisicao } from "../auth/guarda";
import {
  esquemaCriarInvestigacao,
  esquemaCursorHistorico,
  esquemaCursorInvestigacoes,
  esquemaEditarInvestigacao,
  esquemaListarInvestigacoes,
  esquemaMudarEstado,
} from "../contracts/investigacoes";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validarQuery } from "../http/validar";
import {
  criarInvestigacao,
  editarInvestigacao,
  encerrarInvestigacao,
  listarHistorico,
  listarInvestigacoes,
  mudarEstado,
  obterInvestigacao,
  type DependenciasInvestigacoes,
} from "../servicos/investigacoes";

const LIMITE_CORPO_BYTES = 30_000;

export interface OpcoesRotasInvestigacoes {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

interface ContextoSlug {
  params: Promise<{ slug: string }>;
}

async function lerSlug(contexto: ContextoSlug): Promise<string> {
  const resultado = esquemaSlug.safeParse((await contexto.params).slug);
  if (!resultado.success) throw new ErroApi("nao_encontrado", "Investigação não encontrada.");
  return resultado.data;
}

export function criarManipuladoresInvestigacoes(opcoes: OpcoesRotasInvestigacoes = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const deps = (): DependenciasInvestigacoes => ({ db: (opcoes.obterDb ?? obterDb)(), agora });
  // Leitura pública com sessão opcional: só serve para `permissoes.podeGerenciar`.
  const depsDeLeitura = async (requisicao: Request): Promise<DependenciasInvestigacoes> => {
    const dependencias = deps();
    const sessao = await sessaoDaRequisicao(dependencias.db, requisicao, cookie, agora());
    return { ...dependencias, visitanteId: sessao?.usuario.id, visitantePapel: sessao?.usuario.papel };
  };
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };
  // Mutações: origem confiável e sessão antes de ler o corpo.
  const autenticar = async (requisicao: Request) => {
    exigirOrigemConfiavel(requisicao);
    const dependencias = deps();
    const sessao = await exigirSessao(dependencias.db, requisicao, cookie, agora());
    return { dependencias, usuario: sessao.usuario };
  };

  return {
    listar: envolver(async (requisicao) => {
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarInvestigacoes, url);
      const { limite, cursor } = lerPaginacao(url);
      const pagina = await listarInvestigacoes(await depsDeLeitura(requisicao), filtros, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorInvestigacoes) : undefined,
      });
      return semCache(json(pagina));
    }),

    detalhe: envolver(async (requisicao, contexto: ContextoSlug) =>
      semCache(json(await obterInvestigacao(await depsDeLeitura(requisicao), await lerSlug(contexto)))),
    ),

    historico: envolver(async (requisicao, contexto: ContextoSlug) => {
      const slug = await lerSlug(contexto);
      const { limite, cursor } = lerPaginacao(new URL(requisicao.url));
      const pagina = await listarHistorico(deps(), slug, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorHistorico) : undefined,
      });
      return semCache(json(pagina));
    }),

    criar: envolver(async (requisicao) => {
      const { dependencias, usuario } = await autenticar(requisicao);
      const entrada = await lerCorpo(requisicao, esquemaCriarInvestigacao, { limiteBytes: LIMITE_CORPO_BYTES });
      const criada = await criarInvestigacao(dependencias, usuario, entrada);
      const resposta = semCache(json(criada, 201));
      resposta.headers.set("Location", `/api/v1/investigacoes/${criada.slug}`);
      return resposta;
    }),

    editar: envolver(async (requisicao, contexto: ContextoSlug) => {
      const { dependencias, usuario } = await autenticar(requisicao);
      const slug = await lerSlug(contexto);
      const entrada = await lerCorpo(requisicao, esquemaEditarInvestigacao, { limiteBytes: LIMITE_CORPO_BYTES });
      return semCache(json(await editarInvestigacao(dependencias, usuario, slug, entrada)));
    }),

    mudarEstado: envolver(async (requisicao, contexto: ContextoSlug) => {
      const { dependencias, usuario } = await autenticar(requisicao);
      const slug = await lerSlug(contexto);
      const { estado } = await lerCorpo(requisicao, esquemaMudarEstado, { limiteBytes: 1_000 });
      return semCache(json(await mudarEstado(dependencias, usuario, slug, estado)));
    }),

    encerrar: envolver(async (requisicao, contexto: ContextoSlug) => {
      const { dependencias, usuario } = await autenticar(requisicao);
      return semCache(json(await encerrarInvestigacao(dependencias, usuario, await lerSlug(contexto))));
    }),
  };
}
