ALTER TABLE "usuarios" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "publicacoes" ADD COLUMN "imagem_url" text;--> statement-breakpoint
ALTER TABLE "evidencias" ADD COLUMN "imagem_url" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_avatar_tamanho" CHECK ("usuarios"."avatar_url" is null or char_length("usuarios"."avatar_url") <= 400);--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_banner_tamanho" CHECK ("usuarios"."banner_url" is null or char_length("usuarios"."banner_url") <= 400);--> statement-breakpoint
ALTER TABLE "publicacoes" ADD CONSTRAINT "publicacoes_imagem_tamanho" CHECK ("publicacoes"."imagem_url" is null or char_length("publicacoes"."imagem_url") <= 400);--> statement-breakpoint
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_imagem_tamanho" CHECK ("evidencias"."imagem_url" is null or char_length("evidencias"."imagem_url") <= 400);