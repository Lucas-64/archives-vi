import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usuarios } from "./usuarios";

// Mistério: postagem simples (título, descrição, imagem ou vídeo) à qual investigações podem se vincular
// (opcionalmente, via `investigacoes.misterio_id`). Os valores são os ids de src/constants/classificacoesMisterio.ts;
// a classificação é coluna, não mais derivada de `status` da investigação.
export const CLASSIFICACOES_MISTERIO_API = ["em-andamento", "resolvido", "easter-egg", "curiosidade"] as const;
export type ClassificacaoMisterioApi = (typeof CLASSIFICACOES_MISTERIO_API)[number];

// `oculto` sai de toda leitura pública (moderação futura); nasce `publicado`.
export const STATUS_MISTERIO = ["publicado", "oculto"] as const;
export type StatusMisterio = (typeof STATUS_MISTERIO)[number];

const lista = (valores: readonly string[]) => sql.raw(valores.map((v) => `'${v}'`).join(", "));

export const misterios = pgTable(
  "misterios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull(),
    classificacao: text("classificacao", { enum: CLASSIFICACOES_MISTERIO_API }).notNull().default("em-andamento"),
    // Endereço (https) da imagem enviada. Nulo: a leitura usa a imagem padrão, que nunca é gravada.
    imagemUrl: text("imagem_url"),
    videoUrl: text("video_url"),
    videoTitulo: text("video_titulo"),
    status: text("status", { enum: STATUS_MISTERIO }).notNull().default("publicado"),
    autorId: uuid("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "restrict" }),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("misterios_slug_formato", sql`${tabela.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(${tabela.slug}) <= 80`),
    check("misterios_titulo_tamanho", sql`char_length(${tabela.titulo}) between 3 and 120`),
    check("misterios_descricao_tamanho", sql`char_length(${tabela.descricao}) between 20 and 500`),
    check("misterios_classificacao_valida", sql`${tabela.classificacao} in (${lista(CLASSIFICACOES_MISTERIO_API)})`),
    check("misterios_status_valido", sql`${tabela.status} in (${lista(STATUS_MISTERIO)})`),
    check("misterios_imagem_tamanho", sql`${tabela.imagemUrl} is null or char_length(${tabela.imagemUrl}) <= 400`),
    check("misterios_video_tamanho", sql`(${tabela.videoUrl} is null or char_length(${tabela.videoUrl}) <= 200) and (${tabela.videoTitulo} is null or char_length(${tabela.videoTitulo}) between 1 and 120)`),
    index("misterios_ordem_idx").on(tabela.atualizadoEm.desc(), tabela.id.desc()),
    index("misterios_autor_idx").on(tabela.autorId),
    index("misterios_classificacao_idx").on(tabela.classificacao),
  ],
);

export type MisterioLinha = typeof misterios.$inferSelect;
