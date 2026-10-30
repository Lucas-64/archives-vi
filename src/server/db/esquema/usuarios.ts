import { sql } from "drizzle-orm";
import { boolean, check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const PAPEIS = ["membro", "moderador", "admin"] as const;
export type Papel = (typeof PAPEIS)[number];

// `usuario` e `email` são guardados já normalizados (minúsculas). A unicidade sem diferenciar maiúsculas
// vem dessa normalização, imposta pelos CHECKs, e não de uma extensão do Postgres.
export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    usuario: text("usuario").notNull().unique(),
    email: text("email").notNull().unique(),
    senhaHash: text("senha_hash").notNull(),
    nome: text("nome").notNull(),
    bio: text("bio").notNull().default(""),
    // Avatar e banner do perfil (URL pública do Vercel Blob, ADR-043). Opcionais.
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    papel: text("papel", { enum: PAPEIS }).notNull().default("membro"),
    emailVerificadoEm: timestamp("email_verificado_em", { withTimezone: true }),
    // Registros do seed demonstrativo. Em produção a tabela nasce sem eles.
    demonstrativo: boolean("demonstrativo").notNull().default(false),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabela) => [
    check("usuarios_usuario_formato", sql`${tabela.usuario} ~ '^[a-z0-9_]{3,30}$'`),
    check("usuarios_email_formato", sql`${tabela.email} = lower(${tabela.email}) and ${tabela.email} ~ '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' and char_length(${tabela.email}) <= 254`),
    check("usuarios_nome_tamanho", sql`char_length(${tabela.nome}) between 1 and 60`),
    check("usuarios_avatar_tamanho", sql`${tabela.avatarUrl} is null or char_length(${tabela.avatarUrl}) <= 400`),
    check("usuarios_banner_tamanho", sql`${tabela.bannerUrl} is null or char_length(${tabela.bannerUrl}) <= 400`),
    check("usuarios_bio_tamanho", sql`char_length(${tabela.bio}) <= 240`),
    check("usuarios_papel_valido", sql`${tabela.papel} in ('membro', 'moderador', 'admin')`),
  ],
);

// Colunas seguras para consultas comuns. A senha nunca deve sair do módulo de autenticação.
export const colunasUsuarioSemSenha = {
  id: usuarios.id,
  usuario: usuarios.usuario,
  email: usuarios.email,
  nome: usuarios.nome,
  bio: usuarios.bio,
  avatarUrl: usuarios.avatarUrl,
  bannerUrl: usuarios.bannerUrl,
  papel: usuarios.papel,
  emailVerificadoEm: usuarios.emailVerificadoEm,
  demonstrativo: usuarios.demonstrativo,
  criadoEm: usuarios.criadoEm,
  atualizadoEm: usuarios.atualizadoEm,
};

export type Usuario = typeof usuarios.$inferSelect;
export type NovoUsuario = typeof usuarios.$inferInsert;
