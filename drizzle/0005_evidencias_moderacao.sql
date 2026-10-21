CREATE TABLE "evidencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investigacao_id" uuid NOT NULL,
	"autor_id" uuid NOT NULL,
	"origem" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text NOT NULL,
	"fonte" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"decidida_por_id" uuid,
	"decidida_em" timestamp with time zone,
	"motivo_recusa" text,
	"relacionada_a_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidencias_id_investigacao_unique" UNIQUE("id","investigacao_id"),
	CONSTRAINT "evidencias_origem_valida" CHECK ("evidencias"."origem" in ('imagem_propria', 'imagem_terceiro', 'referencia_textual', 'origem_nao_verificada')),
	CONSTRAINT "evidencias_status_valido" CHECK ("evidencias"."status" in ('pendente', 'aceita', 'recusada')),
	CONSTRAINT "evidencias_titulo_tamanho" CHECK (char_length("evidencias"."titulo") between 3 and 120),
	CONSTRAINT "evidencias_descricao_tamanho" CHECK (char_length("evidencias"."descricao") between 10 and 1000),
	CONSTRAINT "evidencias_fonte_tamanho" CHECK ("evidencias"."fonte" is null or char_length("evidencias"."fonte") between 1 and 300),
	CONSTRAINT "evidencias_motivo_tamanho" CHECK ("evidencias"."motivo_recusa" is null or char_length("evidencias"."motivo_recusa") between 1 and 300),
	CONSTRAINT "evidencias_decisao_coerente" CHECK (("evidencias"."status" = 'pendente' and "evidencias"."decidida_por_id" is null and "evidencias"."decidida_em" is null and "evidencias"."motivo_recusa" is null)
        or ("evidencias"."status" = 'aceita' and "evidencias"."decidida_por_id" is not null and "evidencias"."decidida_em" is not null and "evidencias"."motivo_recusa" is null)
        or ("evidencias"."status" = 'recusada' and "evidencias"."decidida_por_id" is not null and "evidencias"."decidida_em" is not null)),
	CONSTRAINT "evidencias_sem_autorrelacionamento" CHECK ("evidencias"."relacionada_a_id" is null or "evidencias"."relacionada_a_id" <> "evidencias"."id")
);
--> statement-breakpoint
CREATE TABLE "auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ator_id" uuid,
	"ator_rotulo" text,
	"acao" text NOT NULL,
	"alvo_tipo" text NOT NULL,
	"alvo_id" uuid NOT NULL,
	"antes" jsonb,
	"depois" jsonb,
	"motivo" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auditoria_acao_valida" CHECK ("auditoria"."acao" in ('investigacao.status', 'evidencia.aceitar', 'evidencia.recusar', 'usuario.papel', 'admin.bootstrap')),
	CONSTRAINT "auditoria_alvo_valido" CHECK ("auditoria"."alvo_tipo" in ('investigacao', 'evidencia', 'usuario')),
	CONSTRAINT "auditoria_ator_definido" CHECK ("auditoria"."ator_id" is not null or "auditoria"."ator_rotulo" is not null),
	CONSTRAINT "auditoria_motivo_tamanho" CHECK ("auditoria"."motivo" is null or char_length("auditoria"."motivo") between 1 and 300)
);
--> statement-breakpoint
ALTER TABLE "investigacao_historico" DROP CONSTRAINT "investigacao_historico_tipo_valido";--> statement-breakpoint
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_investigacao_id_investigacoes_id_fk" FOREIGN KEY ("investigacao_id") REFERENCES "public"."investigacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_decidida_por_id_usuarios_id_fk" FOREIGN KEY ("decidida_por_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_relacionada_mesma_investigacao_fk" FOREIGN KEY ("relacionada_a_id","investigacao_id") REFERENCES "public"."evidencias"("id","investigacao_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_ator_id_usuarios_id_fk" FOREIGN KEY ("ator_id") REFERENCES "public"."usuarios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidencias_investigacao_ordem_idx" ON "evidencias" USING btree ("investigacao_id","status","criado_em","id");--> statement-breakpoint
CREATE INDEX "evidencias_autor_idx" ON "evidencias" USING btree ("autor_id","criado_em","id");--> statement-breakpoint
CREATE INDEX "evidencias_decisor_idx" ON "evidencias" USING btree ("decidida_por_id");--> statement-breakpoint
CREATE INDEX "auditoria_ordem_idx" ON "auditoria" USING btree ("criado_em" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "auditoria_alvo_idx" ON "auditoria" USING btree ("alvo_tipo","alvo_id");--> statement-breakpoint
CREATE INDEX "auditoria_acao_idx" ON "auditoria" USING btree ("acao");--> statement-breakpoint
CREATE INDEX "auditoria_ator_idx" ON "auditoria" USING btree ("ator_id");--> statement-breakpoint
ALTER TABLE "investigacao_historico" ADD CONSTRAINT "investigacao_historico_tipo_valido" CHECK ("investigacao_historico"."tipo" in ('criada', 'teoria', 'estado', 'encerrada', 'evidencia', 'status'));--> statement-breakpoint
-- Auditoria append-only (Tarefa 7): o banco recusa UPDATE, DELETE e TRUNCATE, mesmo fora das rotas HTTP.
-- Escrito à mão (o drizzle-kit não gera gatilhos), como o catálogo de tags da migração 0002.
CREATE FUNCTION "auditoria_imutavel"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'A tabela auditoria é append-only: % não é permitido.', TG_OP USING ERRCODE = 'restrict_violation';
END;
$$;--> statement-breakpoint
CREATE TRIGGER "auditoria_sem_alteracao" BEFORE UPDATE OR DELETE ON "auditoria" FOR EACH ROW EXECUTE FUNCTION "auditoria_imutavel"();--> statement-breakpoint
CREATE TRIGGER "auditoria_sem_truncate" BEFORE TRUNCATE ON "auditoria" FOR EACH STATEMENT EXECUTE FUNCTION "auditoria_imutavel"();
