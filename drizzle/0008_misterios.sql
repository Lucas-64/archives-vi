CREATE TABLE "misterios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text NOT NULL,
	"classificacao" text DEFAULT 'em-andamento' NOT NULL,
	"imagem_url" text,
	"video_url" text,
	"video_titulo" text,
	"status" text DEFAULT 'publicado' NOT NULL,
	"autor_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "misterios_slug_unique" UNIQUE("slug"),
	CONSTRAINT "misterios_slug_formato" CHECK ("misterios"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("misterios"."slug") <= 80),
	CONSTRAINT "misterios_titulo_tamanho" CHECK (char_length("misterios"."titulo") between 3 and 120),
	CONSTRAINT "misterios_descricao_tamanho" CHECK (char_length("misterios"."descricao") between 20 and 500),
	CONSTRAINT "misterios_classificacao_valida" CHECK ("misterios"."classificacao" in ('em-andamento', 'resolvido', 'easter-egg', 'curiosidade')),
	CONSTRAINT "misterios_status_valido" CHECK ("misterios"."status" in ('publicado', 'oculto')),
	CONSTRAINT "misterios_imagem_tamanho" CHECK ("misterios"."imagem_url" is null or char_length("misterios"."imagem_url") <= 400),
	CONSTRAINT "misterios_video_tamanho" CHECK (("misterios"."video_url" is null or char_length("misterios"."video_url") <= 200) and ("misterios"."video_titulo" is null or char_length("misterios"."video_titulo") between 1 and 120))
);
--> statement-breakpoint
ALTER TABLE "investigacoes" ADD COLUMN "misterio_id" uuid;--> statement-breakpoint
ALTER TABLE "misterios" ADD CONSTRAINT "misterios_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "misterios_ordem_idx" ON "misterios" USING btree ("atualizado_em" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "misterios_autor_idx" ON "misterios" USING btree ("autor_id");--> statement-breakpoint
CREATE INDEX "misterios_classificacao_idx" ON "misterios" USING btree ("classificacao");--> statement-breakpoint
ALTER TABLE "investigacoes" ADD CONSTRAINT "investigacoes_misterio_id_misterios_id_fk" FOREIGN KEY ("misterio_id") REFERENCES "public"."misterios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "investigacoes_misterio_idx" ON "investigacoes" USING btree ("misterio_id","atualizado_em" DESC NULLS LAST,"id" DESC NULLS LAST);