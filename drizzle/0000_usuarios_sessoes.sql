CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"nome" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"papel" text DEFAULT 'membro' NOT NULL,
	"email_verificado_em" timestamp with time zone,
	"demonstrativo" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_usuario_unique" UNIQUE("usuario"),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email"),
	CONSTRAINT "usuarios_usuario_formato" CHECK ("usuarios"."usuario" ~ '^[a-z0-9_]{3,30}$'),
	CONSTRAINT "usuarios_email_formato" CHECK ("usuarios"."email" = lower("usuarios"."email") and "usuarios"."email" ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and char_length("usuarios"."email") <= 254),
	CONSTRAINT "usuarios_nome_tamanho" CHECK (char_length("usuarios"."nome") between 1 and 60),
	CONSTRAINT "usuarios_bio_tamanho" CHECK (char_length("usuarios"."bio") <= 240),
	CONSTRAINT "usuarios_papel_valido" CHECK ("usuarios"."papel" in ('membro', 'moderador', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"usuario_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"ultimo_uso_em" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"expira_absoluta_em" timestamp with time zone NOT NULL,
	"revogada_em" timestamp with time zone,
	"ip_hash" text,
	"agente" text,
	CONSTRAINT "sessoes_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessoes_usuario_idx" ON "sessoes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "sessoes_expira_idx" ON "sessoes" USING btree ("expira_em");