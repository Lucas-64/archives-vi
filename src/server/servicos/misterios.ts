import { and, eq, inArray, sql, type SQL } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type { CursorMisterios, EntradaCriarMisterio, MisterioDetalhePublico, MisterioResumo } from "../contracts/misterios";
import type { Banco } from "../db/cliente";
import { codigoPg } from "../db/erros";
import { comentarios, investigacoes, misterios, usuarios } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";
import { escolherSlugLivre, type Executor } from "./slugs";

export interface DependenciasMisterios {
  db: Banco;
  agora: () => Date;
}

const MENSAGEM_NAO_ENCONTRADO = "Mistério não encontrado.";
const iso = (valor: Date) => valor.toISOString();

const colunas = {
  mis: misterios,
  autorNome: usuarios.nome,
  autorUsuario: usuarios.usuario,
  atualizadoEmTexto: sql<string>`to_char(${misterios.atualizadoEm} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
};

type Linha = {
  mis: typeof misterios.$inferSelect;
  autorNome: string;
  autorUsuario: string;
  atualizadoEmTexto: string;
};

// Aberta = vinculada e não encerrada pelo autor (D4), a mesma regra do limite de abertas por membro.
async function abertasDe(db: Executor, ids: string[]): Promise<Map<string, number>> {
  const mapa = new Map<string, number>();
  if (ids.length === 0) return mapa;
  const linhas = await db
    .select({ id: investigacoes.misterioId, total: sql<number>`count(*)::int` })
    .from(investigacoes)
    .where(and(inArray(investigacoes.misterioId, ids), eq(investigacoes.encerradaPeloAutor, false)))
    .groupBy(investigacoes.misterioId);
  for (const l of linhas) if (l.id) mapa.set(l.id, l.total);
  return mapa;
}

async function comentariosDe(db: Executor, ids: string[]): Promise<Map<string, number>> {
  const mapa = new Map<string, number>();
  if (ids.length === 0) return mapa;
  const linhas = await db
    .select({ id: comentarios.misterioId, total: sql<number>`count(*)::int` })
    .from(comentarios)
    .where(inArray(comentarios.misterioId, ids))
    .groupBy(comentarios.misterioId);
  for (const l of linhas) if (l.id) mapa.set(l.id, l.total);
  return mapa;
}

function resumoDe(linha: Linha, abertas: number, numComentarios: number): MisterioResumo {
  const m = linha.mis;
  return {
    id: m.id,
    slug: m.slug,
    titulo: m.titulo,
    descricao: m.descricao,
    imagem: m.imagemUrl ?? null,
    classificacao: m.classificacao,
    ...(m.videoUrl ? { video: { url: m.videoUrl, ...(m.videoTitulo ? { titulo: m.videoTitulo } : {}) } } : {}),
    autor: { nome: linha.autorNome, usuario: linha.autorUsuario },
    criadoEm: iso(m.criadoEm),
    atualizadoEm: iso(m.atualizadoEm),
    investigacoesAbertas: abertas,
    comentarios: numComentarios,
  };
}

// Mistério oculto some de toda leitura pública: responde como inexistente.
async function buscarLinha(db: Executor, slug: string): Promise<Linha | undefined> {
  const [linha] = await db
    .select(colunas)
    .from(misterios)
    .innerJoin(usuarios, eq(usuarios.id, misterios.autorId))
    .where(and(eq(misterios.slug, slug), eq(misterios.status, "publicado")));
  return linha;
}

export async function listarMisterios(
  deps: DependenciasMisterios,
  filtros: { classificacao?: string; autor?: string },
  paginacao: { limite: number; cursor?: CursorMisterios },
): Promise<Pagina<MisterioResumo>> {
  const condicoes: SQL[] = [eq(misterios.status, "publicado")];
  if (filtros.classificacao) condicoes.push(eq(misterios.classificacao, filtros.classificacao as never));
  if (filtros.autor) {
    const [conta] = await deps.db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.usuario, filtros.autor));
    if (!conta) throw new ErroApi("nao_encontrado", "Usuário não encontrado.");
    condicoes.push(eq(misterios.autorId, conta.id));
  }
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${misterios.atualizadoEm}, ${misterios.id}) < (${c.atualizadoEm}::timestamptz, ${c.id}::uuid)`);
  }
  let linhas: Linha[];
  try {
    linhas = await deps.db
      .select(colunas)
      .from(misterios)
      .innerJoin(usuarios, eq(usuarios.id, misterios.autorId))
      .where(and(...condicoes))
      .orderBy(sql`${misterios.atualizadoEm} desc`, sql`${misterios.id} desc`)
      .limit(paginacao.limite + 1);
  } catch (erro) {
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    throw erro;
  }
  // O cursor guarda o instante com microssegundos, que o driver (Date) perderia.
  const pagina = fatiarPagina(linhas, paginacao.limite, (ultima) => ({ atualizadoEm: ultima.atualizadoEmTexto, id: ultima.mis.id }));
  const ids = pagina.itens.map((l) => l.mis.id);
  const abertas = await abertasDe(deps.db, ids);
  const coms = await comentariosDe(deps.db, ids);
  return { itens: pagina.itens.map((l) => resumoDe(l, abertas.get(l.mis.id) ?? 0, coms.get(l.mis.id) ?? 0)), proximoCursor: pagina.proximoCursor };
}

export async function obterMisterio(deps: DependenciasMisterios, slug: string): Promise<MisterioDetalhePublico> {
  const linha = await buscarLinha(deps.db, slug);
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADO);
  const abertas = await abertasDe(deps.db, [linha.mis.id]);
  const coms = await comentariosDe(deps.db, [linha.mis.id]);
  return resumoDe(linha, abertas.get(linha.mis.id) ?? 0, coms.get(linha.mis.id) ?? 0);
}

// Usado pela criação de investigações: o mistério precisa existir e estar publicado.
export async function exigirMisterioPublicado(db: Executor, slug: string): Promise<{ id: string }> {
  const [m] = await db
    .select({ id: misterios.id })
    .from(misterios)
    .where(and(eq(misterios.slug, slug), eq(misterios.status, "publicado")));
  if (!m) throw new ErroApi("validacao", undefined, { campos: { misterio: "Mistério não encontrado." } });
  return m;
}

type Autor = { id: string; papel: string };

// Qualquer membro autenticado cria. O autor vem da sessão; `status` nasce `publicado`.
export async function criarMisterio(deps: DependenciasMisterios, autor: Autor, entrada: EntradaCriarMisterio): Promise<MisterioDetalhePublico> {
  const agora = deps.agora();
  await consumirLimite(deps.db, LIMITES.misterioCriarMembro, autor.id, agora);
  await consumirLimite(deps.db, LIMITES.misterioCriarDia, autor.id, agora);

  const slug = await deps.db.transaction(async (tx) => {
    const novoSlug = await escolherSlugLivre(tx, entrada.titulo);
    await tx.insert(misterios).values({
      slug: novoSlug,
      titulo: entrada.titulo,
      descricao: entrada.descricao,
      classificacao: entrada.classificacao,
      imagemUrl: entrada.imagem ?? null,
      videoUrl: entrada.video?.url ?? null,
      videoTitulo: entrada.video?.titulo ?? null,
      autorId: autor.id,
      criadoEm: agora,
      atualizadoEm: agora,
    });
    return novoSlug;
  });
  return obterMisterio(deps, slug);
}
