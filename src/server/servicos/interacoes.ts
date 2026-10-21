import { and, asc, eq, sql, type SQL } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type { ComentarioPublico, CursorComentarios, EntradaCriarComentario, EstadoCurtida } from "../contracts/interacoes";
import type { Banco } from "../db/cliente";
import { codigoPg } from "../db/erros";
import { comentarios, curtidas, publicacoes, usuarios } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";

export interface DependenciasInteracoes {
  db: Banco;
  agora: () => Date;
}

const MENSAGEM_NAO_ENCONTRADA = "Publicação não encontrada.";

// Só publicações publicadas aceitam interação; oculta e inexistente dão o mesmo 404.
async function idPublicadaPorSlug(db: Banco, slug: string): Promise<string> {
  const [linha] = await db
    .select({ id: publicacoes.id })
    .from(publicacoes)
    .where(and(eq(publicacoes.slug, slug), eq(publicacoes.status, "publicado")));
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);
  return linha.id;
}

const criadoEmTexto = sql<string>`to_char(${comentarios.criadoEm} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

// Comentários da publicação, do mais antigo ao mais novo (conversa em ordem de leitura). Cursor por
// (criado_em, id) com comparação de tupla: empates de instante não duplicam nem pulam comentários.
export async function listarComentarios(
  deps: DependenciasInteracoes,
  slug: string,
  paginacao: { limite: number; cursor?: CursorComentarios },
): Promise<Pagina<ComentarioPublico>> {
  const publicacaoId = await idPublicadaPorSlug(deps.db, slug);
  const condicoes: SQL[] = [eq(comentarios.publicacaoId, publicacaoId)];
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${comentarios.criadoEm}, ${comentarios.id}) > (${c.criadoEm}::timestamptz, ${c.id}::uuid)`);
  }

  let linhas;
  try {
    linhas = await deps.db
      .select({
        id: comentarios.id,
        texto: comentarios.texto,
        autorNome: usuarios.nome,
        autorUsuario: usuarios.usuario,
        criadoEm: criadoEmTexto,
      })
      .from(comentarios)
      .innerJoin(usuarios, eq(usuarios.id, comentarios.autorId))
      .where(and(...condicoes))
      .orderBy(asc(comentarios.criadoEm), asc(comentarios.id))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    throw erro;
  }

  return fatiarPagina(
    linhas.map((l) => ({ id: l.id, texto: l.texto, autor: { nome: l.autorNome, usuario: l.autorUsuario }, criadoEm: l.criadoEm })),
    paginacao.limite,
    (ultimo) => ({ criadoEm: ultimo.criadoEm, id: ultimo.id }),
  );
}

// Autor e publicação vêm da sessão e do alvo validado, nunca de campos livres do corpo.
export async function criarComentario(
  deps: DependenciasInteracoes,
  autor: { id: string; nome: string; usuario: string },
  entrada: EntradaCriarComentario,
): Promise<ComentarioPublico> {
  const agora = deps.agora();
  const publicacaoId = await idPublicadaPorSlug(deps.db, entrada.alvo);
  await consumirLimite(deps.db, LIMITES.comentarMembro, autor.id, agora);
  const [criado] = await deps.db
    .insert(comentarios)
    .values({ publicacaoId, autorId: autor.id, texto: entrada.texto, criadoEm: agora })
    .returning({ id: comentarios.id, texto: comentarios.texto });
  return { id: criado.id, texto: criado.texto, autor: { nome: autor.nome, usuario: autor.usuario }, criadoEm: agora.toISOString() };
}

async function estadoDaCurtida(db: Banco, publicacaoId: string, usuarioId: string): Promise<EstadoCurtida> {
  const [linha] = await db
    .select({
      total: sql<number>`count(*)::int`,
      minha: sql<number>`count(*) filter (where ${curtidas.usuarioId} = ${usuarioId})::int`,
    })
    .from(curtidas)
    .where(eq(curtidas.publicacaoId, publicacaoId));
  return { curtidas: linha.total, euCurti: linha.minha > 0 };
}

// Idempotente: curtir de novo não duplica (chave primária composta + ON CONFLICT DO NOTHING) e não falha.
export async function curtir(deps: DependenciasInteracoes, usuarioId: string, slug: string): Promise<EstadoCurtida> {
  const publicacaoId = await idPublicadaPorSlug(deps.db, slug);
  await consumirLimite(deps.db, LIMITES.curtirMembro, usuarioId, deps.agora());
  await deps.db.insert(curtidas).values({ publicacaoId, usuarioId, criadoEm: deps.agora() }).onConflictDoNothing();
  return estadoDaCurtida(deps.db, publicacaoId, usuarioId);
}

// Idempotente: remove só a curtida do próprio membro (o filtro usa o id da sessão); sem curtida, nada muda.
export async function descurtir(deps: DependenciasInteracoes, usuarioId: string, slug: string): Promise<EstadoCurtida> {
  const publicacaoId = await idPublicadaPorSlug(deps.db, slug);
  await consumirLimite(deps.db, LIMITES.curtirMembro, usuarioId, deps.agora());
  await deps.db.delete(curtidas).where(and(eq(curtidas.publicacaoId, publicacaoId), eq(curtidas.usuarioId, usuarioId)));
  return estadoDaCurtida(deps.db, publicacaoId, usuarioId);
}
