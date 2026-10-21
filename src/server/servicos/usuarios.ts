import { and, asc, eq, inArray, sql, type SQL } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type { CursorCriadores, EntradaEditarPerfil, IndicadoresPerfil, PerfilPublico } from "../contracts/usuarios";
import type { Banco } from "../db/cliente";
import { codigoPg } from "../db/erros";
import { comentarios, evidencias, investigacoes, publicacoes, usuarios } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";
import { paraUsuarioPrivado } from "./auth";

export interface DependenciasUsuarios {
  db: Banco;
  agora: () => Date;
}

const MENSAGEM_NAO_ENCONTRADO = "Usuário não encontrado.";

// Normalização de busca feita na aplicação (sem a extensão `unaccent`): minúsculas, sem marcas
// diacríticas e com as letras latinas que não decompõem mapeadas à mão. O lado do banco usa `translate()`
// (função nativa) com a MESMA tabela, gerada abaixo; um teste confere que os dois lados concordam.
const SEM_DECOMPOSICAO: Record<string, string> = { ø: "o", ł: "l", đ: "d", ı: "i" };
const LETRAS_ACENTUADAS =
  "áàâãäåāăąçćčďéèêëēěęíìîïīñńňóòôõöőōŕřśšşťúùûüūůűýÿźžżĺľğ";

export function normalizarBusca(texto: string): string {
  const base = texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return [...base].map((c) => SEM_DECOMPOSICAO[c] ?? c).join("");
}

const DE = LETRAS_ACENTUADAS + Object.keys(SEM_DECOMPOSICAO).join("");
const PARA = [...DE].map((c) => normalizarBusca(c)).join("");
if ([...DE].length !== [...PARA].length) throw new Error("Tabela de normalização inconsistente.");

const nomeNormalizado = sql`translate(lower(${usuarios.nome}), ${DE}, ${PARA})`;
const escaparLike = (valor: string) => valor.replace(/[\\%_]/g, (c) => `\\${c}`);

// Contagens reais, calculadas a partir das tabelas (nada fixo). Só conteúdo público conta: publicações
// publicadas, investigações, evidências ACEITAS e comentários em publicações publicadas.
export async function indicadoresDe(db: Banco, ids: string[]): Promise<Map<string, IndicadoresPerfil>> {
  const mapa = new Map<string, IndicadoresPerfil>();
  for (const id of ids) mapa.set(id, { publicacoes: 0, investigacoes: 0, evidenciasAceitas: 0, comentarios: 0 });
  if (ids.length === 0) return mapa;

  const [pubs, invs, evs, coms] = await Promise.all([
    db
      .select({ id: publicacoes.autorId, total: sql<number>`count(*)::int` })
      .from(publicacoes)
      .where(and(inArray(publicacoes.autorId, ids), eq(publicacoes.status, "publicado")))
      .groupBy(publicacoes.autorId),
    db
      .select({ id: investigacoes.autorId, total: sql<number>`count(*)::int` })
      .from(investigacoes)
      .where(inArray(investigacoes.autorId, ids))
      .groupBy(investigacoes.autorId),
    db
      .select({ id: evidencias.autorId, total: sql<number>`count(*)::int` })
      .from(evidencias)
      .where(and(inArray(evidencias.autorId, ids), eq(evidencias.status, "aceita")))
      .groupBy(evidencias.autorId),
    db
      .select({ id: comentarios.autorId, total: sql<number>`count(*)::int` })
      .from(comentarios)
      .innerJoin(publicacoes, eq(publicacoes.id, comentarios.publicacaoId))
      .where(and(inArray(comentarios.autorId, ids), eq(publicacoes.status, "publicado")))
      .groupBy(comentarios.autorId),
  ]);
  for (const l of pubs) (mapa.get(l.id) as IndicadoresPerfil).publicacoes = l.total;
  for (const l of invs) (mapa.get(l.id) as IndicadoresPerfil).investigacoes = l.total;
  for (const l of evs) (mapa.get(l.id) as IndicadoresPerfil).evidenciasAceitas = l.total;
  for (const l of coms) (mapa.get(l.id) as IndicadoresPerfil).comentarios = l.total;
  return mapa;
}

type LinhaUsuario = { id: string; usuario: string; nome: string; bio: string; criadoEm: Date };
const colunas = { id: usuarios.id, usuario: usuarios.usuario, nome: usuarios.nome, bio: usuarios.bio, criadoEm: usuarios.criadoEm };

function perfilDe(l: LinhaUsuario, ind: IndicadoresPerfil): PerfilPublico {
  return { usuario: l.usuario, nome: l.nome, bio: l.bio, avatar: null, criadoEm: l.criadoEm.toISOString(), indicadores: ind };
}

// Quem tem perfil público: toda conta (o nome de usuário já é público nas autorias).
export async function obterPerfil(db: Banco, usuario: string): Promise<PerfilPublico> {
  const [linha] = await db.select(colunas).from(usuarios).where(eq(usuarios.usuario, usuario));
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADO);
  const ind = await indicadoresDe(db, [linha.id]);
  return perfilDe(linha, ind.get(linha.id) as IndicadoresPerfil);
}

// Resolve o nome de usuário (já validado no formato) ou 404.
export async function idDoUsuario(db: Banco, usuario: string): Promise<string> {
  const [linha] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.usuario, usuario));
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADO);
  return linha.id;
}

// Criadores = contas com ao menos uma publicação publicada ou uma investigação. Ordem por `usuario`
// (único), cursor por `usuario`. `q` casa com o nome (sem acento e sem diferenciar maiúsculas) ou com o usuário.
export async function listarCriadores(
  db: Banco,
  filtros: { q?: string },
  paginacao: { limite: number; cursor?: CursorCriadores },
): Promise<Pagina<PerfilPublico>> {
  const condicoes: SQL[] = [
    sql`(exists (select 1 from ${publicacoes} where ${publicacoes.autorId} = ${usuarios.id} and ${publicacoes.status} = 'publicado')
      or exists (select 1 from ${investigacoes} where ${investigacoes.autorId} = ${usuarios.id}))`,
  ];
  const termo = filtros.q ? normalizarBusca(filtros.q) : "";
  if (termo) {
    const padrao = `%${escaparLike(termo)}%`;
    condicoes.push(sql`(${nomeNormalizado} like ${padrao} escape '\\' or ${usuarios.usuario} like ${padrao} escape '\\')`);
  }
  if (paginacao.cursor) condicoes.push(sql`${usuarios.usuario} > ${paginacao.cursor.usuario}`);

  let linhas: LinhaUsuario[];
  try {
    linhas = await db
      .select(colunas)
      .from(usuarios)
      .where(and(...condicoes))
      .orderBy(asc(usuarios.usuario))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    throw erro;
  }
  const pagina = fatiarPagina(linhas, paginacao.limite, (ultima) => ({ usuario: ultima.usuario }));
  const ind = await indicadoresDe(db, pagina.itens.map((l) => l.id));
  return { itens: pagina.itens.map((l) => perfilDe(l, ind.get(l.id) as IndicadoresPerfil)), proximoCursor: pagina.proximoCursor };
}

// Edita só o perfil da própria sessão. Só grava o que mudou (reenviar os mesmos valores é no-op) e trava a
// linha: edições simultâneas se enfileiram. Devolve o usuário privado (como `GET /auth/eu`).
export async function editarPerfil(deps: DependenciasUsuarios, sessao: { id: string }, entrada: EntradaEditarPerfil) {
  const agora = deps.agora();
  await consumirLimite(deps.db, LIMITES.perfilEditarMembro, sessao.id, agora);
  return deps.db.transaction(async (tx) => {
    const [atual] = await tx.select().from(usuarios).where(eq(usuarios.id, sessao.id)).for("update");
    if (!atual) throw new ErroApi("nao_autenticado");
    const mudancas: Partial<typeof usuarios.$inferInsert> = {};
    if (entrada.nome !== undefined && entrada.nome !== atual.nome) mudancas.nome = entrada.nome;
    if (entrada.bio !== undefined && entrada.bio !== atual.bio) mudancas.bio = entrada.bio;
    if (Object.keys(mudancas).length === 0) return paraUsuarioPrivado(atual);
    const [nova] = await tx.update(usuarios).set({ ...mudancas, atualizadoEm: agora }).where(eq(usuarios.id, atual.id)).returning();
    return paraUsuarioPrivado(nova);
  });
}
