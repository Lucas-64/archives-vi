import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { CursorAuditoria, RegistroAuditoria } from "../contracts/moderacao";
import type { Banco } from "../db/cliente";
import { codigoPg } from "../db/erros";
import { auditoria, usuarios, type AcaoAuditoria, type AlvoAuditoria } from "../db/esquema";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";
import type { Executor } from "./slugs";

export interface NovoRegistroAuditoria {
  atorId: string | null;
  atorRotulo?: string;
  acao: AcaoAuditoria;
  alvoTipo: AlvoAuditoria;
  alvoId: string;
  antes?: unknown;
  depois?: unknown;
  motivo?: string | null;
  criadoEm: Date;
}

// Chamado SEMPRE dentro da transação da operação auditada: se a gravação falhar, a operação é desfeita.
// `antes` e `depois` recebem só dados de estado (status, papel, ids), nunca e-mail, hash, token ou texto livre alheio.
export async function registrarAuditoria(tx: Executor, registro: NovoRegistroAuditoria): Promise<void> {
  await tx.insert(auditoria).values({
    atorId: registro.atorId,
    atorRotulo: registro.atorRotulo ?? null,
    acao: registro.acao,
    alvoTipo: registro.alvoTipo,
    alvoId: registro.alvoId,
    antes: registro.antes ?? null,
    depois: registro.depois ?? null,
    motivo: registro.motivo ?? null,
    criadoEm: registro.criadoEm,
  });
}

export async function listarAuditoria(
  db: Banco,
  filtros: { acao?: string; alvoTipo?: string },
  paginacao: { limite: number; cursor?: CursorAuditoria },
): Promise<Pagina<RegistroAuditoria>> {
  const ator = alias(usuarios, "ator");
  const condicoes: SQL[] = [];
  if (filtros.acao) condicoes.push(eq(auditoria.acao, filtros.acao as never));
  if (filtros.alvoTipo) condicoes.push(eq(auditoria.alvoTipo, filtros.alvoTipo as never));
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${auditoria.criadoEm}, ${auditoria.id}) < (${c.criadoEm}::timestamptz, ${c.id}::uuid)`);
  }
  const criadoEmTexto = sql<string>`to_char(${auditoria.criadoEm} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

  let linhas;
  try {
    linhas = await db
      .select({
        id: auditoria.id,
        acao: auditoria.acao,
        alvoTipo: auditoria.alvoTipo,
        alvoId: auditoria.alvoId,
        antes: auditoria.antes,
        depois: auditoria.depois,
        motivo: auditoria.motivo,
        atorRotulo: auditoria.atorRotulo,
        atorNome: ator.nome,
        atorUsuario: ator.usuario,
        criadoEmTexto,
      })
      .from(auditoria)
      .leftJoin(ator, eq(ator.id, auditoria.atorId))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .orderBy(desc(auditoria.criadoEm), desc(auditoria.id))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    throw erro;
  }

  const pagina = fatiarPagina(linhas, paginacao.limite, (ultima) => ({ criadoEm: ultima.criadoEmTexto, id: ultima.id }));
  return {
    itens: pagina.itens.map((l) => ({
      id: l.id,
      data: new Date(l.criadoEmTexto).toISOString(),
      ator: l.atorUsuario ? { nome: l.atorNome as string, usuario: l.atorUsuario } : { rotulo: l.atorRotulo as string },
      acao: l.acao,
      alvo: { tipo: l.alvoTipo, id: l.alvoId },
      antes: l.antes,
      depois: l.depois,
      motivo: l.motivo,
    })),
    proximoCursor: pagina.proximoCursor,
  };
}
