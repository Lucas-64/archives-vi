import { and, asc, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type {
  CursorEvidencias,
  EntradaCriarEvidencia,
  EvidenciaPublica,
  Sugestao,
  SugestaoDoMembro,
} from "../contracts/evidencias";
import type { Banco } from "../db/cliente";
import { codigoPg } from "../db/erros";
import { evidencias, investigacoes, usuarios, type StatusEvidencia } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";
import { registrarHistorico } from "./investigacoes";
import { registrarAuditoria } from "./auditoria";
import type { Executor } from "./slugs";

export interface DependenciasEvidencias {
  db: Banco;
  agora: () => Date;
}

export interface Ator {
  id: string;
  nome: string;
  usuario: string;
  papel: string;
}

// Máximo de sugestões pendentes de um membro em uma mesma investigação. Provisório (D-P).
export const MAXIMO_SUGESTOES_PENDENTES = 10;

const MENSAGEM_INVESTIGACAO = "Investigação não encontrada.";
const MENSAGEM_SUGESTAO = "Sugestão não encontrada.";
const ehModeracao = (papel: string) => papel === "moderador" || papel === "admin";

const autor = alias(usuarios, "autor");
const decisor = alias(usuarios, "decisor");
const instante = (coluna: SQL | typeof evidencias.criadoEm | typeof evidencias.decididaEm) =>
  sql<string>`to_char(${coluna} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

const colunas = {
  e: evidencias,
  autorNome: autor.nome,
  autorUsuario: autor.usuario,
  decisorNome: decisor.nome,
  decisorUsuario: decisor.usuario,
  criadoEmTexto: instante(evidencias.criadoEm),
  invSlug: investigacoes.slug,
  invTitulo: investigacoes.titulo,
};
type Linha = {
  e: typeof evidencias.$inferSelect;
  autorNome: string;
  autorUsuario: string;
  decisorNome: string | null;
  decisorUsuario: string | null;
  criadoEmTexto: string;
  invSlug: string;
  invTitulo: string;
};

const baseConsulta = (db: Executor) =>
  db
    .select(colunas)
    .from(evidencias)
    .innerJoin(autor, eq(autor.id, evidencias.autorId))
    .innerJoin(investigacoes, eq(investigacoes.id, evidencias.investigacaoId))
    .leftJoin(decisor, eq(decisor.id, evidencias.decididaPorId));

function publicaDe(l: Linha): EvidenciaPublica {
  const e = l.e;
  const enviadaPor = { nome: l.autorNome, usuario: l.autorUsuario };
  const aceitaPor = l.decisorUsuario ? { nome: l.decisorNome as string, usuario: l.decisorUsuario } : undefined;
  return {
    id: e.id,
    origem: e.origem,
    titulo: e.titulo,
    descricao: e.descricao,
    autor: enviadaPor,
    data: new Date(l.criadoEmTexto).toISOString(),
    fonte: e.fonte,
    imagens: [],
    ...(e.relacionadaAId ? { relacionadaA: e.relacionadaAId } : {}),
    // Só quando outra pessoa aceitou: a autoria original nunca muda.
    ...(e.status === "aceita" && aceitaPor && e.decididaPorId !== e.autorId ? { origemComunidade: { enviadaPor, aceitaPor } } : {}),
  };
}

// Sugestão visível a quem a envia, ao responsável e à moderação. O motivo da recusa nunca entra na versão pública.
function sugestaoDe(l: Linha): Sugestao {
  const e = l.e;
  return {
    ...publicaDe(l),
    status: e.status,
    ...(e.motivoRecusa ? { motivo: e.motivoRecusa } : {}),
    ...(l.decisorUsuario ? { decididaPor: { nome: l.decisorNome as string, usuario: l.decisorUsuario } } : {}),
    ...(e.decididaEm ? { decididaEm: e.decididaEm.toISOString() } : {}),
  };
}

async function investigacaoPorSlug(db: Executor, slug: string) {
  const [inv] = await db
    .select({ id: investigacoes.id, slug: investigacoes.slug, titulo: investigacoes.titulo, autorId: investigacoes.autorId })
    .from(investigacoes)
    .where(eq(investigacoes.slug, slug));
  if (!inv) throw new ErroApi("nao_encontrado", MENSAGEM_INVESTIGACAO);
  return inv;
}

function cursorInvalido(erro: unknown, temCursor: boolean): never {
  if (temCursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
  throw erro;
}

// Lista pública: SÓ aceitas, do mais antigo ao mais novo, cursor por (criado_em, id) com comparação de tupla.
export async function listarEvidencias(
  deps: DependenciasEvidencias,
  slug: string,
  paginacao: { limite: number; cursor?: CursorEvidencias },
): Promise<Pagina<EvidenciaPublica>> {
  const inv = await investigacaoPorSlug(deps.db, slug);
  const condicoes: SQL[] = [eq(evidencias.investigacaoId, inv.id), eq(evidencias.status, "aceita")];
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${evidencias.criadoEm}, ${evidencias.id}) > (${c.criadoEm}::timestamptz, ${c.id}::uuid)`);
  }
  let linhas: Linha[];
  try {
    linhas = await baseConsulta(deps.db)
      .where(and(...condicoes))
      .orderBy(asc(evidencias.criadoEm), asc(evidencias.id))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    return cursorInvalido(erro, Boolean(paginacao.cursor));
  }
  const pagina = fatiarPagina(linhas, paginacao.limite, (u) => ({ criadoEm: u.criadoEmTexto, id: u.e.id }));
  return { itens: pagina.itens.map(publicaDe), proximoCursor: pagina.proximoCursor };
}

// Sugestão nova. O responsável cria evidência já aceita (aceita por ele mesmo); qualquer outro membro cria
// pendente. O teto de pendentes é verificado sob bloqueio consultivo por (membro, investigação): envios
// simultâneos se enfileiram e nunca passam do teto. Encerrar a investigação não impede sugestões.
export async function criarEvidencia(
  deps: DependenciasEvidencias,
  usuario: Ator,
  slug: string,
  entrada: EntradaCriarEvidencia,
): Promise<Sugestao> {
  const agora = deps.agora();
  const inv = await investigacaoPorSlug(deps.db, slug);
  await consumirLimite(deps.db, LIMITES.evidenciaEnviarMembro, usuario.id, agora);
  const doResponsavel = inv.autorId === usuario.id;

  const id = await deps.db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`evidencias:pendentes:${usuario.id}:${inv.id}`}, 0))`);

    if (entrada.relacionadaA) {
      const [alvo] = await tx
        .select({ id: evidencias.id })
        .from(evidencias)
        .where(and(eq(evidencias.id, entrada.relacionadaA), eq(evidencias.investigacaoId, inv.id), eq(evidencias.status, "aceita")));
      if (!alvo) {
        throw new ErroApi("validacao", undefined, {
          campos: { relacionadaA: "Informe uma evidência aceita desta investigação." },
        });
      }
    }

    if (!doResponsavel) {
      const [{ pendentes }] = await tx
        .select({ pendentes: sql<number>`count(*)::int` })
        .from(evidencias)
        .where(and(eq(evidencias.investigacaoId, inv.id), eq(evidencias.autorId, usuario.id), eq(evidencias.status, "pendente")));
      if (pendentes >= MAXIMO_SUGESTOES_PENDENTES) {
        throw new ErroApi(
          "conflito",
          `Você já tem ${MAXIMO_SUGESTOES_PENDENTES} sugestões pendentes nesta investigação. Aguarde a análise para enviar outra.`,
        );
      }
    }

    const [criada] = await tx
      .insert(evidencias)
      .values({
        investigacaoId: inv.id,
        autorId: usuario.id,
        origem: entrada.origem,
        titulo: entrada.titulo,
        descricao: entrada.descricao,
        fonte: entrada.fonte ?? null,
        relacionadaAId: entrada.relacionadaA ?? null,
        status: doResponsavel ? "aceita" : "pendente",
        decididaPorId: doResponsavel ? usuario.id : null,
        decididaEm: doResponsavel ? agora : null,
        criadoEm: agora,
        atualizadoEm: agora,
      })
      .returning({ id: evidencias.id });
    if (doResponsavel) await registrarEvidenciaNoHistorico(tx, inv.id, usuario.id, entrada.titulo, agora);
    return criada.id;
  });

  return obterSugestao(deps.db, id);
}

async function registrarEvidenciaNoHistorico(tx: Executor, investigacaoId: string, atorId: string, titulo: string, criadoEm: Date) {
  // Só o título, que já é público na lista de evidências aceitas.
  await registrarHistorico(tx, investigacaoId, atorId, "evidencia", "Evidência adicionada", `Nova evidência aceita: ${titulo}.`, criadoEm);
}

async function obterSugestao(db: Executor, id: string): Promise<Sugestao> {
  const [linha] = await baseConsulta(db).where(eq(evidencias.id, id));
  return sugestaoDe(linha);
}

function exigirGestor(inv: { autorId: string }, usuario: Ator) {
  if (inv.autorId !== usuario.id && !ehModeracao(usuario.papel)) {
    throw new ErroApi("sem_permissao", "Só o responsável ou a moderação podem analisar sugestões.");
  }
}

// Fila de análise: responsável ou moderação. Por padrão, pendentes e recusadas, mais recentes primeiro.
export async function listarSugestoes(
  deps: DependenciasEvidencias,
  usuario: Ator,
  slug: string,
  filtro: { status?: StatusEvidencia },
  paginacao: { limite: number; cursor?: CursorEvidencias },
): Promise<Pagina<Sugestao>> {
  const inv = await investigacaoPorSlug(deps.db, slug);
  exigirGestor(inv, usuario);
  const condicoes: SQL[] = [
    eq(evidencias.investigacaoId, inv.id),
    filtro.status ? eq(evidencias.status, filtro.status) : inArray(evidencias.status, ["pendente", "recusada"]),
  ];
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${evidencias.criadoEm}, ${evidencias.id}) < (${c.criadoEm}::timestamptz, ${c.id}::uuid)`);
  }
  let linhas: Linha[];
  try {
    linhas = await baseConsulta(deps.db)
      .where(and(...condicoes))
      .orderBy(desc(evidencias.criadoEm), desc(evidencias.id))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    return cursorInvalido(erro, Boolean(paginacao.cursor));
  }
  const pagina = fatiarPagina(linhas, paginacao.limite, (u) => ({ criadoEm: u.criadoEmTexto, id: u.e.id }));
  return { itens: pagina.itens.map(sugestaoDe), proximoCursor: pagina.proximoCursor };
}

// Só as sugestões do próprio membro (identidade vem da sessão, nunca de parâmetro), em qualquer estado.
export async function listarSugestoesDoMembro(
  deps: DependenciasEvidencias,
  usuario: Ator,
  filtro: { status?: StatusEvidencia },
  paginacao: { limite: number; cursor?: CursorEvidencias },
): Promise<Pagina<SugestaoDoMembro>> {
  const condicoes: SQL[] = [eq(evidencias.autorId, usuario.id)];
  if (filtro.status) condicoes.push(eq(evidencias.status, filtro.status));
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${evidencias.criadoEm}, ${evidencias.id}) < (${c.criadoEm}::timestamptz, ${c.id}::uuid)`);
  }
  let linhas: Linha[];
  try {
    linhas = await baseConsulta(deps.db)
      .where(and(...condicoes))
      .orderBy(desc(evidencias.criadoEm), desc(evidencias.id))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    return cursorInvalido(erro, Boolean(paginacao.cursor));
  }
  const pagina = fatiarPagina(linhas, paginacao.limite, (u) => ({ criadoEm: u.criadoEmTexto, id: u.e.id }));
  return {
    itens: pagina.itens.map((l) => ({ ...sugestaoDe(l), investigacao: { slug: l.invSlug, titulo: l.invTitulo } })),
    proximoCursor: pagina.proximoCursor,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Decisão sobre uma sugestão pendente. Final: repetir a mesma decisão é sucesso sem efeito; a contrária dá 409.
// A linha é travada (FOR UPDATE) e a mudança é condicionada a `status = 'pendente'`. A decisão da moderação
// (quem não é o responsável) grava a auditoria na MESMA transação: se ela falhar, a decisão é desfeita.
// Aceitar também registra a evidência no histórico público. Ninguém decide a própria sugestão.
export async function decidirSugestao(
  deps: DependenciasEvidencias,
  usuario: Ator,
  slug: string,
  evidenciaId: string,
  decisao: "aceita" | "recusada",
  motivo?: string,
): Promise<Sugestao> {
  if (!UUID.test(evidenciaId)) throw new ErroApi("nao_encontrado", MENSAGEM_SUGESTAO);
  const agora = deps.agora();
  const inv = await investigacaoPorSlug(deps.db, slug);
  exigirGestor(inv, usuario);
  await consumirLimite(deps.db, LIMITES.moderacaoAgir, usuario.id, agora);
  const viaModeracao = inv.autorId !== usuario.id;

  await deps.db.transaction(async (tx) => {
    if (viaModeracao) {
      // O papel é relido na transação: um rebaixamento entre a sessão e aqui vale.
      const [atual] = await tx.select({ papel: usuarios.papel }).from(usuarios).where(eq(usuarios.id, usuario.id));
      if (!atual || !ehModeracao(atual.papel)) throw new ErroApi("sem_permissao");
    }
    const [travada] = await tx
      .select()
      .from(evidencias)
      .where(and(eq(evidencias.id, evidenciaId), eq(evidencias.investigacaoId, inv.id)))
      .for("update");
    if (!travada) throw new ErroApi("nao_encontrado", MENSAGEM_SUGESTAO);
    if (travada.autorId === usuario.id) throw new ErroApi("sem_permissao", "Você não pode decidir a própria sugestão.");

    if (travada.status !== "pendente") {
      if (travada.status === decisao) return;
      throw new ErroApi("conflito", "Esta sugestão já foi decidida de outra forma.");
    }

    const atualizada = await tx
      .update(evidencias)
      .set({
        status: decisao,
        decididaPorId: usuario.id,
        decididaEm: agora,
        motivoRecusa: decisao === "recusada" ? (motivo ?? null) : null,
        atualizadoEm: agora,
      })
      .where(and(eq(evidencias.id, travada.id), eq(evidencias.status, "pendente")))
      .returning({ id: evidencias.id });
    if (atualizada.length === 0) throw new ErroApi("conflito", "Esta sugestão já foi decidida.");

    if (decisao === "aceita") await registrarEvidenciaNoHistorico(tx, inv.id, usuario.id, travada.titulo, agora);
    if (viaModeracao) {
      await registrarAuditoria(tx, {
        atorId: usuario.id,
        acao: decisao === "aceita" ? "evidencia.aceitar" : "evidencia.recusar",
        alvoTipo: "evidencia",
        alvoId: travada.id,
        antes: { status: "pendente" },
        depois: { status: decisao, investigacaoId: inv.id },
        motivo: decisao === "recusada" ? (motivo ?? null) : null,
        criadoEm: agora,
      });
    }
  });

  return obterSugestao(deps.db, evidenciaId);
}
