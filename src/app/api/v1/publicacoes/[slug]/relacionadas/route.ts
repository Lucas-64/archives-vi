import { criarManipuladoresPublicacoes } from "@/server/publicacoes/rotas";

export const dynamic = "force-dynamic";

export const GET = criarManipuladoresPublicacoes().relacionadas;
