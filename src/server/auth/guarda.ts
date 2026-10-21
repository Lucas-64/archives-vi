import type { Banco } from "../db/cliente";
import type { Papel } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { lerTokenDoCookie, type ConfiguracaoCookie } from "./cookie";
import { validarSessao } from "./sessao";

const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);
export const CABECALHO_CSRF = "X-Requested-With";
export const VALOR_CSRF = "archives-vi";

// Defesa contra CSRF para mutações: além de SameSite=Lax, exige o cabeçalho próprio (um formulário
// de outro site não consegue enviá-lo) e `Origin` igual à origem desta requisição.
export function exigirOrigemConfiavel(requisicao: Request): void {
  if (METODOS_SEGUROS.has(requisicao.method.toUpperCase())) return;
  const origem = requisicao.headers.get("origin");
  const mesmaOrigem = origem !== null && origem === new URL(requisicao.url).origin;
  if (!mesmaOrigem || requisicao.headers.get(CABECALHO_CSRF) !== VALOR_CSRF) {
    throw new ErroApi("sem_permissao", "Requisição de origem não confiável.");
  }
}

export async function sessaoDaRequisicao(db: Banco, requisicao: Request, cookie: ConfiguracaoCookie, agora?: Date) {
  const token = lerTokenDoCookie(requisicao.headers.get("cookie"), cookie);
  if (!token) return null;
  const sessao = await validarSessao(db, token, agora);
  return sessao ? { ...sessao, token } : null;
}

// Sessão obrigatória: sem sessão válida, 401.
export async function exigirSessao(db: Banco, requisicao: Request, cookie: ConfiguracaoCookie, agora?: Date) {
  const sessao = await sessaoDaRequisicao(db, requisicao, cookie, agora);
  if (!sessao) throw new ErroApi("nao_autenticado");
  return sessao;
}

// Papel obrigatório: sessão válida e papel entre os aceitos; senão 401 ou 403. A decisão é sempre do
// servidor, a partir do banco, nunca de algo que o cliente enviou.
export async function exigirPapel(
  db: Banco,
  requisicao: Request,
  cookie: ConfiguracaoCookie,
  papeis: readonly Papel[],
  agora?: Date,
) {
  const sessao = await exigirSessao(db, requisicao, cookie, agora);
  if (!papeis.includes(sessao.usuario.papel)) throw new ErroApi("sem_permissao");
  return sessao;
}
