import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirPapel } from "../auth/guarda";
import {
  esquemaCursorAuditoria,
  esquemaListarAuditoria,
  esquemaMudarPapel,
  esquemaMudarStatus,
} from "../contracts/moderacao";
import { esquemaSlug } from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validarQuery } from "../http/validar";
import { listarAuditoria } from "../servicos/auditoria";
import { mudarPapelUsuario, mudarStatusInvestigacao, type DependenciasModeracao } from "../servicos/moderacao";
import type { Papel } from "../db/esquema";

export interface OpcoesRotasModeracao {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

const MODERACAO: readonly Papel[] = ["moderador", "admin"];
const SOMENTE_ADMIN: readonly Papel[] = ["admin"];
const FORMATO_USUARIO = /^[a-z0-9_]{3,30}$/;

export function criarManipuladoresModeracao(opcoes: OpcoesRotasModeracao = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const deps = (): DependenciasModeracao => ({ db: (opcoes.obterDb ?? obterDb)(), agora });
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };
  // Origem, sessão e papel (lido do banco) antes de qualquer leitura de corpo.
  const autorizar = async (requisicao: Request, papeis: readonly Papel[], mutacao: boolean) => {
    if (mutacao) exigirOrigemConfiavel(requisicao);
    const dependencias = deps();
    const sessao = await exigirPapel(dependencias.db, requisicao, cookie, papeis, agora());
    return { dependencias, ator: sessao.usuario };
  };

  return {
    mudarStatus: envolver(async (requisicao, contexto: { params: Promise<{ slug: string }> }) => {
      const { dependencias, ator } = await autorizar(requisicao, MODERACAO, true);
      const parse = esquemaSlug.safeParse((await contexto.params).slug);
      if (!parse.success) throw new ErroApi("nao_encontrado", "Investigação não encontrada.");
      const entrada = await lerCorpo(requisicao, esquemaMudarStatus, { limiteBytes: 2_000 });
      return semCache(json(await mudarStatusInvestigacao(dependencias, ator, parse.data, entrada)));
    }),

    mudarPapel: envolver(async (requisicao, contexto: { params: Promise<{ usuario: string }> }) => {
      const { dependencias, ator } = await autorizar(requisicao, SOMENTE_ADMIN, true);
      const usuario = (await contexto.params).usuario;
      if (!FORMATO_USUARIO.test(usuario)) throw new ErroApi("nao_encontrado", "Usuário não encontrado.");
      const entrada = await lerCorpo(requisicao, esquemaMudarPapel, { limiteBytes: 2_000 });
      return semCache(json(await mudarPapelUsuario(dependencias, ator, usuario, entrada)));
    }),

    auditoria: envolver(async (requisicao) => {
      const { dependencias } = await autorizar(requisicao, SOMENTE_ADMIN, false);
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarAuditoria, url);
      const { limite, cursor } = lerPaginacao(url);
      const pagina = await listarAuditoria(dependencias.db, filtros, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorAuditoria) : undefined,
      });
      return semCache(json(pagina));
    }),
  };
}
