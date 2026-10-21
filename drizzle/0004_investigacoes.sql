CREATE TABLE "investigacao_historico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investigacao_id" uuid NOT NULL,
	"autor_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "investigacao_historico_tipo_valido" CHECK ("investigacao_historico"."tipo" in ('criada', 'teoria', 'estado', 'encerrada'))
);
--> statement-breakpoint
CREATE TABLE "investigacao_tags" (
	"investigacao_id" uuid NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "investigacao_tags_investigacao_id_tag_id_pk" PRIMARY KEY("investigacao_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "investigacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text NOT NULL,
	"categoria" text NOT NULL,
	"status" text DEFAULT 'investigating' NOT NULL,
	"estado" text DEFAULT 'em_andamento' NOT NULL,
	"encerrada_pelo_autor" boolean DEFAULT false NOT NULL,
	"localizacao" text,
	"video_url" text,
	"video_titulo" text,
	"hipotese" text NOT NULL,
	"pergunta_central" text NOT NULL,
	"argumentos_favoraveis" text[] DEFAULT '{}'::text[] NOT NULL,
	"fontes" text[] DEFAULT '{}'::text[] NOT NULL,
	"autor_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "investigacoes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "investigacoes_slug_formato" CHECK ("investigacoes"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("investigacoes"."slug") <= 80),
	CONSTRAINT "investigacoes_titulo_tamanho" CHECK (char_length("investigacoes"."titulo") between 3 and 120),
	CONSTRAINT "investigacoes_descricao_tamanho" CHECK (char_length("investigacoes"."descricao") between 20 and 500),
	CONSTRAINT "investigacoes_categoria_valida" CHECK ("investigacoes"."categoria" in ('sighting', 'location', 'symbol', 'broadcast', 'phenomenon', 'community-discovery')),
	CONSTRAINT "investigacoes_status_valido" CHECK ("investigacoes"."status" in ('investigating', 'confirmed', 'debunked', 'classified', 'community')),
	CONSTRAINT "investigacoes_estado_valido" CHECK ("investigacoes"."estado" in ('em_andamento', 'teoria_apoiada', 'contestada', 'inconclusiva')),
	CONSTRAINT "investigacoes_localizacao_tamanho" CHECK ("investigacoes"."localizacao" is null or char_length("investigacoes"."localizacao") between 1 and 80),
	CONSTRAINT "investigacoes_video_tamanho" CHECK (("investigacoes"."video_url" is null or char_length("investigacoes"."video_url") <= 200) and ("investigacoes"."video_titulo" is null or char_length("investigacoes"."video_titulo") between 1 and 120)),
	CONSTRAINT "investigacoes_hipotese_tamanho" CHECK (char_length("investigacoes"."hipotese") between 20 and 2000),
	CONSTRAINT "investigacoes_pergunta_tamanho" CHECK (char_length("investigacoes"."pergunta_central") between 5 and 300),
	CONSTRAINT "investigacoes_listas_tamanho" CHECK (cardinality("investigacoes"."argumentos_favoraveis") <= 10 and cardinality("investigacoes"."fontes") <= 10)
);
--> statement-breakpoint
ALTER TABLE "investigacao_historico" ADD CONSTRAINT "investigacao_historico_investigacao_id_investigacoes_id_fk" FOREIGN KEY ("investigacao_id") REFERENCES "public"."investigacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigacao_historico" ADD CONSTRAINT "investigacao_historico_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigacao_tags" ADD CONSTRAINT "investigacao_tags_investigacao_id_investigacoes_id_fk" FOREIGN KEY ("investigacao_id") REFERENCES "public"."investigacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigacao_tags" ADD CONSTRAINT "investigacao_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigacoes" ADD CONSTRAINT "investigacoes_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "investigacao_historico_ordem_idx" ON "investigacao_historico" USING btree ("investigacao_id","criado_em" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "investigacao_tags_tag_idx" ON "investigacao_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "investigacoes_ordem_idx" ON "investigacoes" USING btree ("atualizado_em" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "investigacoes_autor_idx" ON "investigacoes" USING btree ("autor_id");--> statement-breakpoint
CREATE INDEX "investigacoes_categoria_idx" ON "investigacoes" USING btree ("categoria");