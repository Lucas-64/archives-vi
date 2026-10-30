import { sql } from "drizzle-orm";
import { boolean, check, index, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { tags } from "./tags";
import { usuarios } from "./usuarios";

// Valores reais do front (src/components/ui/StatusBadge e src/types). Não há enum novo: `status` é o eixo
// da listagem (ADR-009) e `estado` é o eixo do detalhe. `community` e `classified` não têm significado
// definido; são aceitos como valores opacos.
export const CATEGORIAS_INVESTIGACAO = ["sighting", "location", "symbol", "broadcast", "phenomenon", "community-discovery"] as const;
export type CategoriaInvestigacao = (typeof CATEGORIAS_INVESTIGACAO)[number];

export const STATUS_INVESTIGACAO = ["investigating", "confirmed", "debunked", "classified", "community"] as const;
export type StatusInvestigacao = (typeof STATUS_INVESTIGACAO)[number];

export const ESTADOS_INVESTIGACAO = ["em_andamento", "teoria_apoiada", "contestada", "inconclusiva"] as const;
export type EstadoInvestigacao = (typeof ESTADOS_INVESTIGACAO)[number];

// `evidencia` e `status` são entradas públicas da Tarefa 7 (evidência aceita; status alterado pela moderação).
export const TIPOS_HISTORICO = ["criada", "teoria", "estado", "encerrada", "evidencia", "status"] as const;
export type TipoHistorico = (typeof TIPOS_HISTORICO)[number];

const lista = (valores: readonly string[]) => sql.raw(valores.map((v) => `'${v}'`).join(", "));

export const investigacoes = pgTable(
  "investigacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull(),
    categoria: text("categoria", { enum: CATEGORIAS_INVESTIGACAO }).notNull(),
    // Eixo da listagem. Nasce `investigating` e nenhuma rota da Tarefa 6 o altera (moderação, Tarefa 7).
    status: text("status", { enum: STATUS_INVESTIGACAO }).notNull().default("investigating"),
    // Eixo do detalhe, alterado pelo responsável.
    estado: text("estado", { enum: ESTADOS_INVESTIGACAO }).notNull().default("em_andamento"),
    // Marcador do responsável. Só vai de falso para verdadeiro e nunca toca `status`.
    encerradaPeloAutor: boolean("encerrada_pelo_autor").notNull().default(false),
    localizacao: text("localizacao"),
    videoUrl: text("video_url"),
    videoTitulo: text("video_titulo"),
    // Endereço (https) da imagem de capa enviada por quem criou. Nulo: a leitura usa a imagem padrão, que nunca é gravada.
    imagemUrl: text("imagem_url"),
    hipotese: text("hipotese").notNull(),
    perguntaCentral: text("pergunta_central").notNull(),
    argumentosFavoraveis: text("argumentos_favoraveis").array().notNull().default(sql`'{}'::text[]`),
    fontes: text("fontes").array().notNull().default(sql`'{}'::text[]`),
    autorId: uuid("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("investigacoes_slug_formato", sql`${tabela.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(${tabela.slug}) <= 80`),
    check("investigacoes_titulo_tamanho", sql`char_length(${tabela.titulo}) between 3 and 120`),
    check("investigacoes_descricao_tamanho", sql`char_length(${tabela.descricao}) between 20 and 500`),
    check("investigacoes_categoria_valida", sql`${tabela.categoria} in (${lista(CATEGORIAS_INVESTIGACAO)})`),
    check("investigacoes_status_valido", sql`${tabela.status} in (${lista(STATUS_INVESTIGACAO)})`),
    check("investigacoes_estado_valido", sql`${tabela.estado} in (${lista(ESTADOS_INVESTIGACAO)})`),
    check("investigacoes_localizacao_tamanho", sql`${tabela.localizacao} is null or char_length(${tabela.localizacao}) between 1 and 80`),
    check("investigacoes_imagem_tamanho", sql`${tabela.imagemUrl} is null or char_length(${tabela.imagemUrl}) <= 400`),
    check("investigacoes_video_tamanho", sql`(${tabela.videoUrl} is null or char_length(${tabela.videoUrl}) <= 200) and (${tabela.videoTitulo} is null or char_length(${tabela.videoTitulo}) between 1 and 120)`),
    check("investigacoes_hipotese_tamanho", sql`char_length(${tabela.hipotese}) between 20 and 2000`),
    check("investigacoes_pergunta_tamanho", sql`char_length(${tabela.perguntaCentral}) between 5 and 300`),
    // O tamanho de cada item é validado pela aplicação (CHECK não aceita subconsulta).
    check("investigacoes_listas_tamanho", sql`cardinality(${tabela.argumentosFavoraveis}) <= 10 and cardinality(${tabela.fontes}) <= 10`),
    index("investigacoes_ordem_idx").on(tabela.atualizadoEm.desc(), tabela.id.desc()),
    index("investigacoes_autor_idx").on(tabela.autorId),
    index("investigacoes_categoria_idx").on(tabela.categoria),
  ],
);

export const investigacaoTags = pgTable(
  "investigacao_tags",
  {
    investigacaoId: uuid("investigacao_id")
      .notNull()
      .references(() => investigacoes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict" }),
  },
  (tabela) => [primaryKey({ columns: [tabela.investigacaoId, tabela.tagId] }), index("investigacao_tags_tag_idx").on(tabela.tagId)],
);

// Histórico gravado só pelo servidor. O resumo cita nomes de campos, nunca o texto da teoria.
export const investigacaoHistorico = pgTable(
  "investigacao_historico",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    investigacaoId: uuid("investigacao_id")
      .notNull()
      .references(() => investigacoes.id, { onDelete: "cascade" }),
    autorId: uuid("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    tipo: text("tipo", { enum: TIPOS_HISTORICO }).notNull(),
    titulo: text("titulo").notNull(),
    resumo: text("resumo").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("investigacao_historico_tipo_valido", sql`${tabela.tipo} in (${lista(TIPOS_HISTORICO)})`),
    index("investigacao_historico_ordem_idx").on(tabela.investigacaoId, tabela.criadoEm.desc(), tabela.id.desc()),
  ],
);

// Publicações e investigações dividem o espaço de slugs (ver servicos/slugs.ts).
export type InvestigacaoLinha = typeof investigacoes.$inferSelect;
