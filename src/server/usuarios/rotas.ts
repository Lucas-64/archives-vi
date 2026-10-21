import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao, sessaoDaRequisicao } from "../auth/guarda";
import { esquemaCursorCriadores, esquemaEditarPerfil, esquemaListarCriadores, esquemaNomeUsuario } from "../contracts/usuarios";
import { esquemaCursorInvestigacoes, esquemaListarInvestigacoes } from "../contracts/investigacoes";
import { esquemaCursorPublicacoes, esquemaListarPublicacoes } from "../contracts/publicacoes";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { decodificarCursor, lerPaginacao } from "../http/paginacao";
import { envolver, json } from "../http/resposta";
import { lerCorpo, validarQuery } from "../http/validar";
import { listarInvestigacoes } from "../servicos/investigacoes";
import { listarPublicacoes } from "../servicos/publicacoes";
import { editarPerfil, idDoUsuario, listarCriadores, obterPerfil } from "../servicos/usuarios";

const LIMITE_CORPO_BYTES = 2_000;

export interface OpcoesRotasUsuarios {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
}

interface ContextoUsuario {
  params: Promise<{ usuario: string }>;
}

// Nome fora do formato nunca existe: 404, sem consultar o banco.
async function lerUsuario(contexto: ContextoUsuario): Promise<string> {
  const resultado = esquemaNomeUsuario.safeParse((await contexto.params).usuario);
  if (!resultado.success) throw new ErroApi("nao_encontrado", "Usuário não encontrado.");
  return resultado.data;
}

export function criarManipuladoresUsuarios(opcoes: OpcoesRotasUsuarios = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const db = () => (opcoes.obterDb ?? obterDb)();
  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };
  // Leituras públicas com sessão opcional: só serve para `euCurti` e `permissoes` nas listas reutilizadas.
  const visitante = async (requisicao: Request) => (await sessaoDaRequisicao(db(), requisicao, cookie, agora()))?.usuario;

  return {
    criadores: envolver(async (requisicao) => {
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarCriadores, url);
      const { limite, cursor } = lerPaginacao(url);
      const pagina = await listarCriadores(db(), filtros, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorCriadores) : undefined,
      });
      return semCache(json(pagina));
    }),

    perfil: envolver(async (_requisicao, contexto: ContextoUsuario) =>
      semCache(json(await obterPerfil(db(), await lerUsuario(contexto)))),
    ),

    publicacoes: envolver(async (requisicao, contexto: ContextoUsuario) => {
      const usuario = await lerUsuario(contexto);
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarPublicacoes.omit({ autor: true }), url);
      const { limite, cursor } = lerPaginacao(url);
      await idDoUsuario(db(), usuario);
      const quem = await visitante(requisicao);
      const pagina = await listarPublicacoes({ db: db(), agora, visitanteId: quem?.id }, { ...filtros, autor: usuario }, {
        limite,
        cursor: cursor ? decodificarCursor(cursor, esquemaCursorPublicacoes) : undefined,
      });
      return semCache(json(pagina));
    }),

    investigacoes: envolver(async (requisicao, contexto: ContextoUsuario) => {
      const usuario = await lerUsuario(contexto);
      const url = new URL(requisicao.url);
      const filtros = validarQuery(esquemaListarInvestigacoes, url);
      const { limite, cursor } = lerPaginacao(url);
      const autorId = await idDoUsuario(db(), usuario);
      const quem = await visitante(requisicao);
      const pagina = await listarInvestigacoes(
        { db: db(), agora, visitanteId: quem?.id, visitantePapel: quem?.papel },
        { categoria: filtros.categoria, tag: filtros.tag, autorId },
        { limite, cursor: cursor ? decodificarCursor(cursor, esquemaCursorInvestigacoes) : undefined },
      );
      return semCache(json(pagina));
    }),

    // Só o perfil da própria sessão: não existe parâmetro de usuário. Sessão antes do corpo.
    editarPerfil: envolver(async (requisicao) => {
      exigirOrigemConfiavel(requisicao);
      const sessao = await exigirSessao(db(), requisicao, cookie, agora());
      const entrada = await lerCorpo(requisicao, esquemaEditarPerfil, { limiteBytes: LIMITE_CORPO_BYTES });
      return semCache(json({ usuario: await editarPerfil({ db: db(), agora }, sessao.usuario, entrada) }));
    }),
  };
}
