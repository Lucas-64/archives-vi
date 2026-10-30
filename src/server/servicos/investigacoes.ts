import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type {
  CursorHistorico,
  CursorInvestigacoes,
  EntradaCriarInvestigacao,
  EntradaEditarInvestigacao,
  InvestigacaoDetalhePublico,
  InvestigacaoResumo,
  RegistroHistoricoPublico,
} from "../contracts/investigacoes";
import type { Banco } from "../db/cliente";
import { codigoPg } from "../db/erros";
import {
  evidencias,
  IDS_TAGS,
  investigacaoHistorico,
  investigacaoTags,
  investigacoes,
  usuarios,
  type EstadoInvestigacao,
  type TipoHistorico,
} from "../db/esquema";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";
import { escolherSlugLivre, type Executor } from "./slugs";

export interface DependenciasInvestigacoes {
  db: Banco;
  agora: () => Date;
  // Membro autenticado que lê, se houver (define `permissoes.podeGerenciar`). Visitante: ausente.
  visitanteId?: string;
  // Papel (lido do banco na validação da sessão) do mesmo membro; define `permissoes.podeModerar`.
  visitantePapel?: string;
}

// Máximo de investigações abertas (não encerradas) por membro. Valor inicial e provisório (D-F).
export const MAXIMO_INVESTIGACOES_ABERTAS = 3;

// Quem pode criar. Hoje, qualquer membro autenticado (D-A, substitui a regra anterior de "ninguém por API").
// Para voltar a restringir a moderação, troque este predicado (por exemplo, exigindo papel moderador ou admin).
export function podeCriarInvestigacao(usuario: { papel: string }): boolean {
  void usuario;
  return true;
}

const MENSAGEM_NAO_ENCONTRADA = "Investigação não encontrada.";
const instante = (coluna: SQL | typeof investigacoes.atualizadoEm | typeof investigacaoHistorico.criadoEm) =>
  sql<string>`to_char(${coluna} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

const colunas = {
  inv: investigacoes,
  autorNome: usuarios.nome,
  autorUsuario: usuarios.usuario,
  atualizadoEmTexto: instante(investigacoes.atualizadoEm),
};

type Linha = {
  inv: typeof investigacoes.$inferSelect;
  autorNome: string;
  autorUsuario: string;
  atualizadoEmTexto: string;
};

const ordem = [desc(investigacoes.atualizadoEm), desc(investigacoes.id)] as const;
const iso = (valor: Date) => valor.toISOString();

async function temasDe(db: Executor, ids: string[]): Promise<Map<string, string[]>> {
  const mapa = new Map<string, string[]>();
  if (ids.length === 0) return mapa;
  const linhas = await db.select().from(investigacaoTags).where(inArray(investigacaoTags.investigacaoId, ids));
  for (const l of linhas) mapa.set(l.investigacaoId, [...(mapa.get(l.investigacaoId) ?? []), l.tagId]);
  // Na ordem do catálogo, como nas publicações.
  for (const [id, temas] of mapa) mapa.set(id, temas.sort((a, b) => IDS_TAGS.indexOf(a as never) - IDS_TAGS.indexOf(b as never)));
  return mapa;
}

// Só evidências ACEITAS contam; pendentes e recusadas nunca aparecem em contagem pública.
async function contagemEvidenciasDe(db: Executor, ids: string[]): Promise<Map<string, number>> {
  const mapa = new Map<string, number>();
  if (ids.length === 0) return mapa;
  const linhas = await db
    .select({ id: evidencias.investigacaoId, total: sql<number>`count(*)::int` })
    .from(evidencias)
    .where(and(inArray(evidencias.investigacaoId, ids), eq(evidencias.status, "aceita")))
    .groupBy(evidencias.investigacaoId);
  for (const l of linhas) mapa.set(l.id, l.total);
  return mapa;
}

// Mutações devolvem o detalhe já na ótica de quem agiu.
export const comVisitante = (deps: DependenciasInvestigacoes, usuario: { id: string; papel: string }): DependenciasInvestigacoes => ({
  ...deps,
  visitanteId: usuario.id,
  visitantePapel: usuario.papel,
});

function resumoDe(linha: Linha, tags: string[], contagemEvidencias: number): InvestigacaoResumo {
  const i = linha.inv;
  return {
    id: i.id,
    slug: i.slug,
    titulo: i.titulo,
    descricao: i.descricao,
    imagem: i.imagemUrl ?? null,
    status: i.status,
    categoria: i.categoria,
    ...(i.localizacao ? { localizacao: i.localizacao } : {}),
    tags,
    contagemEvidencias,
    ...(i.videoUrl ? { video: { url: i.videoUrl, ...(i.videoTitulo ? { titulo: i.videoTitulo } : {}) } } : {}),
    atualizadoEm: iso(i.atualizadoEm),
    possuiDetalhe: true,
  };
}

async function detalheDe(db: Executor, linha: Linha, visitanteId?: string, visitantePapel?: string): Promise<InvestigacaoDetalhePublico> {
  const i = linha.inv;
  const temas = await temasDe(db, [i.id]);
  const evidenciasAceitas = (await contagemEvidenciasDe(db, [i.id])).get(i.id) ?? 0;
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(investigacaoHistorico)
    .where(and(eq(investigacaoHistorico.investigacaoId, i.id), eq(investigacaoHistorico.tipo, "teoria")));
  return {
    ...resumoDe(linha, temas.get(i.id) ?? [], evidenciasAceitas),
    estado: i.estado,
    encerradaPeloAutor: i.encerradaPeloAutor,
    autor: { nome: linha.autorNome, usuario: linha.autorUsuario },
    criadoEm: iso(i.criadoEm),
    teoria: {
      hipotese: i.hipotese,
      argumentosFavoraveis: i.argumentosFavoraveis,
      perguntaCentral: i.perguntaCentral,
      fontes: i.fontes,
    },
    contagens: { revisoes: total, evidencias: evidenciasAceitas },
    // Calculado aqui, a partir do dono gravado; nunca vem do cliente.
    permissoes: {
      podeGerenciar: visitanteId !== undefined && visitanteId === i.autorId,
      // Qualquer sessão válida pode sugerir (inclusive em investigação encerrada).
      podeSugerirEvidencia: visitanteId !== undefined,
      podeModerar: visitantePapel === "moderador" || visitantePapel === "admin",
    },
  };
}

async function buscarLinha(db: Executor, slug: string): Promise<Linha | undefined> {
  const [linha] = await db
    .select(colunas)
    .from(investigacoes)
    .innerJoin(usuarios, eq(usuarios.id, investigacoes.autorId))
    .where(eq(investigacoes.slug, slug));
  return linha;
}

export async function listarInvestigacoes(
  deps: DependenciasInvestigacoes,
  filtros: { categoria?: string; tag?: string; autorId?: string },
  paginacao: { limite: number; cursor?: CursorInvestigacoes },
): Promise<Pagina<InvestigacaoResumo>> {
  const condicoes: SQL[] = [];
  if (filtros.categoria) condicoes.push(eq(investigacoes.categoria, filtros.categoria as never));
  if (filtros.autorId) condicoes.push(eq(investigacoes.autorId, filtros.autorId));
  if (filtros.tag) {
    condicoes.push(
      sql`exists (select 1 from ${investigacaoTags} where ${investigacaoTags.investigacaoId} = ${investigacoes.id} and ${investigacaoTags.tagId} = ${filtros.tag})`,
    );
  }
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${investigacoes.atualizadoEm}, ${investigacoes.id}) < (${c.atualizadoEm}::timestamptz, ${c.id}::uuid)`);
  }

  let linhas: Linha[];
  try {
    linhas = await deps.db
      .select(colunas)
      .from(investigacoes)
      .innerJoin(usuarios, eq(usuarios.id, investigacoes.autorId))
      .where(condicoes.length ? and(...condicoes) : undefined)
      .orderBy(...ordem)
      .limit(paginacao.limite + 1);
  } catch (erro) {
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    throw erro;
  }

  // O cursor guarda o instante com microssegundos, que o driver (Date) perderia.
  const pagina = fatiarPagina(linhas, paginacao.limite, (ultima) => ({ atualizadoEm: ultima.atualizadoEmTexto, id: ultima.inv.id }));
  const ids = pagina.itens.map((l) => l.inv.id);
  const temas = await temasDe(deps.db, ids);
  const totais = await contagemEvidenciasDe(deps.db, ids);
  return { itens: pagina.itens.map((l) => resumoDe(l, temas.get(l.inv.id) ?? [], totais.get(l.inv.id) ?? 0)), proximoCursor: pagina.proximoCursor };
}

export async function obterInvestigacao(deps: DependenciasInvestigacoes, slug: string): Promise<InvestigacaoDetalhePublico> {
  const linha = await buscarLinha(deps.db, slug);
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);
  return detalheDe(deps.db, linha, deps.visitanteId, deps.visitantePapel);
}

export async function listarHistorico(
  deps: DependenciasInvestigacoes,
  slug: string,
  paginacao: { limite: number; cursor?: CursorHistorico },
): Promise<Pagina<RegistroHistoricoPublico>> {
  const linha = await buscarLinha(deps.db, slug);
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);
  const condicoes: SQL[] = [eq(investigacaoHistorico.investigacaoId, linha.inv.id)];
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(sql`(${investigacaoHistorico.criadoEm}, ${investigacaoHistorico.id}) < (${c.criadoEm}::timestamptz, ${c.id}::uuid)`);
  }
  let linhas;
  try {
    linhas = await deps.db
      .select({
        id: investigacaoHistorico.id,
        titulo: investigacaoHistorico.titulo,
        resumo: investigacaoHistorico.resumo,
        autorNome: usuarios.nome,
        autorUsuario: usuarios.usuario,
        criadoEmTexto: instante(investigacaoHistorico.criadoEm),
      })
      .from(investigacaoHistorico)
      .innerJoin(usuarios, eq(usuarios.id, investigacaoHistorico.autorId))
      .where(and(...condicoes))
      .orderBy(desc(investigacaoHistorico.criadoEm), desc(investigacaoHistorico.id))
      .limit(paginacao.limite + 1);
  } catch (erro) {
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    throw erro;
  }
  const pagina = fatiarPagina(linhas, paginacao.limite, (ultimo) => ({ criadoEm: ultimo.criadoEmTexto, id: ultimo.id }));
  return {
    itens: pagina.itens.map((l) => ({
      id: l.id,
      data: new Date(l.criadoEmTexto).toISOString(),
      autor: { nome: l.autorNome, usuario: l.autorUsuario },
      titulo: l.titulo,
      resumo: l.resumo,
    })),
    proximoCursor: pagina.proximoCursor,
  };
}

export async function registrarHistorico(
  tx: Executor,
  investigacaoId: string,
  autorId: string,
  tipo: TipoHistorico,
  titulo: string,
  resumo: string,
  criadoEm: Date,
) {
  await tx.insert(investigacaoHistorico).values({ investigacaoId, autorId, tipo, titulo, resumo, criadoEm });
}

type Autor = { id: string; nome: string; usuario: string; papel: string };

// Criação: o autor vem da sessão; `status` e `estado` nascem nos valores padrão do banco. O limite de abertas
// é verificado e a linha é gravada dentro da mesma transação, sob um bloqueio consultivo por autor
// (pg_advisory_xact_lock): requisições simultâneas do mesmo membro se enfileiram e cada uma enxerga as
// anteriores já confirmadas, então o limite nunca é ultrapassado.
export async function criarInvestigacao(
  deps: DependenciasInvestigacoes,
  autor: Autor,
  entrada: EntradaCriarInvestigacao,
): Promise<InvestigacaoDetalhePublico> {
  if (!podeCriarInvestigacao(autor)) throw new ErroApi("sem_permissao");
  const agora = deps.agora();
  await consumirLimite(deps.db, LIMITES.investigacaoMutarMembro, autor.id, agora);

  const slug = await deps.db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`investigacoes:abertas:${autor.id}`}, 0))`);
    const [{ abertas }] = await tx
      .select({ abertas: sql<number>`count(*)::int` })
      .from(investigacoes)
      .where(and(eq(investigacoes.autorId, autor.id), eq(investigacoes.encerradaPeloAutor, false)));
    if (abertas >= MAXIMO_INVESTIGACOES_ABERTAS) {
      throw new ErroApi(
        "conflito",
        `Você já tem ${MAXIMO_INVESTIGACOES_ABERTAS} investigações abertas. Encerre uma para abrir outra.`,
      );
    }

    const novoSlug = await escolherSlugLivre(tx, entrada.titulo);
    const [criada] = await tx
      .insert(investigacoes)
      .values({
        slug: novoSlug,
        titulo: entrada.titulo,
        descricao: entrada.descricao,
        categoria: entrada.categoria,
        localizacao: entrada.localizacao ?? null,
        videoUrl: entrada.video?.url ?? null,
        videoTitulo: entrada.video?.titulo ?? null,
        imagemUrl: entrada.imagem ?? null,
        hipotese: entrada.teoria.hipotese,
        perguntaCentral: entrada.teoria.perguntaCentral,
        argumentosFavoraveis: entrada.teoria.argumentosFavoraveis,
        fontes: entrada.teoria.fontes,
        autorId: autor.id,
        criadoEm: agora,
        atualizadoEm: agora,
      })
      .returning({ id: investigacoes.id });
    if (entrada.tags.length > 0) {
      await tx.insert(investigacaoTags).values(entrada.tags.map((tagId) => ({ investigacaoId: criada.id, tagId })));
    }
    await registrarHistorico(tx, criada.id, autor.id, "criada", "Investigação criada", "A investigação foi aberta pelo responsável.", agora);
    return novoSlug;
  });

  return obterInvestigacao(comVisitante(deps, autor), slug);
}

// Verificação prévia (fora da transação): 404 se não existe, 403 se não é o responsável.
async function exigirResponsavel(db: Banco, slug: string, usuarioId: string) {
  const linha = await buscarLinha(db, slug);
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);
  if (linha.inv.autorId !== usuarioId) throw new ErroApi("sem_permissao", "Só o responsável pode gerenciar esta investigação.");
}

// Trava a linha até o fim da transação: duas mudanças simultâneas na mesma investigação se enfileiram.
async function travarLinha(tx: Executor, slug: string, usuarioId: string) {
  const [travada] = await tx.select().from(investigacoes).where(eq(investigacoes.slug, slug)).for("update");
  if (!travada) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);
  if (travada.autorId !== usuarioId) throw new ErroApi("sem_permissao", "Só o responsável pode gerenciar esta investigação.");
  return travada;
}

const ROTULO_CAMPO_TEORIA = {
  hipotese: "hipótese",
  argumentosFavoraveis: "argumentos favoráveis",
  perguntaCentral: "pergunta central",
  fontes: "fontes",
} as const;

const mesmaLista = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

// Edição parcial. Só grava (e só avança `atualizado_em`) o que de fato mudou; reenviar os mesmos valores é
// um no-op. A mudança em campos da teoria gera um registro de histórico com os NOMES dos campos, nunca o texto.
export async function editarInvestigacao(
  deps: DependenciasInvestigacoes,
  usuario: Autor,
  slug: string,
  entrada: EntradaEditarInvestigacao,
): Promise<InvestigacaoDetalhePublico> {
  const agora = deps.agora();
  await exigirResponsavel(deps.db, slug, usuario.id);
  await consumirLimite(deps.db, LIMITES.investigacaoMutarMembro, usuario.id, agora);

  await deps.db.transaction(async (tx) => {
    const atual = await travarLinha(tx, slug, usuario.id);
    const mudancas: Partial<typeof investigacoes.$inferInsert> = {};

    if (entrada.titulo !== undefined && entrada.titulo !== atual.titulo) mudancas.titulo = entrada.titulo;
    if (entrada.descricao !== undefined && entrada.descricao !== atual.descricao) mudancas.descricao = entrada.descricao;
    if (entrada.categoria !== undefined && entrada.categoria !== atual.categoria) mudancas.categoria = entrada.categoria;
    if (entrada.localizacao !== undefined && entrada.localizacao !== atual.localizacao) mudancas.localizacao = entrada.localizacao;
    if (entrada.imagem !== undefined && entrada.imagem !== atual.imagemUrl) mudancas.imagemUrl = entrada.imagem;
    if (entrada.video !== undefined) {
      const url = entrada.video?.url ?? null;
      const titulo = entrada.video?.titulo ?? null;
      if (url !== atual.videoUrl || titulo !== atual.videoTitulo) {
        mudancas.videoUrl = url;
        mudancas.videoTitulo = titulo;
      }
    }

    const camposTeoria: string[] = [];
    const t = entrada.teoria;
    if (t?.hipotese !== undefined && t.hipotese !== atual.hipotese) {
      mudancas.hipotese = t.hipotese;
      camposTeoria.push(ROTULO_CAMPO_TEORIA.hipotese);
    }
    if (t?.perguntaCentral !== undefined && t.perguntaCentral !== atual.perguntaCentral) {
      mudancas.perguntaCentral = t.perguntaCentral;
      camposTeoria.push(ROTULO_CAMPO_TEORIA.perguntaCentral);
    }
    if (t?.argumentosFavoraveis !== undefined && !mesmaLista(t.argumentosFavoraveis, atual.argumentosFavoraveis)) {
      mudancas.argumentosFavoraveis = t.argumentosFavoraveis;
      camposTeoria.push(ROTULO_CAMPO_TEORIA.argumentosFavoraveis);
    }
    if (t?.fontes !== undefined && !mesmaLista(t.fontes, atual.fontes)) {
      mudancas.fontes = t.fontes;
      camposTeoria.push(ROTULO_CAMPO_TEORIA.fontes);
    }

    let tagsMudaram = false;
    if (entrada.tags !== undefined) {
      const existentes = (await tx.select().from(investigacaoTags).where(eq(investigacaoTags.investigacaoId, atual.id))).map((l) => l.tagId);
      tagsMudaram = !(entrada.tags.length === existentes.length && entrada.tags.every((id) => existentes.includes(id)));
    }

    if (Object.keys(mudancas).length === 0 && !tagsMudaram) return;

    await tx.update(investigacoes).set({ ...mudancas, atualizadoEm: agora }).where(eq(investigacoes.id, atual.id));
    if (tagsMudaram && entrada.tags) {
      await tx.delete(investigacaoTags).where(eq(investigacaoTags.investigacaoId, atual.id));
      if (entrada.tags.length > 0) {
        await tx.insert(investigacaoTags).values(entrada.tags.map((tagId) => ({ investigacaoId: atual.id, tagId })));
      }
    }
    if (camposTeoria.length > 0) {
      await registrarHistorico(tx, atual.id, usuario.id, "teoria", "Teoria atualizada", `Campos alterados: ${camposTeoria.join(", ")}.`, agora);
    }
  });

  return obterInvestigacao(comVisitante(deps, usuario), slug);
}

// Mudança de `estado` (eixo do detalhe). Qualquer transição entre os quatro valores é aceita (sem regra
// editorial inventada). Repetir o estado atual é um no-op: não grava histórico nem altera `atualizado_em`.
export async function mudarEstado(
  deps: DependenciasInvestigacoes,
  usuario: Autor,
  slug: string,
  estado: EstadoInvestigacao,
): Promise<InvestigacaoDetalhePublico> {
  const agora = deps.agora();
  await exigirResponsavel(deps.db, slug, usuario.id);
  await consumirLimite(deps.db, LIMITES.investigacaoMutarMembro, usuario.id, agora);

  await deps.db.transaction(async (tx) => {
    const atual = await travarLinha(tx, slug, usuario.id);
    if (atual.estado === estado) return;
    await tx.update(investigacoes).set({ estado, atualizadoEm: agora }).where(eq(investigacoes.id, atual.id));
    await registrarHistorico(tx, atual.id, usuario.id, "estado", "Estado alterado", `De ${atual.estado} para ${estado}.`, agora);
  });

  return obterInvestigacao(comVisitante(deps, usuario), slug);
}

// Encerrar altera SOMENTE `encerrada_pelo_autor` (falso para verdadeiro) e `atualizado_em`, e grava um
// registro de histórico. Nunca altera `status` nem `estado` e não existe "reabrir". Repetir a chamada é um
// no-op: não duplica o histórico, não muda `atualizado_em` e responde 200 com o estado atual.
export async function encerrarInvestigacao(
  deps: DependenciasInvestigacoes,
  usuario: Autor,
  slug: string,
): Promise<InvestigacaoDetalhePublico> {
  const agora = deps.agora();
  await exigirResponsavel(deps.db, slug, usuario.id);
  await consumirLimite(deps.db, LIMITES.investigacaoMutarMembro, usuario.id, agora);

  await deps.db.transaction(async (tx) => {
    const atual = await travarLinha(tx, slug, usuario.id);
    if (atual.encerradaPeloAutor) return;
    await tx.update(investigacoes).set({ encerradaPeloAutor: true, atualizadoEm: agora }).where(eq(investigacoes.id, atual.id));
    await registrarHistorico(
      tx,
      atual.id,
      usuario.id,
      "encerrada",
      "Investigação encerrada pelo autor",
      "O responsável encerrou a investigação. Isso não confirma nem refuta a teoria.",
      agora,
    );
  });

  return obterInvestigacao(comVisitante(deps, usuario), slug);
}
