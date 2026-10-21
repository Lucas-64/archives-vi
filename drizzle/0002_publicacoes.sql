CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"rotulo" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publicacao_tags" (
	"publicacao_id" uuid NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "publicacao_tags_publicacao_id_tag_id_pk" PRIMARY KEY("publicacao_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "publicacao_termos" (
	"publicacao_id" uuid NOT NULL,
	"ordem" integer NOT NULL,
	"termo" text NOT NULL,
	CONSTRAINT "publicacao_termos_publicacao_id_ordem_pk" PRIMARY KEY("publicacao_id","ordem"),
	CONSTRAINT "publicacao_termos_tamanho" CHECK (char_length("publicacao_termos"."termo") between 1 and 60)
);
--> statement-breakpoint
CREATE TABLE "publicacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text NOT NULL,
	"corpo" text,
	"tipo" text NOT NULL,
	"autor_id" uuid NOT NULL,
	"data" date DEFAULT (timezone('America/Sao_Paulo', now()))::date NOT NULL,
	"status" text DEFAULT 'publicado' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publicacoes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "publicacoes_slug_formato" CHECK ("publicacoes"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("publicacoes"."slug") <= 80),
	CONSTRAINT "publicacoes_titulo_tamanho" CHECK (char_length("publicacoes"."titulo") between 3 and 120),
	CONSTRAINT "publicacoes_resumo_tamanho" CHECK (char_length("publicacoes"."resumo") between 1 and 200),
	CONSTRAINT "publicacoes_corpo_tamanho" CHECK ("publicacoes"."corpo" is null or char_length("publicacoes"."corpo") <= 2000),
	CONSTRAINT "publicacoes_tipo_valido" CHECK ("publicacoes"."tipo" in ('teoria', 'investigacao')),
	CONSTRAINT "publicacoes_status_valido" CHECK ("publicacoes"."status" in ('publicado', 'oculto'))
);
--> statement-breakpoint
ALTER TABLE "publicacao_tags" ADD CONSTRAINT "publicacao_tags_publicacao_id_publicacoes_id_fk" FOREIGN KEY ("publicacao_id") REFERENCES "public"."publicacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicacao_tags" ADD CONSTRAINT "publicacao_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicacao_termos" ADD CONSTRAINT "publicacao_termos_publicacao_id_publicacoes_id_fk" FOREIGN KEY ("publicacao_id") REFERENCES "public"."publicacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publicacoes" ADD CONSTRAINT "publicacoes_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "publicacao_tags_tag_idx" ON "publicacao_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "publicacoes_ordem_idx" ON "publicacoes" USING btree ("data" DESC NULLS LAST,"criado_em" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "publicacoes_autor_idx" ON "publicacoes" USING btree ("autor_id");--> statement-breakpoint
CREATE INDEX "publicacoes_tipo_idx" ON "publicacoes" USING btree ("tipo");
--> statement-breakpoint
-- Dados de referência: catálogo fechado de temas (ADR-018).
INSERT INTO "tags" ("id", "rotulo") VALUES
	('ovnis-extraterrestres', 'OVNIs e extraterrestres'),
	('criaturas-lendas', 'Criaturas e lendas'),
	('easter-eggs-segredos', 'Easter eggs e segredos'),
	('simbolos-mensagens', 'Símbolos e mensagens'),
	('audio-transmissoes', 'Áudio e transmissões'),
	('locais-mapas', 'Locais e mapas'),
	('crimes-acontecimentos', 'Crimes e acontecimentos'),
	('teorias-conexoes', 'Teorias e conexões');
