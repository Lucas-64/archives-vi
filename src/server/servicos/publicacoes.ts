import { and, asc, desc, eq, inArray, sql, type SQL } from "drizzle-orm";

import { consumirLimite, LIMITES } from "../auth/limiteTaxa";
import type {
  CursorPublicacoes,
  EntradaCriarPublicacao,
  PublicacaoPublica,
} from "../contracts/publicacoes";
import type { Banco } from "../db/cliente";
import { IDS_TAGS, comentarios, curtidas, publicacaoTags, publicacaoTermos, publicacoes, usuarios } from "../db/esquema";
import { codigoPg } from "../db/erros";
import { ErroApi } from "../http/erros";
import { fatiarPagina, type Pagina } from "../http/paginacao";
import { diaLocal } from "../publicacoes/data";
import { resumoDoCorpo } from "../publicacoes/resumo";
import { escolherSlugLivre } from "./slugs";

export interface DependenciasPublicacoes {
  db: Banco;
  agora: () => Date;
  // Membro autenticado que lê, se houver (define `euCurti`). Visitante: ausente.
  visitanteId?: string;
}

export interface FiltrosPublicacoes {
  tipo?: "teoria" | "investigacao";
  tag?: string;
  autor?: string;
}

const MENSAGEM_NAO_ENCONTRADA = "Publicação não encontrada.";

// Instante com microssegundos em UTC, para o cursor não perder precisão (o driver devolve Date em ms).
const criadoEmTexto = sql<string>`to_char(${publicacoes.criadoEm} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

const colunas = {
  id: publicacoes.id,
  slug: publicacoes.slug,
  titulo: publicacoes.titulo,
  resumo: publicacoes.resumo,
  corpo: publicacoes.corpo,
  tipo: publicacoes.tipo,
  data: publicacoes.data,
  autorNome: usuarios.nome,
  autorUsuario: usuarios.usuario,
  criadoEmTexto,
};

type LinhaPublicacao = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  corpo: string | null;
  tipo: "teoria" | "investigacao";
  data: string;
  autorNome: string;
  autorUsuario: string;
  criadoEmTexto: string;
};

const ordem = [desc(publicacoes.data), desc(publicacoes.criadoEm), desc(publicacoes.id)] as const;

// Junta temas (na ordem do catálogo) e termos (na ordem em que foram gravados) às linhas.
async function montar(db: Banco, linhas: LinhaPublicacao[], visitanteId?: string): Promise<PublicacaoPublica[]> {
  if (linhas.length === 0) return [];
  const ids = linhas.map((linha) => linha.id);

  const [temas, termos, totaisComentarios, totaisCurtidas, minhasCurtidas] = await Promise.all([
    db.select().from(publicacaoTags).where(inArray(publicacaoTags.publicacaoId, ids)),
    db
      .select()
      .from(publicacaoTermos)
      .where(inArray(publicacaoTermos.publicacaoId, ids))
      .orderBy(asc(publicacaoTermos.publicacaoId), asc(publicacaoTermos.ordem)),
    db
      .select({ id: comentarios.publicacaoId, total: sql<number>`count(*)::int` })
      .from(comentarios)
      .where(inArray(comentarios.publicacaoId, ids))
      .groupBy(comentarios.publicacaoId),
    db
      .select({ id: curtidas.publicacaoId, total: sql<number>`count(*)::int` })
      .from(curtidas)
      .where(inArray(curtidas.publicacaoId, ids))
      .groupBy(curtidas.publicacaoId),
    visitanteId
      ? db
          .select({ id: curtidas.publicacaoId })
          .from(curtidas)
          .where(and(inArray(curtidas.publicacaoId, ids), eq(curtidas.usuarioId, visitanteId)))
      : Promise.resolve([] as { id: string }[]),
  ]);
  const numComentarios = new Map(totaisComentarios.map((t) => [t.id, t.total]));
  const numCurtidas = new Map(totaisCurtidas.map((t) => [t.id, t.total]));
  const curtidasDoVisitante = new Set(minhasCurtidas.map((c) => c.id));

  return linhas.map((linha) => ({
    id: linha.id,
    slug: linha.slug,
    titulo: linha.titulo,
    resumo: linha.resumo,
    corpo: linha.corpo,
    tipo: linha.tipo,
    autor: { nome: linha.autorNome, usuario: linha.autorUsuario },
    data: linha.data,
    tags: temas
      .filter((tema) => tema.publicacaoId === linha.id)
      .map((tema) => tema.tagId)
      .sort((a, b) => IDS_TAGS.indexOf(a as never) - IDS_TAGS.indexOf(b as never)),
    termos: termos.filter((termo) => termo.publicacaoId === linha.id).map((termo) => termo.termo),
    comentarios: numComentarios.get(linha.id) ?? 0,
    curtidas: numCurtidas.get(linha.id) ?? 0,
    euCurti: curtidasDoVisitante.has(linha.id),
  }));
}

// Listagem em ordem estável: data, criado_em e id, todos decrescentes. O cursor guarda os três valores
// da última linha entregue e a próxima página usa comparação de tupla, então empates de data (ou de
// data e instante) nunca duplicam nem pulam registros.
export async function listarPublicacoes(
  deps: DependenciasPublicacoes,
  filtros: FiltrosPublicacoes,
  paginacao: { limite: number; cursor?: CursorPublicacoes },
): Promise<Pagina<PublicacaoPublica>> {
  const condicoes: SQL[] = [eq(publicacoes.status, "publicado")];
  if (filtros.tipo) condicoes.push(eq(publicacoes.tipo, filtros.tipo));
  if (filtros.autor) condicoes.push(eq(usuarios.usuario, filtros.autor));
  if (filtros.tag) {
    condicoes.push(
      sql`exists (select 1 from ${publicacaoTags} where ${publicacaoTags.publicacaoId} = ${publicacoes.id} and ${publicacaoTags.tagId} = ${filtros.tag})`,
    );
  }
  if (paginacao.cursor) {
    const c = paginacao.cursor;
    condicoes.push(
      sql`(${publicacoes.data}, ${publicacoes.criadoEm}, ${publicacoes.id}) < (${c.data}::date, ${c.criadoEm}::timestamptz, ${c.id}::uuid)`,
    );
  }

  let linhas: LinhaPublicacao[];
  try {
    linhas = await deps.db
      .select(colunas)
      .from(publicacoes)
      .innerJoin(usuarios, eq(usuarios.id, publicacoes.autorId))
      .where(and(...condicoes))
      .orderBy(...ordem)
      .limit(paginacao.limite + 1);
  } catch (erro) {
    // Cursor com formato certo, mas valor impossível (por exemplo 2026-02-31): erro de dados do PostgreSQL.
    if (paginacao.cursor && codigoPg(erro)?.startsWith("22")) {
      throw new ErroApi("requisicao_invalida", "Cursor inválido.");
    }
    throw erro;
  }

  const pagina = fatiarPagina(linhas, paginacao.limite, (ultima) => ({
    data: ultima.data,
    criadoEm: ultima.criadoEmTexto,
    id: ultima.id,
  }));
  return { itens: await montar(deps.db, pagina.itens, deps.visitanteId), proximoCursor: pagina.proximoCursor };
}

async function buscarPorSlug(db: Banco, slug: string): Promise<LinhaPublicacao | undefined> {
  const [linha] = await db
    .select(colunas)
    .from(publicacoes)
    .innerJoin(usuarios, eq(usuarios.id, publicacoes.autorId))
    .where(and(eq(publicacoes.slug, slug), eq(publicacoes.status, "publicado")));
  return linha;
}

// Inexistente e oculta dão o mesmo 404: não se revela que uma publicação oculta existe.
export async function obterPublicacao(deps: DependenciasPublicacoes, slug: string): Promise<PublicacaoPublica> {
  const linha = await buscarPorSlug(deps.db, slug);
  if (!linha) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);
  return (await montar(deps.db, [linha], deps.visitanteId))[0];
}

export async function listarRelacionadas(
  deps: DependenciasPublicacoes,
  slug: string,
  limite: number,
): Promise<{ itens: PublicacaoPublica[] }> {
  const base = await buscarPorSlug(deps.db, slug);
  if (!base) throw new ErroApi("nao_encontrado", MENSAGEM_NAO_ENCONTRADA);

  const linhas = await deps.db
    .select(colunas)
    .from(publicacoes)
    .innerJoin(usuarios, eq(usuarios.id, publicacoes.autorId))
    .where(and(eq(publicacoes.status, "publicado"), eq(publicacoes.tipo, base.tipo), sql`${publicacoes.id} <> ${base.id}`))
    .orderBy(...ordem)
    .limit(limite);
  return { itens: await montar(deps.db, linhas, deps.visitanteId) };
}

// O autor vem da sessão (parâmetro `autor`), nunca do corpo da requisição. `tipo` é sempre teoria.
export async function criarPublicacao(
  deps: DependenciasPublicacoes,
  autor: { id: string; nome: string; usuario: string },
  entrada: EntradaCriarPublicacao,
): Promise<PublicacaoPublica> {
  const agora = deps.agora();
  // Contagem atômica antes de gravar: requisições simultâneas não passam do limite.
  await consumirLimite(deps.db, LIMITES.publicarMembro, autor.id, agora);

  // Slug escolhido e gravado na mesma transação, com a regra única de servicos/slugs.ts.
  const criada = await deps.db.transaction(async (tx) => {
    const slug = await escolherSlugLivre(tx, entrada.titulo);
    const [linha] = await tx
      .insert(publicacoes)
      .values({
        slug,
        titulo: entrada.titulo,
        resumo: resumoDoCorpo(entrada.corpo),
        corpo: entrada.corpo,
        tipo: "teoria",
        autorId: autor.id,
        data: diaLocal(agora),
        criadoEm: agora,
        atualizadoEm: agora,
      })
      .returning();
    return linha;
  });
  return {
    id: criada.id,
    slug: criada.slug,
    titulo: criada.titulo,
    resumo: criada.resumo,
    corpo: criada.corpo,
    tipo: criada.tipo,
    autor: { nome: autor.nome, usuario: autor.usuario },
    data: criada.data,
    tags: [],
    termos: [],
    comentarios: 0,
    curtidas: 0,
    euCurti: false,
  };
}
