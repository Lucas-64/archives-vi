CREATE TABLE "investigacao_curtidas" (
	"investigacao_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "investigacao_curtidas_investigacao_id_usuario_id_pk" PRIMARY KEY("investigacao_id","usuario_id")
);
--> statement-breakpoint
ALTER TABLE "comentarios" ALTER COLUMN "publicacao_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comentarios" ADD COLUMN "misterio_id" uuid;--> statement-breakpoint
ALTER TABLE "comentarios" ADD COLUMN "investigacao_id" uuid;--> statement-breakpoint
ALTER TABLE "investigacao_curtidas" ADD CONSTRAINT "investigacao_curtidas_investigacao_id_investigacoes_id_fk" FOREIGN KEY ("investigacao_id") REFERENCES "public"."investigacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigacao_curtidas" ADD CONSTRAINT "investigacao_curtidas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "investigacao_curtidas_usuario_idx" ON "investigacao_curtidas" USING btree ("usuario_id");--> statement-breakpoint
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_misterio_id_misterios_id_fk" FOREIGN KEY ("misterio_id") REFERENCES "public"."misterios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_investigacao_id_investigacoes_id_fk" FOREIGN KEY ("investigacao_id") REFERENCES "public"."investigacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comentarios_misterio_ordem_idx" ON "comentarios" USING btree ("misterio_id","criado_em","id");--> statement-breakpoint
CREATE INDEX "comentarios_investigacao_ordem_idx" ON "comentarios" USING btree ("investigacao_id","criado_em","id");--> statement-breakpoint
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_um_alvo" CHECK (num_nonnulls("comentarios"."publicacao_id", "comentarios"."misterio_id", "comentarios"."investigacao_id") = 1);